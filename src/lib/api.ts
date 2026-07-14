import { supabase } from "@/integrations/supabase/client";
import { Tempero, Variaveis, VARIAVEIS_INICIAIS, TEMPEROS_SEED, TabelaNutricional, CustosFixosOverride, PoliticaComercial, POLITICA_INICIAL } from "@/data/temperos";

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

  markup_distribuidor: number | null;
  markup_atacado: number;
  markup_cliente: number;
  contabilidade_mensal: number;
  producao_estimada: number;
  politica_comercial: PoliticaComercial | null;
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
  custosFixosOverride: (r.custos_fixos_override as CustosFixosOverride) ?? undefined,
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

  markupDistribuidor: Number(r.markup_distribuidor ?? 1.4),
  markupAtacado: Number(r.markup_atacado),
  markupCliente: Number(r.markup_cliente),
  contabilidadeMensal: Number(r.contabilidade_mensal ?? 500),
  producaoEstimada: Number(r.producao_estimada ?? 2000),
  politicaComercial: mergePolitica(r.politica_comercial as PoliticaComercial | null),
});

/** Garante que políticas persistidas antes da Onda 1 recebam os novos campos padrão. */
const mergePolitica = (p: PoliticaComercial | null): PoliticaComercial => {
  if (!p) return POLITICA_INICIAL;
  return {
    canais: p.canais ?? POLITICA_INICIAL.canais,
    custos: {
      taxaCartaoCliente:
        p.custos?.taxaCartaoCliente ?? POLITICA_INICIAL.custos.taxaCartaoCliente,
    },
    alertas: {
      ...POLITICA_INICIAL.alertas,
      ...(p.alertas ?? {}),
    },
  };
};

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
    // upsert com ignoreDuplicates evita reseed em corridas concorrentes
    // (StrictMode duplo-mount, listener de refresh, etc.). Depende do índice
    // UNIQUE(user_id, nome) em public.temperos.
    const { error: e2 } = await supabase
      .from("temperos")
      .upsert(insertRows, { onConflict: "user_id,nome", ignoreDuplicates: true });
    if (e2) throw e2;
    const { data: seeded, error: e3 } = await supabase
      .from("temperos")
      .select("*")
      .eq("user_id", userId)
      .order("ordem", { ascending: true });
    if (e3) throw e3;
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
    custos_fixos_override: t.custosFixosOverride ?? null,
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
        markup_industria: v.markupAtacado,
        markup_distribuidor: v.markupDistribuidor,
        markup_atacado: v.markupAtacado,
        markup_cliente: v.markupCliente,
        contabilidade_mensal: v.contabilidadeMensal,
        producao_estimada: v.producaoEstimada,
        politica_comercial: v.politicaComercial as any,
      }).select("*").single();
    if (e2) throw e2;
    return toVariaveis(created as unknown as DbVariaveis);
  }
  return toVariaveis(data as unknown as DbVariaveis);
};

export const saveVariaveis = async (userId: string, v: Variaveis) => {
  const { error } = await supabase.from("variaveis").upsert({
    user_id: userId,
    pote: v.pote, lacre: v.lacre, rotulo: v.rotulo, caixa: v.caixa,
    termoencolhivel: v.termoencolhivel,
    simples_nacional: v.simplesNacional, custo_fabril: v.custoFabril,
    comissao: v.comissao, transporte: v.transporte,
    markup_industria: v.markupAtacado,
    markup_distribuidor: v.markupDistribuidor,
    markup_atacado: v.markupAtacado,
    markup_cliente: v.markupCliente,
    contabilidade_mensal: v.contabilidadeMensal,
    producao_estimada: v.producaoEstimada,
    politica_comercial: v.politicaComercial as any,
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
