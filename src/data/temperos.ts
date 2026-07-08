export type TabelaNutricional = {
  porcao?: string;
  valorEnergetico?: string;
  carboidratos?: string;
  acucares?: string;
  proteinas?: string;
  gordurasTotais?: string;
  gordurasSaturadas?: string;
  gordurasTrans?: string;
  fibras?: string;
  sodio?: string;
  observacoes?: string;
};

export type CustoFixoKey = "pote" | "lacre" | "rotulo" | "caixa" | "termoencolhivel";

export type CustosFixosOverride = Partial<Record<CustoFixoKey, number>>;

export type Tempero = {
  id: string;
  nome: string;
  precoKg: number;
  gramasPote: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  ordem: number;
  sku?: string;
  ean?: string;
  fotoPath?: string;
  tabelaNutricional?: TabelaNutricional;
  custosFixosOverride?: CustosFixosOverride;
};

export const TEMPEROS_SEED: Omit<Tempero, "id">[] = [
  { nome: "Ervas Finas", precoKg: 10.35, gramasPote: 20, estoqueAtual: 253, estoqueMinimo: 50, ordem: 1 },
  { nome: "Cebola em Pó", precoKg: 15.0, gramasPote: 35, estoqueAtual: 132, estoqueMinimo: 30, ordem: 2 },
  { nome: "Chimi Churri sem Pimenta", precoKg: 16.0, gramasPote: 40, estoqueAtual: 127, estoqueMinimo: 30, ordem: 3 },
  { nome: "Lemon Pepper", precoKg: 13.0, gramasPote: 50, estoqueAtual: 100, estoqueMinimo: 20, ordem: 4 },
  { nome: "Tempero do Edu", precoKg: 17.5, gramasPote: 45, estoqueAtual: 112, estoqueMinimo: 20, ordem: 5 },
  { nome: "Ana Maria", precoKg: 13.4, gramasPote: 55, estoqueAtual: 91, estoqueMinimo: 20, ordem: 6 },
  { nome: "Páprica Picante", precoKg: 8.3, gramasPote: 60, estoqueAtual: 112, estoqueMinimo: 20, ordem: 7 },
  { nome: "Páprica Defumada", precoKg: 9.0, gramasPote: 60, estoqueAtual: 85, estoqueMinimo: 20, ordem: 8 },
  { nome: "Temperaflix Tradicional", precoKg: 7.0, gramasPote: 60, estoqueAtual: 169, estoqueMinimo: 30, ordem: 9 },
  { nome: "Salsa, Cebola e Alho", precoKg: 20.5, gramasPote: 30, estoqueAtual: 170, estoqueMinimo: 30, ordem: 10 },
  { nome: "Du Chefe com Páprica", precoKg: 14.5, gramasPote: 45, estoqueAtual: 113, estoqueMinimo: 20, ordem: 11 },
  { nome: "Tempero Mineiro", precoKg: 15.3, gramasPote: 50, estoqueAtual: 101, estoqueMinimo: 20, ordem: 12 },
  { nome: "Temperaflix Bacon", precoKg: 7.3, gramasPote: 65, estoqueAtual: 75, estoqueMinimo: 20, ordem: 13 },
  { nome: "Cúrcuma", precoKg: 9.0, gramasPote: 40, estoqueAtual: 124, estoqueMinimo: 20, ordem: 14 },
  { nome: "Páprica Doce", precoKg: 7.3, gramasPote: 45, estoqueAtual: 113, estoqueMinimo: 20, ordem: 15 },
  { nome: "Chimi Churri Picante", precoKg: 17.5, gramasPote: 39, estoqueAtual: 129, estoqueMinimo: 20, ordem: 16 },
  { nome: "Temperaflix Ervas Finas", precoKg: 7.0, gramasPote: 75, estoqueAtual: 67, estoqueMinimo: 20, ordem: 17 },
  { nome: "Pimenta Moída", precoKg: 19.0, gramasPote: 50, estoqueAtual: 1200, estoqueMinimo: 50, ordem: 18 },
  { nome: "Canela Moída", precoKg: 15.0, gramasPote: 30, estoqueAtual: 5600, estoqueMinimo: 50, ordem: 19 },
];

// -------- Política Comercial --------
export type CanalKey = "distribuidor" | "atacado" | "marketplace";

export type FaixaCanal = {
  min: number;         // markup mínimo (%)
  recomendado: number; // markup recomendado (%)
  padrao: number;      // markup padrão aplicado (%)
  max: number;         // markup máximo (%)
};

export type AlertasPolitica = {
  margemBaixaAte: number;        // % (sobre venda)
  margemAceitavelAte: number;
  margemBoaAte: number;          // acima → excelente
  conflitoAlertaAbaixoDe: number;  // diferença entre canais
  conflitoAtencaoAbaixoDe: number;
};

export type PoliticaComercial = {
  canais: Record<CanalKey, FaixaCanal>;
  alertas: AlertasPolitica;
};

export const POLITICA_INICIAL: PoliticaComercial = {
  canais: {
    distribuidor: { min: 30, recomendado: 40, padrao: 40, max: 45 },
    atacado:      { min: 50, recomendado: 60, padrao: 60, max: 70 },
    marketplace:  { min: 90, recomendado: 120, padrao: 120, max: 150 },
  },
  alertas: {
    margemBaixaAte: 35,
    margemAceitavelAte: 50,
    margemBoaAte: 65,
    conflitoAlertaAbaixoDe: 10,
    conflitoAtencaoAbaixoDe: 15,
  },
};

export type Variaveis = {
  pote: number;
  lacre: number;
  rotulo: number;
  caixa: number;
  termoencolhivel: number;
  simplesNacional: number;
  custoFabril: number;
  comissao: number;
  transporte: number;

  markupDistribuidor: number;
  markupAtacado: number;
  markupCliente: number;
  contabilidadeMensal: number;
  producaoEstimada: number;
  politicaComercial: PoliticaComercial;
};

export const VARIAVEIS_INICIAIS: Variaveis = {
  pote: 0.95,
  lacre: 0.03,
  rotulo: 0.44,
  caixa: 0.12,
  termoencolhivel: 0.1,
  simplesNacional: 4.9,
  custoFabril: 6,
  comissao: 5,
  transporte: 3,

  markupDistribuidor: 1.4,
  markupAtacado: 1.6,
  markupCliente: 2.2,
  contabilidadeMensal: 500,
  producaoEstimada: 2000,
  politicaComercial: POLITICA_INICIAL,
};

// Utilitário: classifica margem sobre venda de acordo com política.
export type FaixaMargem = "baixa" | "aceitavel" | "boa" | "excelente";
export const classificarMargem = (
  margemPct: number,
  a: AlertasPolitica
): FaixaMargem => {
  if (margemPct <= a.margemBaixaAte) return "baixa";
  if (margemPct <= a.margemAceitavelAte) return "aceitavel";
  if (margemPct <= a.margemBoaAte) return "boa";
  return "excelente";
};
