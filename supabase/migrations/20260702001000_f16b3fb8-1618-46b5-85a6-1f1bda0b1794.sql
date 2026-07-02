
ALTER TABLE public.temperos
  ADD COLUMN IF NOT EXISTS estoque_atual integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estoque_minimo integer NOT NULL DEFAULT 20;

ALTER TABLE public.variaveis
  ADD COLUMN IF NOT EXISTS contabilidade_mensal numeric NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS producao_estimada numeric NOT NULL DEFAULT 2000;
