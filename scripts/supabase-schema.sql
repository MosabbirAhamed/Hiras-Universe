-- =============================================================================
-- Hira's Universe — Supabase Schema
-- Run this entire file in the Supabase SQL Editor once.
-- Order matters: categories before products (FK dependency).
-- =============================================================================

-- ── 1. CATEGORIES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id                   text PRIMARY KEY,
  name                 text NOT NULL,
  slug                 text UNIQUE,
  description          text,
  image                text,
  banner_image         text,
  parent_id            text REFERENCES categories(id) ON DELETE SET NULL,
  featured             boolean NOT NULL DEFAULT false,
  active               boolean NOT NULL DEFAULT true,
  sort_order           integer NOT NULL DEFAULT 0,
  seo_title            text,
  seo_description      text,
  selected_product_ids text[] NOT NULL DEFAULT '{}'
);

-- ── 2. PRODUCTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                  text PRIMARY KEY,
  name                text NOT NULL,
  slug                text UNIQUE,
  description         text,
  short_description   text,
  has_variants        boolean NOT NULL DEFAULT false,
  attributes          jsonb NOT NULL DEFAULT '[]',
  variants            jsonb NOT NULL DEFAULT '[]',
  price               numeric(12,2) NOT NULL DEFAULT 0,
  sale_price          numeric(12,2),
  cost_price          numeric(12,2),
  sku                 text,
  stock               integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 0,
  stock_status        text NOT NULL DEFAULT 'in_stock'
                        CHECK (stock_status IN ('in_stock','low_stock','out_of_stock')),
  category_id         text REFERENCES categories(id) ON DELETE SET NULL,
  brand               text,
  tags                text[] NOT NULL DEFAULT '{}',
  images              text[] NOT NULL DEFAULT '{}',
  primary_image       text,
  featured            boolean NOT NULL DEFAULT false,
  new_arrival         boolean NOT NULL DEFAULT false,
  bestseller          boolean NOT NULL DEFAULT false,
  on_sale             boolean NOT NULL DEFAULT false,
  active              boolean NOT NULL DEFAULT true,
  visibility          text NOT NULL DEFAULT 'public'
                        CHECK (visibility IN ('public','hidden')),
  sort_order          integer NOT NULL DEFAULT 0,
  weight              numeric(10,3),
  dimensions          jsonb NOT NULL DEFAULT '{}',
  seo_title           text,
  seo_description     text,
  seo_keywords        text[] NOT NULL DEFAULT '{}',
  canonical_url       text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Additive upgrades for projects created with an earlier schema version.
ALTER TABLE categories ADD COLUMN IF NOT EXISTS banner_image text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS selected_product_ids text[] NOT NULL DEFAULT '{}';
DO $$ BEGIN
  ALTER TABLE categories
    ADD CONSTRAINT categories_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight numeric(10,3);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions jsonb NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_keywords text[] NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS canonical_url text;
