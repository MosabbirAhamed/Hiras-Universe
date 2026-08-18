-- Hira's Universe catalog seed
-- Run after scripts/supabase-schema.sql and scripts/supabase-seed.sql.
-- Idempotent by deterministic category/product slugs. New products intentionally have no media.

DO $$
DECLARE
  department record;
  leaf record;
  product_index integer;
  product_slug text;
  product_name text;
  base_price integer;
  sale_price integer;
  product_id text;
  product_sku text;
  has_variants boolean;
  product_attributes jsonb;
  product_variants jsonb;
BEGIN
  INSERT INTO categories (id, name, slug, description, featured, active, sort_order)
  VALUES
    ('seed-women', 'Women', 'women', 'Refined modestwear for every occasion.', true, true, 10),
    ('seed-men', 'Men', 'men', 'Timeless modest essentials for him.', true, true, 20),
    ('seed-kids', 'Kids', 'kids', 'Comfortable modest styles for growing wardrobes.', true, true, 30),
    ('seed-tupi', 'Tupi', 'tupi', 'Traditional and modern prayer caps, finished with care.', true, true, 40)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO categories (id, name, slug, description, parent_id, featured, active, sort_order)
  VALUES
    ('seed-women-hijabs', 'Hijabs', 'women-hijabs', 'Everyday and occasion hijabs in fluid, breathable fabrics.', (SELECT id FROM categories WHERE slug = 'women'), true, true, 11),
    ('seed-women-abayas', 'Abayas', 'women-abayas', 'Elegant abayas with graceful movement and considered detail.', (SELECT id FROM categories WHERE slug = 'women'), true, true, 12),
    ('seed-women-dresses', 'Modest Dresses', 'women-modest-dresses', 'Easy modest dresses for work, weekends, and gatherings.', (SELECT id FROM categories WHERE slug = 'women'), true, true, 13),
    ('seed-women-khimars', 'Khimars', 'women-khimars', 'Coverage-first khimars designed for effortless layering.', (SELECT id FROM categories WHERE slug = 'women'), true, true, 14),
    ('seed-women-prayer', 'Prayer Wear', 'women-prayer-wear', 'Soft prayer sets made for quiet daily rituals.', (SELECT id FROM categories WHERE slug = 'women'), false, true, 15),
    ('seed-women-tunics', 'Tunics', 'women-tunics', 'Polished longline tunics for versatile modest dressing.', (SELECT id FROM categories WHERE slug = 'women'), false, true, 16),
    ('seed-women-sets', 'Co-ord Sets', 'women-co-ord-sets', 'Coordinated modest sets with a clean editorial silhouette.', (SELECT id FROM categories WHERE slug = 'women'), false, true, 17),
    ('seed-men-panjabi', 'Panjabi', 'men-panjabi', 'Classic panjabi cuts for celebrations and everyday elegance.', (SELECT id FROM categories WHERE slug = 'men'), true, true, 21),
    ('seed-men-jubba', 'Jubba', 'men-jubba', 'Relaxed jubbas in breathable fabrics and quiet tones.', (SELECT id FROM categories WHERE slug = 'men'), true, true, 22),
    ('seed-men-thobes', 'Thobes', 'men-thobes', 'Clean-lined thobes for prayer, travel, and occasions.', (SELECT id FROM categories WHERE slug = 'men'), true, true, 23),
    ('seed-men-waistcoats', 'Waistcoats', 'men-waistcoats', 'Tailored waistcoats to finish festive looks.', (SELECT id FROM categories WHERE slug = 'men'), false, true, 24),
    ('seed-men-shirts', 'Modest Shirts', 'men-modest-shirts', 'Relaxed modest shirts with a refined fit.', (SELECT id FROM categories WHERE slug = 'men'), false, true, 25),
    ('seed-men-sets', 'Menswear Sets', 'men-menswear-sets', 'Thoughtful matching sets for a complete look.', (SELECT id FROM categories WHERE slug = 'men'), false, true, 26),
    ('seed-kids-boys', 'Boys Panjabi', 'kids-boys-panjabi', 'Comfortable panjabis for boys on special days.', (SELECT id FROM categories WHERE slug = 'kids'), true, true, 31),
    ('seed-kids-girls', 'Girls Dresses', 'kids-girls-dresses', 'Playful modest dresses made for movement.', (SELECT id FROM categories WHERE slug = 'kids'), true, true, 32),
    ('seed-kids-hijab', 'Kids Hijab', 'kids-hijab', 'Lightweight first hijabs for growing confidence.', (SELECT id FROM categories WHERE slug = 'kids'), true, true, 33),
    ('seed-kids-prayer', 'Kids Prayer Wear', 'kids-prayer-wear', 'Soft prayer essentials for little worshippers.', (SELECT id FROM categories WHERE slug = 'kids'), false, true, 34),
    ('seed-kids-sets', 'Kids Co-ords', 'kids-co-ords', 'Easy matching modest sets for everyday adventures.', (SELECT id FROM categories WHERE slug = 'kids'), false, true, 35),
    ('seed-tupi-classic', 'Classic Tupi', 'tupi-classic', 'Traditional cotton tupis for daily prayer.', (SELECT id FROM categories WHERE slug = 'tupi'), true, true, 41),
    ('seed-tupi-embroidered', 'Embroidered Tupi', 'tupi-embroidered', 'Hand-finished tupis with subtle geometric detail.', (SELECT id FROM categories WHERE slug = 'tupi'), true, true, 42),
    ('seed-tupi-premium', 'Premium Tupi', 'tupi-premium', 'Fine woven tupis with a polished finish.', (SELECT id FROM categories WHERE slug = 'tupi'), true, true, 43),
    ('seed-tupi-winter', 'Winter Tupi', 'tupi-winter', 'Warm textured tupis for cooler evenings.', (SELECT id FROM categories WHERE slug = 'tupi'), false, true, 44)
  ON CONFLICT (slug) DO NOTHING;

  FOR leaf IN
    SELECT c.id, c.name, c.slug, p.slug AS department_slug
    FROM categories c
    JOIN categories p ON p.id = c.parent_id
    WHERE c.slug LIKE 'women-%' OR c.slug LIKE 'men-%' OR c.slug LIKE 'kids-%' OR c.slug LIKE 'tupi-%'
  LOOP
    base_price := CASE leaf.department_slug
      WHEN 'women' THEN 1450
      WHEN 'men' THEN 1650
      WHEN 'kids' THEN 850
      ELSE 750
    END + ((length(leaf.slug) * 25) % 500);

    FOR product_index IN 1..10 LOOP
      product_slug := 'seed-' || leaf.slug || '-' || lpad(product_index::text, 2, '0');
      product_id := product_slug;
      product_sku := upper(replace(product_slug, '-', '_'));
      product_name := CASE product_index
        WHEN 1 THEN 'Signature ' || leaf.name
        WHEN 2 THEN 'Everyday ' || leaf.name
        WHEN 3 THEN 'Soft Cotton ' || leaf.name
        WHEN 4 THEN 'Linen Blend ' || leaf.name
        WHEN 5 THEN 'Embroidered ' || leaf.name
        WHEN 6 THEN 'Essential ' || leaf.name
        WHEN 7 THEN 'Premium ' || leaf.name
        WHEN 8 THEN 'Classic ' || leaf.name
        WHEN 9 THEN 'Occasion ' || leaf.name
        ELSE 'Heritage ' || leaf.name
      END;
      sale_price := CASE WHEN product_index IN (3, 7, 10) THEN base_price - (150 + product_index * 10) ELSE NULL END;
      has_variants := leaf.department_slug = 'tupi' AND product_index IN (1, 4, 7, 10);
      product_attributes := CASE WHEN has_variants
        THEN '[{"id":"attr-size","name":"Size","values":["52","54","56"]}]'::jsonb
        ELSE '[]'::jsonb END;
      product_variants := CASE WHEN has_variants
        THEN jsonb_build_array(
          jsonb_build_object('id', product_id || '-52', 'sku', product_sku || '-52', 'attributes', jsonb_build_object('Size','52'), 'price', base_price, 'salePrice', sale_price, 'stock', 24, 'lowStockThreshold', 5, 'stockStatus', 'in_stock', 'active', true),
          jsonb_build_object('id', product_id || '-54', 'sku', product_sku || '-54', 'attributes', jsonb_build_object('Size','54'), 'price', base_price, 'salePrice', sale_price, 'stock', 18, 'lowStockThreshold', 5, 'stockStatus', 'in_stock', 'active', true),
          jsonb_build_object('id', product_id || '-56', 'sku', product_sku || '-56', 'attributes', jsonb_build_object('Size','56'), 'price', base_price + 100, 'salePrice', sale_price, 'stock', 8, 'lowStockThreshold', 5, 'stockStatus', 'in_stock', 'active', true)
        )
        ELSE '[]'::jsonb END;

      INSERT INTO products (
        id, name, slug, description, short_description, has_variants, attributes, variants,
        price, sale_price, sku, stock, low_stock_threshold, stock_status, category_id,
        brand, tags, images, primary_image, featured, new_arrival, bestseller, on_sale,
        active, visibility, sort_order, dimensions, seo_title, seo_description, seo_keywords
      ) VALUES (
        product_id,
        product_name,
        product_slug,
        product_name || ' from Hira''s Universe, designed with comfort, coverage, and enduring style in mind.',
        'A considered modest essential for the modern wardrobe.',
        has_variants,
        product_attributes,
        product_variants,
        base_price,
        sale_price,
        product_sku,
        CASE WHEN has_variants THEN 50 ELSE 36 + product_index * 4 END,
        5,
        'in_stock',
        leaf.id,
        'Hira''s Universe',
        ARRAY[lower(leaf.name), leaf.department_slug, 'modestwear'],
        ARRAY[]::text[],
        NULL,
        product_index IN (1, 2),
        product_index IN (1, 6),
        product_index = 1,
        sale_price IS NOT NULL,
        true,
        'public',
        product_index,
        '{}'::jsonb,
        product_name || ' | Hira''s Universe',
        'Shop ' || product_name || ' with considered modest design and comfortable everyday wear.',
        ARRAY[lower(leaf.name), leaf.department_slug, 'modest fashion']
      ) ON CONFLICT (slug) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Curate exactly the first two visible products for each department root without
