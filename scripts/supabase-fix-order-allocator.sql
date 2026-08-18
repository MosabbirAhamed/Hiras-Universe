-- =============================================================================
-- Hira's Universe — Order-Number Allocator Migration
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- This script is FULLY IDEMPOTENT — safe to re-run without data loss.
-- It does NOT delete existing orders, products, or any other data.
-- =============================================================================

-- ── 1. Ensure the allocator singleton table exists ────────────────────────────
CREATE TABLE IF NOT EXISTS order_number_allocator (
  id          boolean PRIMARY KEY DEFAULT true CHECK (id),
  next_suffix bigint NOT NULL CHECK (next_suffix > 0)
);

-- ── 2. Seed / reconcile the allocator row from any existing orders ─────────────
-- If the row already exists we bump it up to at least max(existing) + 1.
-- If it does not exist we start from max(existing) + 1, with a floor of 1001.
INSERT INTO order_number_allocator (id, next_suffix)
SELECT true,
       COALESCE(
         MAX(NULLIF(substring(order_number FROM '^HN-([0-9]+)$'), '')::bigint),
         1000
       ) + 1
  FROM orders
ON CONFLICT (id) DO UPDATE
  SET next_suffix = GREATEST(
        order_number_allocator.next_suffix,
        EXCLUDED.next_suffix
      );

-- ── 3. Replace the order-creation RPC with the advisory-lock safe version ──────
-- DROP first so the argument list change (if any) is accepted cleanly.
DROP FUNCTION IF EXISTS create_order_with_inventory_deduction(
  text, text, jsonb, jsonb, jsonb, numeric, numeric, numeric, numeric, text, text, jsonb
);

