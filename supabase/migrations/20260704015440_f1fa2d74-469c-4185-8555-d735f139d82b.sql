
-- Tabela de blends (kits)
CREATE TABLE public.blends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sku TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  foto_path TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sku)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blends TO authenticated;
GRANT ALL ON public.blends TO service_role;
ALTER TABLE public.blends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own blends" ON public.blends
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER blends_updated_at BEFORE UPDATE ON public.blends
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Itens dos blends
CREATE TABLE public.blend_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blend_id UUID NOT NULL REFERENCES public.blends(id) ON DELETE CASCADE,
  tempero_id UUID NOT NULL REFERENCES public.temperos(id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blend_itens TO authenticated;
GRANT ALL ON public.blend_itens TO service_role;
ALTER TABLE public.blend_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own blend_itens" ON public.blend_itens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_blend_itens_blend ON public.blend_itens(blend_id);

-- Cupons de blend
CREATE TABLE public.cupons_blend (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  codigo TEXT NOT NULL,
  canal TEXT NOT NULL CHECK (canal IN ('atacado','cliente_final')),
  percentual NUMERIC(5,2) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, codigo)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cupons_blend TO authenticated;
GRANT ALL ON public.cupons_blend TO service_role;
ALTER TABLE public.cupons_blend ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cupons_blend" ON public.cupons_blend
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER cupons_blend_updated_at BEFORE UPDATE ON public.cupons_blend
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Colunas em pedidos para rastrear cupom aplicado
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS cupom_codigo TEXT,
  ADD COLUMN IF NOT EXISTS cupom_percentual NUMERIC(5,2);
