import { supabase } from "@/integrations/supabase/client";
import { Tempero, Variaveis, VARIAVEIS_INICIAIS, TEMPEROS_SEED } from "@/data/temperos";

type DbTempero = {
  id: string;
  nome: string;
  preco_kg: number;
  gramas_pote: number;
  ordem: number;
};

type DbVariaveis = {
  user_id: string;
  pote: number;
  lacre: number;
  rotulo: number;
  caixa: number;
  termoencolhivel: number;
  simples_nacional: number;
  custo_fabril: number;
  comissao: number;
  transporte: number;
  markup_industria: number;
  markup_atacado: number;
  markup_cliente: number;
};

const toTempero = (r: DbTempero): Tempero => ({
  id: r.id,
  nome: r.nome,
  precoKg: Number(r.preco_kg),
  gramasPote: Number(r.gramas_pote),
  ordem: r.ordem,
});

const toVariaveis = (r: DbVariaveis): Variaveis => ({
  pote: Number(r.pote),
  lacre: Number(r.lacre),
  rotulo: Number(r.rotulo),
  caixa: Number(r.caixa),
  termoencolhivel: Number(r.termoencolhivel),
  simplesNacional: Number(r.simples_nacional),
  custoFabril: Number(r.custo_fabril),
  comissao: Number(r.comissao),
  transporte: Number(r.transporte),
  markupIndustria: Number(r.markup_industria),
  markupAtacado: Number(r.markup_atacado),
  markupCliente: Number(r.markup_cliente),
});

export const fetchTemperos = async (userId: string): Promise<Tempero[]> => {
  const { data, error } = await supabase
    .from("temperos")
    .select("*")
    .eq("user_id", userId)
    .order("ordem", { ascending: true });
  if (error) throw error;
  if (!data || data.length === 0) {
    const rows = TEMPEROS_SEED.map((t) => ({ ...t, user_id: userId, preco_kg: t.precoKg, gramas_pote: t.gramasPote }));
    const insertRows = rows.map(({ precoKg, gramasPote, ...rest }: any) => rest);
    const { data: seeded, error: e2 } = await supabase
      .from("temperos")
      .insert(insertRows)
      .select("*");
    if (e2) throw e2;
    return (seeded as DbTempero[]).map(toTempero);
  }
  return (data as DbTempero[]).map(toTempero);
};

export const upsertTempero = async (userId: string, t: Tempero) => {
  const { error } = await supabase.from("temperos").upsert({
    id: t.id,
    user_id: userId,
    nome: t.nome,
    preco_kg: t.precoKg,
    gramas_pote: t.gramasPote,
    ordem: t.ordem,
  });
  if (error) throw error;
};

export const deleteTempero = async (id: string) => {
  const { error } = await supabase.from("temperos").delete().eq("id", id);
  if (error) throw error;
};

export const createTempero = async (userId: string, ordem: number): Promise<Tempero> => {
  const { data, error } = await supabase
    .from("temperos")
    .insert({ user_id: userId, nome: "Novo tempero", preco_kg: 10, gramas_pote: 50, ordem })
    .select("*")
    .single();
  if (error) throw error;
  return toTempero(data as DbTempero);
};

export const fetchVariaveis = async (userId: string): Promise<Variaveis> => {
  const { data, error } = await supabase
    .from("variaveis")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const v = VARIAVEIS_INICIAIS;
    const { data: created, error: e2 } = await supabase
      .from("variaveis")
      .insert({
        user_id: userId,
        pote: v.pote, lacre: v.lacre, rotulo: v.rotulo, caixa: v.caixa,
        termoencolhivel: v.termoencolhivel,
        simples_nacional: v.simplesNacional, custo_fabril: v.custoFabril,
        comissao: v.comissao, transporte: v.transporte,
        markup_industria: v.markupIndustria, markup_atacado: v.markupAtacado,
        markup_cliente: v.markupCliente,
      })
      .select("*").single();
    if (e2) throw e2;
    return toVariaveis(created as DbVariaveis);
  }
  return toVariaveis(data as DbVariaveis);
};

export const saveVariaveis = async (userId: string, v: Variaveis) => {
  const { error } = await supabase.from("variaveis").upsert({
    user_id: userId,
    pote: v.pote, lacre: v.lacre, rotulo: v.rotulo, caixa: v.caixa,
    termoencolhivel: v.termoencolhivel,
    simples_nacional: v.simplesNacional, custo_fabril: v.custoFabril,
    comissao: v.comissao, transporte: v.transporte,
    markup_industria: v.markupIndustria, markup_atacado: v.markupAtacado,
    markup_cliente: v.markupCliente,
  });
  if (error) throw error;
};
