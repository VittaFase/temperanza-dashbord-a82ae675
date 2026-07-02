
ALTER TABLE public.temperos
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS ean TEXT,
  ADD COLUMN IF NOT EXISTS foto_path TEXT,
  ADD COLUMN IF NOT EXISTS tabela_nutricional JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS temperos_user_sku_uniq
  ON public.temperos(user_id, sku) WHERE sku IS NOT NULL AND sku <> '';

CREATE POLICY "Usuários leem suas fotos de produtos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'produtos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários fazem upload em sua pasta de produtos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'produtos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários atualizam suas fotos de produtos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'produtos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários deletam suas fotos de produtos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'produtos' AND auth.uid()::text = (storage.foldername(name))[1]);
