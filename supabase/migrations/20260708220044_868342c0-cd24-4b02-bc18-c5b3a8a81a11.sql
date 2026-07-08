ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_canal_check;
ALTER TABLE public.pedidos ADD CONSTRAINT pedidos_canal_check
  CHECK (canal IN ('distribuidor','atacado','cliente_final'));

ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS clientes_tipo_check;
ALTER TABLE public.clientes ADD CONSTRAINT clientes_tipo_check
  CHECK (tipo IN ('distribuidor','atacado','cliente_final'));