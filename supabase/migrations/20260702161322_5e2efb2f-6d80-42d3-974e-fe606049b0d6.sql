
-- ============ CLIENTES ============
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'cliente_final' CHECK (tipo IN ('atacado','cliente_final')),
  documento TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam seus clientes" ON public.clientes
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Sequência por usuário para número de pedido
CREATE TABLE public.pedido_sequencia (
  user_id UUID NOT NULL PRIMARY KEY,
  ultimo_numero INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedido_sequencia TO authenticated;
GRANT ALL ON public.pedido_sequencia TO service_role;
ALTER TABLE public.pedido_sequencia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário vê sua sequência" ON public.pedido_sequencia
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ PEDIDOS ============
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  numero INTEGER NOT NULL DEFAULT 0,
  canal TEXT NOT NULL DEFAULT 'cliente_final' CHECK (canal IN ('atacado','cliente_final')),
  status TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('rascunho','confirmado','cancelado')),
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  data_pedido TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam seus pedidos" ON public.pedidos
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_pedidos_updated_at BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_pedidos_user_data ON public.pedidos(user_id, data_pedido DESC);

-- Trigger para atribuir número sequencial por usuário
CREATE OR REPLACE FUNCTION public.tg_atribuir_numero_pedido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE novo INTEGER;
BEGIN
  INSERT INTO public.pedido_sequencia(user_id, ultimo_numero)
    VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET ultimo_numero = public.pedido_sequencia.ultimo_numero + 1
  RETURNING ultimo_numero INTO novo;
  NEW.numero := novo;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_pedidos_numero BEFORE INSERT ON public.pedidos
  FOR EACH ROW WHEN (NEW.numero = 0)
  EXECUTE FUNCTION public.tg_atribuir_numero_pedido();

-- ============ ITENS DO PEDIDO ============
CREATE TABLE public.itens_pedido (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  tempero_id UUID NOT NULL REFERENCES public.temperos(id) ON DELETE RESTRICT,
  nome_produto TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itens_pedido TO authenticated;
GRANT ALL ON public.itens_pedido TO service_role;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam seus itens" ON public.itens_pedido
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_itens_pedido ON public.itens_pedido(pedido_id);

-- Trigger de baixa/reversão de estoque
CREATE OR REPLACE FUNCTION public.tg_baixar_estoque()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE atual INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT estoque_atual INTO atual FROM public.temperos WHERE id = NEW.tempero_id FOR UPDATE;
    IF atual IS NULL THEN RAISE EXCEPTION 'Produto não encontrado'; END IF;
    IF atual < NEW.quantidade THEN
      RAISE EXCEPTION 'Estoque insuficiente para % (disponível: %, solicitado: %)', NEW.nome_produto, atual, NEW.quantidade;
    END IF;
    UPDATE public.temperos SET estoque_atual = estoque_atual - NEW.quantidade WHERE id = NEW.tempero_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.temperos SET estoque_atual = estoque_atual + OLD.quantidade WHERE id = OLD.tempero_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;
CREATE TRIGGER trg_itens_baixa_estoque
  AFTER INSERT OR DELETE ON public.itens_pedido
  FOR EACH ROW EXECUTE FUNCTION public.tg_baixar_estoque();

-- ============ NOTAS NÃO FISCAIS ============
CREATE TABLE public.notas_nao_fiscais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  conteudo JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas_nao_fiscais TO authenticated;
GRANT ALL ON public.notas_nao_fiscais TO service_role;
ALTER TABLE public.notas_nao_fiscais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários gerenciam suas notas" ON public.notas_nao_fiscais
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_notas_pedido ON public.notas_nao_fiscais(pedido_id);