-- replacing existing selections or appending the same IDs on repeat runs.
UPDATE categories parent
SET selected_product_ids = COALESCE(parent.selected_product_ids, '{}') || ARRAY(
  SELECT picked_id
  FROM unnest(picks.ids) AS picked_id
  WHERE NOT (picked_id = ANY(COALESCE(parent.selected_product_ids, '{}')))
)
FROM (
  SELECT parent_id, array_agg(id ORDER BY sort_order, id) AS ids
  FROM (
    SELECT c.parent_id, p.id, p.sort_order,
           row_number() OVER (PARTITION BY c.parent_id ORDER BY p.sort_order, p.id) AS product_rank
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.id LIKE 'seed-%' AND p.active = true
  ) ranked
  WHERE product_rank <= 2
  GROUP BY parent_id
) picks
WHERE parent.id = picks.parent_id;

-- Complete the managed storefront roots without replacing existing custom links.
-- Existing items are retained; missing deterministic catalog links are appended.
DO $$
DECLARE
 current_navigation jsonb;
 required_navigation jsonb := jsonb_build_array(
   jsonb_build_object('id', 'seed-nav-women', 'label', 'Women', 'url', '/category/women', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 10, 'children', jsonb_build_array(
     jsonb_build_object('id', 'seed-nav-women-hijabs', 'label', 'Hijabs', 'url', '/category/women-hijabs', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 11, 'children', '[]'::jsonb),
     jsonb_build_object('id', 'seed-nav-women-abayas', 'label', 'Abayas', 'url', '/category/women-abayas', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 12, 'children', '[]'::jsonb)
   )),
   jsonb_build_object('id', 'seed-nav-men', 'label', 'Men', 'url', '/category/men', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 20, 'children', jsonb_build_array(
     jsonb_build_object('id', 'seed-nav-men-panjabi', 'label', 'Panjabi', 'url', '/category/men-panjabi', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 21, 'children', '[]'::jsonb),
     jsonb_build_object('id', 'seed-nav-men-jubba', 'label', 'Jubba', 'url', '/category/men-jubba', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 22, 'children', '[]'::jsonb)
   )),
   jsonb_build_object('id', 'seed-nav-kids', 'label', 'Kids', 'url', '/category/kids', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 30, 'children', jsonb_build_array(
     jsonb_build_object('id', 'seed-nav-kids-boys', 'label', 'Boys Panjabi', 'url', '/category/kids-boys-panjabi', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 31, 'children', '[]'::jsonb),
     jsonb_build_object('id', 'seed-nav-kids-girls', 'label', 'Girls Dresses', 'url', '/category/kids-girls-dresses', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 32, 'children', '[]'::jsonb)
   )),
   jsonb_build_object('id', 'seed-nav-tupi', 'label', 'Tupi', 'url', '/category/tupi', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 40, 'children', jsonb_build_array(
     jsonb_build_object('id', 'seed-nav-tupi-classic', 'label', 'Classic Tupi', 'url', '/category/tupi-classic', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 41, 'children', '[]'::jsonb),
     jsonb_build_object('id', 'seed-nav-tupi-premium', 'label', 'Premium Tupi', 'url', '/category/tupi-premium', 'type', 'category', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 42, 'children', '[]'::jsonb)
   )),
   jsonb_build_object('id', 'seed-nav-collections', 'label', 'Collections', 'url', '/products', 'type', 'custom', 'active', true, 'desktopVisible', true, 'mobileVisible', true, 'location', 'header', 'order', 50, 'children', '[]'::jsonb)
 );
 item jsonb;
 child_item jsonb;
 item_index integer;
 child_index integer;
 existing_item jsonb;
 existing_child jsonb;
 merged_item jsonb;
 merged_children jsonb;
