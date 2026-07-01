
CREATE TABLE public.temperos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  preco_kg NUMERIC(10,4) NOT NULL DEFAULT 0,
  gramas_pote NUMERIC(10,2) NOT NULL DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.temperos TO authenticated;
GRANT ALL ON public.temperos TO service_role;
ALTER TABLE public.temperos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam seus temperos" ON public.temperos
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX temperos_user_ordem_idx ON public.temperos(user_id, ordem);

CREATE TABLE public.variaveis (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pote NUMERIC(10,4) NOT NULL DEFAULT 0.95,
  lacre NUMERIC(10,4) NOT NULL DEFAULT 0.03,
  rotulo NUMERIC(10,4) NOT NULL DEFAULT 0.44,
  caixa NUMERIC(10,4) NOT NULL DEFAULT 0.12,
  termoencolhivel NUMERIC(10,4) NOT NULL DEFAULT 0.10,
  simples_nacional NUMERIC(6,3) NOT NULL DEFAULT 4.9,
  custo_fabril NUMERIC(6,3) NOT NULL DEFAULT 6,
  comissao NUMERIC(6,3) NOT NULL DEFAULT 5,
  transporte NUMERIC(6,3) NOT NULL DEFAULT 3,
  markup_industria NUMERIC(6,3) NOT NULL DEFAULT 2.3,
  markup_atacado NUMERIC(6,3) NOT NULL DEFAULT 2.3,
  markup_cliente NUMERIC(6,3) NOT NULL DEFAULT 4.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.variaveis TO authenticated;
GRANT ALL ON public.variaveis TO service_role;
ALTER TABLE public.variaveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam suas variáveis" ON public.variaveis
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER temperos_updated BEFORE UPDATE ON public.temperos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER variaveis_updated BEFORE UPDATE ON public.variaveis
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
