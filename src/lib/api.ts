import { supabase } from "@/integrations/supabase/client";
import { Tempero, Variaveis, VARIAVEIS_INICIAIS, TEMPEROS_SEED, TabelaNutricional, CustosFixosOverride } from "@/data/temperos";

type DbTempero = {
  id: string;
  nome: string;
  preco_kg: number;
  gramas_pote: number;
  estoque_atual: number;
  estoque_minimo: number;
  ordem: number;
  sku: string | null;
  ean: string | null;
  foto_path: string | null;
  tabela_nutricional: TabelaNutricional | null;
  custos_fixos_override: CustosFixosOverride | null;
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
  
  markup_atacado: number;
  markup_cliente: number;
  contabilidade_mensal: number;
  producao_estimada: number;
};

const toTempero = (r: DbTempero): Tempero => ({
  id: r.id,
  nome: r.nome,
  precoKg: Number(r.preco_kg),
  gramasPote: Number(r.gramas_pote),
  estoqueAtual: Number(r.estoque_atual ?? 0),
  estoqueMinimo: Number(r.estoque_minimo ?? 20),
  ordem: r.ordem,
  sku: r.sku ?? undefined,
  ean: r.ean ?? undefined,
  fotoPath: r.foto_path ?? undefined,
  tabelaNutricional: (r.tabela_nutricional as TabelaNutricional) ?? {},
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
  
  markupAtacado: Number(r.markup_atacado),
  markupCliente: Number(r.markup_cliente),
  contabilidadeMensal: Number(r.contabilidade_mensal ?? 500),
  producaoEstimada: Number(r.producao_estimada ?? 2000),
});

export const fetchTemperos = async (userId: string): Promise<Tempero[]> => {
  const { data, error } = await supabase
    .from("temperos")
    .select("*")
    .eq("user_id", userId)
    .order("ordem", { ascending: true });
  if (error) throw error;
  if (!data || data.length === 0) {
    const insertRows = TEMPEROS_SEED.map((t) => ({
      user_id: userId,
      nome: t.nome,
      preco_kg: t.precoKg,
      gramas_pote: t.gramasPote,
      estoque_atual: t.estoqueAtual,
      estoque_minimo: t.estoqueMinimo,
      ordem: t.ordem,
    }));
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
    estoque_atual: t.estoqueAtual,
    estoque_minimo: t.estoqueMinimo,
    ordem: t.ordem,
    sku: t.sku ?? null,
    ean: t.ean ?? null,
    foto_path: t.fotoPath ?? null,
    tabela_nutricional: t.tabelaNutricional ?? {},
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
    .insert({
      user_id: userId,
      nome: "Novo tempero",
      preco_kg: 10,
      gramas_pote: 50,
      estoque_atual: 0,
      estoque_minimo: 20,
      ordem,
    })
    .select("*")
    .single();
  if (error) throw error;
  return toTempero(data as DbTempero);
};

export const fetchVariaveis = async (userId: string): Promise<Variaveis> => {
  const { data, error } = await supabase
    .from("variaveis").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data) {
    const v = VARIAVEIS_INICIAIS;
    const { data: created, error: e2 } = await supabase
      .from("variaveis").insert({
        user_id: userId,
        pote: v.pote, lacre: v.lacre, rotulo: v.rotulo, caixa: v.caixa,
        termoencolhivel: v.termoencolhivel,
        simples_nacional: v.simplesNacional, custo_fabril: v.custoFabril,
        comissao: v.comissao, transporte: v.transporte,
        markup_industria: v.markupAtacado, markup_atacado: v.markupAtacado,
        markup_cliente: v.markupCliente,
        contabilidade_mensal: v.contabilidadeMensal,
        producao_estimada: v.producaoEstimada,
      }).select("*").single();
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
    markup_industria: v.markupAtacado, markup_atacado: v.markupAtacado,
    markup_cliente: v.markupCliente,
    contabilidade_mensal: v.contabilidadeMensal,
    producao_estimada: v.producaoEstimada,
  });
  if (error) throw error;
};

// ---------- Fotos ----------

const BUCKET = "produtos";

export const uploadFotoTempero = async (
  userId: string,
  temperoId: string,
  file: File
): Promise<string> => {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${temperoId}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
  if (error) throw error;
  return path;
};

export const getFotoSignedUrl = async (path: string): Promise<string | null> => {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
};

export const removeFotoTempero = async (path: string) => {
  await supabase.storage.from(BUCKET).remove([path]);
};