BEGIN
 SELECT value INTO current_navigation FROM settings WHERE key = 'navigation';
 current_navigation := CASE WHEN jsonb_typeof(current_navigation) = 'array' THEN current_navigation ELSE '[]'::jsonb END;
 FOR item IN SELECT value FROM jsonb_array_elements(required_navigation)
 LOOP
   SELECT ordinal - 1, existing
     INTO item_index, existing_item
     FROM jsonb_array_elements(current_navigation) WITH ORDINALITY AS roots(existing, ordinal)
     WHERE existing->>'id' = item->>'id'
        OR lower(existing->>'label') = lower(item->>'label')
     LIMIT 1;

   IF item_index IS NULL THEN
     current_navigation := current_navigation || jsonb_build_array(item);
   ELSE
     -- Preserve custom root fields and children, then merge required children by
     -- stable ID or label instead of replacing the existing tree branch.
     merged_item := existing_item || (item - 'id' - 'children');
     merged_children := CASE
       WHEN jsonb_typeof(existing_item->'children') = 'array' THEN existing_item->'children'
       ELSE '[]'::jsonb
     END;

     FOR child_item IN SELECT value FROM jsonb_array_elements(
       CASE WHEN jsonb_typeof(item->'children') = 'array' THEN item->'children' ELSE '[]'::jsonb END
     )
     LOOP
       SELECT ordinal - 1, existing
         INTO child_index, existing_child
         FROM jsonb_array_elements(merged_children) WITH ORDINALITY AS children(existing, ordinal)
         WHERE existing->>'id' = child_item->>'id'
            OR lower(existing->>'label') = lower(child_item->>'label')
         LIMIT 1;

       IF child_index IS NULL THEN
         merged_children := merged_children || jsonb_build_array(child_item);
       ELSE
         merged_children := jsonb_set(
           merged_children,
           ARRAY[child_index::text],
           existing_child || (child_item - 'id' - 'children')
         );
       END IF;

       child_index := NULL;
       existing_child := NULL;
     END LOOP;

     merged_item := jsonb_set(merged_item, '{children}', merged_children);
     current_navigation := jsonb_set(
       current_navigation,
       ARRAY[item_index::text],
       merged_item
     );
   END IF;

   item_index := NULL;
   existing_item := NULL;
 END LOOP;
 INSERT INTO settings (key, value) VALUES ('navigation', current_navigation)
 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END $$;
