-- =============================================================================
-- Hira''s Universe -- Supabase Data API Grants
-- Run this in the Supabase SQL Editor.
-- "Automatically expose new tables" was OFF when the project was created,
-- so these grants were never applied. RLS remains ENABLED on all tables.
-- =============================================================================

-- ── service_role grants (server-side sb_secret key) ──────────────────────────
-- service_role bypasses RLS automatically (BYPASSRLS privilege).
-- We only need GRANT so PostgREST allows the request through.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories        TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products          TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders            TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages             TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media             TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings          TO service_role;

GRANT EXECUTE ON FUNCTION public.create_order_with_inventory_deduction TO service_role;
GRANT EXECUTE ON FUNCTION public.update_order_status                   TO service_role;

-- ── anon grants (public website reads via sb_publishable key) ────────────────
-- anon gets SELECT only on products and categories.
-- All other tables (orders, settings, etc.) stay inaccessible to anon.

GRANT SELECT ON public.products   TO anon;
GRANT SELECT ON public.categories TO anon;

-- ── RLS policies for anon public reads ───────────────────────────────────────
-- Products: only active products are publicly visible.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'anon_read_active_products'
  ) THEN
    CREATE POLICY "anon_read_active_products"
      ON public.products FOR SELECT TO anon
      USING (active = true);
  END IF;
END $$;

-- Categories: only active categories are publicly visible.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'anon_read_active_categories'
  ) THEN
    CREATE POLICY "anon_read_active_categories"
      ON public.categories FOR SELECT TO anon
      USING (active = true);
  END IF;
END $$;

-- ── Enable RLS on all tables (idempotent) ────────────────────────────────────
-- service_role bypasses these automatically.
-- anon is subject to the policies above.
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings          ENABLE ROW LEVEL SECURITY;