DO $$ BEGIN
  ALTER TABLE products
    ADD CONSTRAINT products_visibility_check CHECK (visibility IN ('public','hidden'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 3. ORDERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               text PRIMARY KEY,
  order_number     text UNIQUE NOT NULL,
  customer         jsonb NOT NULL DEFAULT '{}',
  shipping_address jsonb NOT NULL DEFAULT '{}',
  items            jsonb NOT NULL DEFAULT '[]',
  subtotal         numeric(12,2) NOT NULL DEFAULT 0,
  delivery_charge  numeric(12,2) NOT NULL DEFAULT 0,
  discount_total   numeric(12,2) NOT NULL DEFAULT 0,
  total            numeric(12,2) NOT NULL DEFAULT 0,
  currency         text NOT NULL DEFAULT 'BDT',
  payment_method   text NOT NULL DEFAULT 'cod'
                     CHECK (payment_method IN ('cod','bkash','nagad')),
  payment_status   text NOT NULL DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_status     text NOT NULL DEFAULT 'pending'
                     CHECK (order_status IN ('pending','processing','shipped','delivered','cancelled')),
  payment_details  jsonb,
  admin_notes      text,
  stock_deducted   boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── 4. NOTIFICATION LOGS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_logs (
  id           text PRIMARY KEY,
  order_id     text,
  order_number text NOT NULL,
  channel      text NOT NULL CHECK (channel IN ('email','sms')),
  event        text NOT NULL,
  recipient    text NOT NULL,
  status       text NOT NULL CHECK (status IN ('sent','failed','queued','mocked')),
  provider     text NOT NULL DEFAULT '',
  error        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  sent_at      timestamptz
);

-- ── 5. PAGES (CMS) ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id         text PRIMARY KEY,
  title      text NOT NULL,
  slug       text UNIQUE NOT NULL,
  content    text,
  status     text NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','published','archived')),
  seo        jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── 6. MEDIA ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id         text PRIMARY KEY,
  filename   text UNIQUE NOT NULL,
  url        text NOT NULL,
  mime_type  text NOT NULL DEFAULT '',
  size       integer NOT NULL DEFAULT 0,
  width      integer,
  height     integer,
  alt_text   text NOT NULL DEFAULT '',
  metadata   jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 7. SETTINGS (keyed single-row store) ──────────────────────────────────────
-- Keys: 'store' | 'theme' | 'navigation' | 'homepage'
CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default rows so reads always return something
INSERT INTO settings (key, value) VALUES
  ('store',      '{"storeName":"Hira''s Universe","description":"Curated modest fashion and timeless essentials.","contactEmail":"info@example.com"}'),
  ('theme',      '{"colors":{"bodyBackground":"#F6F1EB","mainBackground":"#F6F1EB","sectionBackground":"#FBFAF7","cardBackground":"#FFFFFF","primary":"#6B4F3B","secondary":"#B8A99A","accent":"#B89A6A","background":"#F6F1EB","surface":"#F3EDE7","text":"#222222","heading":"#222222","muted":"#8B8177","border":"#E8E0D6","buttonBackground":"#6B4F3B","buttonText":"#F6F1EB","buttonHover":"#513A2C","sale":"#B89A6A","saleText":"#FFFFFF","onPrimary":"#F6F1EB","link":"#6B4F3B","linkHover":"#513A2C","headerBackground":"#FFFFFF","headerText":"#222222","footerBackground":"#292724","footerText":"#F6F1EB","announcementBackground":"#6B4F3B","announcementText":"#F6F1EB","inputBackground":"#FFFFFF","inputBorder":"#D8D0C6","inputFocus":"#6B4F3B","error":"#A33A32","success":"#3F6B4F","wishlist":"#9B4D55"},"fonts":{"heading":"ui-serif, Georgia, serif","body":"ui-sans-serif, system-ui, Arial"},"layout":{"containerWidth":"1200px","borderRadius":"6px","radiusButton":"6px","radiusCard":"8px","sectionSpacing":"3rem","productImageAspect":"4/5","headerStyle":"default","footerStyle":"default"}}'),
  ('navigation', '[{"id":"n-1","label":"Women","url":"/collections/women","active":true,"order":1},{"id":"n-2","label":"Men","url":"/collections/men","active":true,"order":2},{"id":"n-3","label":"Tupi","url":"/category/tupi","active":true,"order":3}]'),
  ('homepage',   '[{"id":"s-hero","type":"hero","enabled":true,"order":0,"data":{"headline":"Elegance in Modesty","sub":"Curated modest fashion and timeless essentials.","image":"/products/hero-1.webp"}},{"id":"s-featured","type":"featured_products","enabled":true,"order":1,"data":{"productIds":["p-1","p-2"]}}]')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- ORDER NUMBER ALLOCATOR
-- =============================================================================
-- A singleton row is used instead of MAX(order_number) + 1 on every request.
-- The row is initialized from existing orders and advanced under the same
-- transaction-scoped advisory lock used by the order RPC.
CREATE TABLE IF NOT EXISTS order_number_allocator (
  id          boolean PRIMARY KEY DEFAULT true CHECK (id),
  next_suffix bigint NOT NULL CHECK (next_suffix > 0)
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_categories_parent  ON categories(parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active     ON products(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(order_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number       ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_notif_order_number  ON notification_logs(order_number);
CREATE INDEX IF NOT EXISTS idx_pages_slug          ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_media_filename      ON media(filename);

-- =============================================================================
-- RPC FUNCTION 1: create_order_with_inventory_deduction
-- Replaces the in-process JS lock in fileRepo.ts.
-- Runs inside a single transaction with FOR UPDATE locking on affected products.
-- =============================================================================
CREATE OR REPLACE FUNCTION create_order_with_inventory_deduction(
  p_order_id       text,
  p_order_number   text,
  p_customer       jsonb,
  p_shipping       jsonb,
  p_items          jsonb,   -- ValidatedOrderItem[] with productId, variantId, quantity, unitPrice, lineTotal, etc.
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
  v_item          jsonb;
  v_product       products%ROWTYPE;
  v_variants      jsonb;
  v_variant       jsonb;
  v_vid           text;
  v_idx           int;
  v_new_stock     int;
  v_derived       int;
  v_variant_found boolean;
  v_order_number  text;
  v_allocated_suffix bigint;
  v_order_row     jsonb;
BEGIN
  -- Canonical lock order prevents deadlocks for carts containing the same products.
  PERFORM p.id
    FROM products AS p
    JOIN (
      SELECT DISTINCT item->>'productId' AS product_id
        FROM jsonb_array_elements(p_items) AS item
    ) AS requested ON requested.product_id = p.id
   ORDER BY p.id
   FOR UPDATE OF p;

  -- Reconcile legacy orders before allocating from one transactionally locked row.
  -- Any later exception rolls this increment back with inventory and the order insert.
  PERFORM pg_advisory_xact_lock(hashtext('orders:order_number'));

  INSERT INTO order_number_allocator (id, next_suffix)
  SELECT true, COALESCE(MAX(substring(order_number FROM '^HN-([0-9]+)$')::bigint), 1000) + 1
    FROM orders
  ON CONFLICT (id) DO UPDATE
    SET next_suffix = GREATEST(order_number_allocator.next_suffix, EXCLUDED.next_suffix);

  UPDATE order_number_allocator
     SET next_suffix = next_suffix + 1
   WHERE id = true
  RETURNING next_suffix - 1 INTO v_allocated_suffix;

  IF v_allocated_suffix IS NULL THEN
    RAISE EXCEPTION 'order_number_allocator_unavailable';
  END IF;

  v_order_number := 'HN-' || v_allocated_suffix::text;

  -- Revalidate and deduct inventory while the product rows are locked.
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
      -- Deduct from the specific variant inside the jsonb array.
      v_variants := v_product.variants;
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
          v_variants := jsonb_set(v_variants, ARRAY[v_idx::text, 'stock'], to_jsonb(v_new_stock));
          -- Update stockStatus on the variant
          v_variants := jsonb_set(v_variants, ARRAY[v_idx::text, 'stockStatus'], to_jsonb(
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
      SELECT COALESCE(SUM((elem->>'stock')::int), 0) INTO v_derived
        FROM jsonb_array_elements(v_variants) AS elem
       WHERE (elem->>'active')::boolean IS NOT FALSE;

      UPDATE products SET
        variants     = v_variants,
        stock        = v_derived,
        stock_status = CASE WHEN v_derived <= 0 THEN 'out_of_stock'
                            WHEN v_derived <= low_stock_threshold AND low_stock_threshold > 0 THEN 'low_stock'
                            ELSE 'in_stock' END,
        updated_at   = now()
      WHERE id = v_product.id;

    ELSE
      IF v_product.has_variants THEN
        RAISE EXCEPTION 'variant_required';
      END IF;
      IF COALESCE(v_product.stock, 0) < (v_item->>'quantity')::int THEN
        RAISE EXCEPTION 'insufficient_stock';
      END IF;
      -- Simple product: deduct from product.stock directly
      v_new_stock := v_product.stock - (v_item->>'quantity')::int;
      UPDATE products SET
        stock        = v_new_stock,
        stock_status = CASE WHEN v_new_stock <= 0 THEN 'out_of_stock'
                            WHEN v_new_stock <= low_stock_threshold AND low_stock_threshold > 0 THEN 'low_stock'
                            ELSE 'in_stock' END,
        updated_at   = now()
      WHERE id = v_product.id;
    END IF;
  END LOOP;

  -- Insert the order
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

-- =============================================================================
-- RPC FUNCTION 2: update_order_status
-- Safe status transition + idempotent inventory restock on cancellation.
-- =============================================================================
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id          text,
  p_next_status       text,
  p_next_payment      text    DEFAULT NULL,
  p_admin_notes       text    DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_order      orders%ROWTYPE;
  v_item       jsonb;
  v_product    products%ROWTYPE;
  v_variants   jsonb;
  v_variant    jsonb;
  v_vid        text;
  v_idx        int;
  v_new_stock  int;
  v_derived    int;
  v_result     jsonb;
BEGIN
  -- Lock the order row
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found';
  END IF;

  -- Guard: cannot reopen a cancelled order
  IF v_order.order_status = 'cancelled' AND p_next_status <> 'cancelled' THEN
    RAISE EXCEPTION 'cancelled_order_cannot_be_reopened';
  END IF;

  -- Idempotent restock on cancellation
  IF p_next_status = 'cancelled'
     AND v_order.order_status <> 'cancelled'
     AND v_order.stock_deducted THEN

    -- Lock affected product rows
    FOR v_item IN SELECT * FROM jsonb_array_elements(v_order.items)
    LOOP
      PERFORM id FROM products WHERE id = (v_item->>'productId') FOR UPDATE;
    END LOOP;

    FOR v_item IN SELECT * FROM jsonb_array_elements(v_order.items)
    LOOP
      SELECT * INTO v_product FROM products WHERE id = (v_item->>'productId');
      IF NOT FOUND THEN CONTINUE; END IF;

      v_vid := v_item->>'variantId';

      IF v_product.has_variants AND v_vid IS NOT NULL AND v_vid <> '' THEN
        v_variants := v_product.variants;
        FOR v_idx IN 0 .. jsonb_array_length(v_variants) - 1
        LOOP
          v_variant := v_variants -> v_idx;
          IF (v_variant->>'id') = v_vid THEN
            v_new_stock := COALESCE((v_variant->>'stock')::int, 0) + (v_item->>'quantity')::int;
            v_variants := jsonb_set(v_variants, ARRAY[v_idx::text, 'stock'], to_jsonb(v_new_stock));
            v_variants := jsonb_set(v_variants, ARRAY[v_idx::text, 'stockStatus'], to_jsonb(
              CASE
                WHEN v_new_stock <= 0 THEN 'out_of_stock'
                WHEN (v_variant->>'lowStockThreshold') IS NOT NULL
                 AND v_new_stock <= (v_variant->>'lowStockThreshold')::int THEN 'low_stock'
                ELSE 'in_stock'
              END
            ));
          END IF;
        END LOOP;

        SELECT COALESCE(SUM((elem->>'stock')::int), 0) INTO v_derived
          FROM jsonb_array_elements(v_variants) AS elem
         WHERE (elem->>'active')::boolean IS NOT FALSE;

        UPDATE products SET
          variants     = v_variants,
          stock        = v_derived,
          stock_status = CASE WHEN v_derived <= 0 THEN 'out_of_stock'
                              WHEN v_derived <= low_stock_threshold AND low_stock_threshold > 0 THEN 'low_stock'
                              ELSE 'in_stock' END,
          updated_at   = now()
        WHERE id = v_product.id;

      ELSE
        v_new_stock := COALESCE(v_product.stock, 0) + (v_item->>'quantity')::int;
        UPDATE products SET
          stock        = v_new_stock,
          stock_status = CASE WHEN v_new_stock <= 0 THEN 'out_of_stock'
                              WHEN v_new_stock <= low_stock_threshold AND low_stock_threshold > 0 THEN 'low_stock'
                              ELSE 'in_stock' END,
          updated_at   = now()
        WHERE id = v_product.id;
      END IF;
    END LOOP;

    -- Mark stock as restored
    UPDATE orders SET stock_deducted = false WHERE id = p_order_id;
  END IF;

  -- Apply status update
  UPDATE orders SET
    order_status   = p_next_status,
    payment_status = COALESCE(p_next_payment, payment_status),
    admin_notes    = COALESCE(p_admin_notes, admin_notes),
    updated_at     = now()
  WHERE id = p_order_id
  RETURNING to_jsonb(orders.*) INTO v_result;

  RETURN v_result;
END;
$$;
