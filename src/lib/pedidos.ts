import { supabase } from "@/integrations/supabase/client";

export type Cliente = {
  id: string;
  nome: string;
  tipo: "atacado" | "cliente_final";
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  observacoes?: string | null;
};

export type ItemPedido = {
  tempero_id: string;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  desconto: number;
  subtotal: number;
};

export type Pedido = {
  id: string;
  numero: number;
  cliente_id: string | null;
  canal: "atacado" | "cliente_final";
  status: "rascunho" | "confirmado" | "cancelado";
  subtotal: number;
  desconto: number;
  total: number;
  observacoes: string | null;
  data_pedido: string;
};

export type PedidoComItens = Pedido & {
  cliente: Cliente | null;
  itens: ItemPedido[];
};

// ---------- Clientes ----------
export const fetchClientes = async (userId: string): Promise<Cliente[]> => {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", userId)
    .order("nome");
  if (error) throw error;
  return (data ?? []) as Cliente[];
};

export const upsertCliente = async (
  userId: string,
  c: Partial<Cliente> & { nome: string; tipo: "atacado" | "cliente_final" }
): Promise<Cliente> => {
  const payload = { ...c, user_id: userId };
  const { data, error } = await supabase
    .from("clientes")
    .upsert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as Cliente;
};

export const deleteCliente = async (id: string) => {
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) throw error;
};

// ---------- Pedidos ----------
export const criarPedido = async (
  userId: string,
  input: {
    cliente_id: string | null;
    canal: "atacado" | "cliente_final";
    observacoes?: string;
    desconto?: number;
    itens: ItemPedido[];
  }
): Promise<PedidoComItens> => {
  const subtotal = input.itens.reduce((s, i) => s + i.subtotal, 0);
  const desconto = Math.max(0, Math.min(subtotal, input.desconto ?? 0));
  const total = subtotal - desconto;

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      user_id: userId,
      cliente_id: input.cliente_id,
      canal: input.canal,
      observacoes: input.observacoes ?? null,
      subtotal,
      desconto,
      total,
      status: "confirmado",
    })
    .select("*")
    .single();
  if (error) throw error;

  const rows = input.itens.map((i) => ({
    user_id: userId,
    pedido_id: pedido.id,
    tempero_id: i.tempero_id,
    nome_produto: i.nome_produto,
    quantidade: i.quantidade,
    preco_unitario: i.preco_unitario,
    desconto: i.desconto ?? 0,
    subtotal: i.subtotal,
  }));

  const { error: e2 } = await supabase.from("itens_pedido").insert(rows);
  if (e2) {
    await supabase.from("pedidos").delete().eq("id", pedido.id);
    throw e2;
  }

  let cliente: Cliente | null = null;
  if (input.cliente_id) {
    const { data } = await supabase.from("clientes").select("*").eq("id", input.cliente_id).maybeSingle();
    cliente = (data as Cliente) ?? null;
  }

  return { ...(pedido as Pedido), cliente, itens: input.itens };
};

export const fetchPedidos = async (userId: string, limit = 50): Promise<PedidoComItens[]> => {
  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("*, cliente:clientes(*), itens:itens_pedido(*)")
    .eq("user_id", userId)
    .order("data_pedido", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (pedidos ?? []).map((p: any) => ({
    ...p,
    subtotal: Number(p.subtotal ?? p.total ?? 0),
    desconto: Number(p.desconto ?? 0),
    total: Number(p.total ?? 0),
    cliente: p.cliente ?? null,
    itens: (p.itens ?? []).map((i: any) => ({
      tempero_id: i.tempero_id,
      nome_produto: i.nome_produto,
      quantidade: Number(i.quantidade),
      preco_unitario: Number(i.preco_unitario),
      desconto: Number(i.desconto ?? 0),
      subtotal: Number(i.subtotal),
    })),
  })) as PedidoComItens[];
};

export const cancelarPedido = async (id: string) => {
  const { error: e1 } = await supabase.from("itens_pedido").delete().eq("pedido_id", id);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from("pedidos").delete().eq("id", id);
  if (e2) throw e2;
};
