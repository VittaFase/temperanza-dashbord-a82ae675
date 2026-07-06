ALTER TABLE public.temperos
  ADD CONSTRAINT temperos_user_nome_unique UNIQUE (user_id, nome);

ALTER TABLE public.temperos
  ADD COLUMN IF NOT EXISTS shopify_product_id TEXT,
  ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT,
  ADD COLUMN IF NOT EXISTS handle_site TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS temperos_handle_site_unique
  ON public.temperos (handle_site)
  WHERE handle_site IS NOT NULL;