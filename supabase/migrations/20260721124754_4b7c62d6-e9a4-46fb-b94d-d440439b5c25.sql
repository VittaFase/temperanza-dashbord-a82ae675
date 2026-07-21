
ALTER TABLE public.itens_pedido
  ADD COLUMN IF NOT EXISTS preco_base numeric,
  ADD COLUMN IF NOT EXISTS tabela_especial boolean NOT NULL DEFAULT false;

ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS tabela_especial boolean NOT NULL DEFAULT false;
