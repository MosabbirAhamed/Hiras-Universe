-- =============================================================================
-- Supabase Storage Buckets
-- Run this in the Supabase SQL Editor AFTER supabase-schema.sql
-- =============================================================================

-- Create the 'products' bucket (public — serves product & hero images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create the 'uploads' bucket (public — admin-uploaded media)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Storage RLS Policies
-- Allow public read; restrict write to service role only (server-side uploads)
-- =============================================================================

-- products bucket: anyone can read
CREATE POLICY "Public read products"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- uploads bucket: anyone can read
CREATE POLICY "Public read uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- Both buckets: only authenticated service role can insert/update/delete
-- (API routes use the service role key, so this is enforced server-side)
CREATE POLICY "Service role insert products"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'service_role');

CREATE POLICY "Service role delete products"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND auth.role() = 'service_role');

CREATE POLICY "Service role insert uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'service_role');

CREATE POLICY "Service role delete uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'uploads' AND auth.role() = 'service_role');