CREATE OR REPLACE FUNCTION create_order_with_inventory_deduction(
  p_order_id       text,
  p_order_number   text,          -- legacy fallback; ignored by this version
  p_customer       jsonb,
  p_shipping       jsonb,
  p_items          jsonb,
  p_subtotal       numeric,
  p_delivery       numeric,
  p_discount       numeric,
  p_total          numeric,
  p_currency       text,
  p_payment_method text,
  p_payment_details jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_item             jsonb;
  v_product          products%ROWTYPE;
  v_variants         jsonb;
  v_variant          jsonb;
  v_vid              text;
  v_idx              int;
  v_new_stock        int;
  v_derived          int;
  v_variant_found    boolean;
  v_order_number     text;
  v_allocated_suffix bigint;
  v_order_row        jsonb;
BEGIN
  -- ── Lock all affected product rows in a canonical order (prevents deadlocks) ──
  PERFORM p.id
    FROM products AS p
    JOIN (
      SELECT DISTINCT item->>'productId' AS product_id
        FROM jsonb_array_elements(p_items) AS item
    ) AS requested ON requested.product_id = p.id
   ORDER BY p.id
   FOR UPDATE OF p;

  -- ── Acquire a transaction-scoped advisory lock for order-number generation ────
  -- Only ONE concurrent call can be inside this section at a time.
  PERFORM pg_advisory_xact_lock(hashtext('orders:order_number'));

  -- ── Reconcile allocator with any orders inserted outside this function ────────
  INSERT INTO order_number_allocator (id, next_suffix)
  SELECT true,
         COALESCE(
           MAX(NULLIF(substring(order_number FROM '^HN-([0-9]+)$'), '')::bigint),
           1000
         ) + 1
    FROM orders
  ON CONFLICT (id) DO UPDATE
    SET next_suffix = GREATEST(
          order_number_allocator.next_suffix,
          EXCLUDED.next_suffix
        );

  -- ── Atomically claim the next suffix ─────────────────────────────────────────
  UPDATE order_number_allocator
     SET next_suffix = next_suffix + 1
   WHERE id = true
  RETURNING next_suffix - 1 INTO v_allocated_suffix;

  IF v_allocated_suffix IS NULL THEN
    RAISE EXCEPTION 'order_number_allocator_unavailable';
  END IF;

  v_order_number := 'HN-' || v_allocated_suffix::text;

  -- ── Revalidate stock and deduct while rows are locked ────────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    IF COALESCE((v_item->>'quantity')::int, 0) <= 0 THEN
      RAISE EXCEPTION 'invalid_quantity';
    END IF;

    SELECT * INTO v_product FROM products WHERE id = (v_item->>'productId');
    IF NOT FOUND THEN
      RAISE EXCEPTION 'product_not_found';
    END IF;
    IF NOT v_product.active THEN
      RAISE EXCEPTION 'product_unavailable';
    END IF;

    v_vid := v_item->>'variantId';

    IF v_product.has_variants AND v_vid IS NOT NULL AND v_vid <> '' THEN
      -- Deduct from the specific variant inside the jsonb array
      v_variants      := v_product.variants;
      v_variant_found := false;

      FOR v_idx IN 0 .. jsonb_array_length(v_variants) - 1
      LOOP
        v_variant := v_variants -> v_idx;
        IF (v_variant->>'id') = v_vid THEN
          v_variant_found := true;
          IF (v_variant->>'active')::boolean IS FALSE THEN
            RAISE EXCEPTION 'variant_unavailable';
          END IF;
          IF COALESCE((v_variant->>'stock')::int, 0) < (v_item->>'quantity')::int THEN
            RAISE EXCEPTION 'insufficient_stock';
          END IF;
          v_new_stock := (v_variant->>'stock')::int - (v_item->>'quantity')::int;
          v_variants  := jsonb_set(v_variants, ARRAY[v_idx::text, 'stock'], to_jsonb(v_new_stock));
          v_variants  := jsonb_set(v_variants, ARRAY[v_idx::text, 'stockStatus'], to_jsonb(
            CASE
              WHEN v_new_stock <= 0 THEN 'out_of_stock'
              WHEN (v_variant->>'lowStockThreshold') IS NOT NULL
               AND v_new_stock <= (v_variant->>'lowStockThreshold')::int THEN 'low_stock'
              ELSE 'in_stock'
            END
          ));
        END IF;
      END LOOP;

      IF NOT v_variant_found THEN
        RAISE EXCEPTION 'variant_not_found';
      END IF;

      -- Recalculate parent stock as sum of active variants
      SELECT COALESCE(SUM((elem->>'stock')::int), 0)
        INTO v_derived
        FROM jsonb_array_elements(v_variants) AS elem
       WHERE (elem->>'active')::boolean IS NOT FALSE;

      UPDATE products SET
        variants     = v_variants,
        stock        = v_derived,
        stock_status = CASE
                         WHEN v_derived <= 0 THEN 'out_of_stock'
                         WHEN v_derived <= low_stock_threshold AND low_stock_threshold > 0 THEN 'low_stock'
                         ELSE 'in_stock'
                       END,
        updated_at   = now()
      WHERE id = v_product.id;

    ELSE
      IF v_product.has_variants THEN
        RAISE EXCEPTION 'variant_required';
      END IF;
      IF COALESCE(v_product.stock, 0) < (v_item->>'quantity')::int THEN
        RAISE EXCEPTION 'insufficient_stock';
      END IF;
      v_new_stock := v_product.stock - (v_item->>'quantity')::int;
      UPDATE products SET
        stock        = v_new_stock,
        stock_status = CASE
                         WHEN v_new_stock <= 0 THEN 'out_of_stock'
                         WHEN v_new_stock <= low_stock_threshold AND low_stock_threshold > 0 THEN 'low_stock'
                         ELSE 'in_stock'
                       END,
        updated_at   = now()
      WHERE id = v_product.id;
    END IF;
  END LOOP;

  -- ── Insert the order ──────────────────────────────────────────────────────────
  INSERT INTO orders (
    id, order_number, customer, shipping_address, items,
    subtotal, delivery_charge, discount_total, total, currency,
    payment_method, payment_status, order_status,
    payment_details, stock_deducted, created_at, updated_at
  ) VALUES (
    p_order_id, v_order_number, p_customer, p_shipping, p_items,
    p_subtotal, p_delivery, p_discount, p_total, p_currency,
    p_payment_method, 'pending', 'pending',
    p_payment_details, true, now(), now()
  )
  RETURNING to_jsonb(orders.*) INTO v_order_row;

  RETURN v_order_row;
END;
$$;

-- ── 4. Ensure the unique constraint is present on orders.order_number ──────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
     WHERE table_name = 'orders'
       AND constraint_type = 'UNIQUE'
       AND constraint_name = 'orders_order_number_key'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
  END IF;
END $$;

-- ── 5. Done ───────────────────────────────────────────────────────────────────
-- After running, verify with:
--   SELECT * FROM order_number_allocator;
--   SELECT id, order_number FROM orders ORDER BY created_at DESC LIMIT 5;
