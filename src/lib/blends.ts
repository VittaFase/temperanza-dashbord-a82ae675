import { supabase } from "@/integrations/supabase/client";
import { Tempero, Variaveis } from "@/data/temperos";
import { calcularTempero } from "@/lib/calc";

export type BlendItem = {
  tempero_id: string;
  quantidade: number;
};

export type Blend = {
  id: string;
  sku: string;
  nome: string;
  descricao: string | null;
  foto_path: string | null;
  ativo: boolean;
  ordem: number;
  itens: BlendItem[];
};

export type CupomBlend = {
  id: string;
  codigo: string;
  canal: "atacado" | "cliente_final";
  percentual: number;
  ativo: boolean;
};

export const fetchBlends = async (userId: string): Promise<Blend[]> => {
  const { data, error } = await supabase
    .from("blends")
    .select("*, itens:blend_itens(tempero_id, quantidade)")
    .eq("user_id", userId)
    .order("ordem");
  if (error) throw error;
  return (data ?? []).map((b: any) => ({
    id: b.id,
    sku: b.sku,
    nome: b.nome,
    descricao: b.descricao,
    foto_path: b.foto_path,
    ativo: b.ativo,
    ordem: b.ordem,
    itens: (b.itens ?? []).map((i: any) => ({
      tempero_id: i.tempero_id,
      quantidade: Number(i.quantidade),
    })),
  }));
};

export const fetchCupons = async (userId: string): Promise<CupomBlend[]> => {
  const { data, error } = await supabase
    .from("cupons_blend")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((c: any) => ({
    id: c.id,
    codigo: c.codigo,
    canal: c.canal,
    percentual: Number(c.percentual),
    ativo: c.ativo,
  }));
};

/** Preço unitário do pote no canal escolhido. */
export const precoUnitarioPote = (
  temperoId: string,
  temperos: Tempero[],
  variaveis: Variaveis,
  canal: "atacado" | "cliente_final"
): number => {
  const t = temperos.find((x) => x.id === temperoId);
  if (!t) return 0;
  const c = calcularTempero(t, variaveis);
  return canal === "atacado" ? c.precoAtacado : c.precoCliente;
};

/** Preço total do blend = soma (preço_pote × quantidade) para os 3 sabores. */
export const calcularPrecoBlend = (
  blend: Blend,
  temperos: Tempero[],
  variaveis: Variaveis,
  canal: "atacado" | "cliente_final"
): number => {
  return blend.itens.reduce(
    (s, i) => s + precoUnitarioPote(i.tempero_id, temperos, variaveis, canal) * i.quantidade,
    0
  );
};

/** Estoque disponível para montar N blends (limite pelo pote mais escasso). */
export const blendsDisponiveis = (blend: Blend, temperos: Tempero[]): number => {
  if (blend.itens.length === 0) return 0;
  return Math.min(
    ...blend.itens.map((i) => {
      const t = temperos.find((x) => x.id === i.tempero_id);
      return Math.floor((t?.estoqueAtual ?? 0) / i.quantidade);
    })
  );
};
