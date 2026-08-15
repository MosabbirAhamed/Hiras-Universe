-- =============================================================================
-- Supabase Seed — initial data from existing JSON files
-- Run this AFTER supabase-schema.sql
-- (settings already seeded in schema; this seeds categories & products)
-- =============================================================================

-- ── CATEGORIES ────────────────────────────────────────────────────────────────
INSERT INTO categories (id, name, slug, description, image, active, sort_order)
VALUES
  ('c-1', 'Tupi', 'tupi', 'Traditional and modern Islamic prayer caps', NULL, true, 1)
ON CONFLICT (id) DO NOTHING;

-- ── PRODUCTS ──────────────────────────────────────────────────────────────────
INSERT INTO products (
  id, name, slug, description, has_variants, attributes, variants,
  price, sale_price, sku, stock, category_id, images, featured, new_arrival, active, sort_order
)
VALUES
  (
    'p-1', 'Classic White Tupi', 'classic-white-tupi',
    'Soft cotton tupi with classic finish.',
    false, '[]', '[]',
    1250, NULL, 'TUPI-CL-WHT', 120,
    'c-1', ARRAY['/products/classic-white-tupi.png'],
    true, false, true, 1
  ),
  (
    'p-2', 'Premium Cotton Tupi', 'premium-cotton-tupi',
    'Finely woven cotton for daily comfort.',
    false, '[]', '[]',
    1350, 1099, 'TUPI-PC-001', 60,
    'c-1', ARRAY['/products/premium-cotton-tupi.png'],
    true, true, true, 2
  ),
  (
    'p-5', 'Signature Handcrafted Tupi', 'signature-handcrafted-tupi',
    'Artisan modest tupi crafted from fine breathable cotton with subtle geometric stitching.',
    true,
    '[{"id":"attr-size","name":"Size","values":["52","54","56"]}]',
    '[{"id":"v-p3-52","sku":"TUPI-SIG-52","attributes":{"Size":"52"},"price":1650,"salePrice":null,"stock":25,"lowStockThreshold":5,"stockStatus":"in_stock","active":true},{"id":"v-p3-54","sku":"TUPI-SIG-54","attributes":{"Size":"54"},"price":1650,"salePrice":1450,"stock":15,"lowStockThreshold":5,"stockStatus":"in_stock","active":true},{"id":"v-p3-56","sku":"TUPI-SIG-56","attributes":{"Size":"56"},"price":1750,"salePrice":null,"stock":4,"lowStockThreshold":5,"stockStatus":"low_stock","active":true}]',
    1650, NULL, 'TUPI-SIG', 44,
    'c-1', ARRAY['/products/classic-white-tupi.png'],
    true, true, true, 3
  )
ON CONFLICT (id) DO NOTHING;
