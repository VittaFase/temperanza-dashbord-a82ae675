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
};

export const TEMPEROS_SEED: Omit<Tempero, "id">[] = [
  { nome: "Ervas Finas", precoKg: 10.35, gramasPote: 20, estoqueAtual: 253, estoqueMinimo: 50, ordem: 1 },
  { nome: "Cebola em Pó", precoKg: 15.0, gramasPote: 35, estoqueAtual: 132, estoqueMinimo: 30, ordem: 2 },
  { nome: "Chimi Churri", precoKg: 16.0, gramasPote: 40, estoqueAtual: 127, estoqueMinimo: 30, ordem: 3 },
  { nome: "Lemon Pepper", precoKg: 13.0, gramasPote: 50, estoqueAtual: 100, estoqueMinimo: 20, ordem: 4 },
  { nome: "Edu Guedes", precoKg: 17.5, gramasPote: 45, estoqueAtual: 112, estoqueMinimo: 20, ordem: 5 },
  { nome: "Ana Maria", precoKg: 13.4, gramasPote: 55, estoqueAtual: 91, estoqueMinimo: 20, ordem: 6 },
  { nome: "Páprica Picante", precoKg: 8.3, gramasPote: 60, estoqueAtual: 112, estoqueMinimo: 20, ordem: 7 },
  { nome: "Páprica Defumada", precoKg: 9.0, gramasPote: 60, estoqueAtual: 85, estoqueMinimo: 20, ordem: 8 },
  { nome: "Temperaflix Tradicional", precoKg: 7.0, gramasPote: 60, estoqueAtual: 169, estoqueMinimo: 30, ordem: 9 },
  { nome: "Salsa, Cebola", precoKg: 20.5, gramasPote: 30, estoqueAtual: 170, estoqueMinimo: 30, ordem: 10 },
  { nome: "Tuchef com Páprica", precoKg: 14.5, gramasPote: 45, estoqueAtual: 113, estoqueMinimo: 20, ordem: 11 },
  { nome: "Tempero Mineiro", precoKg: 15.3, gramasPote: 50, estoqueAtual: 101, estoqueMinimo: 20, ordem: 12 },
  { nome: "Temperaflix Sabor Bacon", precoKg: 7.3, gramasPote: 65, estoqueAtual: 75, estoqueMinimo: 20, ordem: 13 },
  { nome: "Cúrcuma", precoKg: 9.0, gramasPote: 40, estoqueAtual: 124, estoqueMinimo: 20, ordem: 14 },
  { nome: "Páprica Doce", precoKg: 7.3, gramasPote: 45, estoqueAtual: 113, estoqueMinimo: 20, ordem: 15 },
  { nome: "Chimi com Pimenta", precoKg: 17.5, gramasPote: 39, estoqueAtual: 129, estoqueMinimo: 20, ordem: 16 },
  { nome: "Temperaflix Ervas Finas", precoKg: 7.0, gramasPote: 75, estoqueAtual: 67, estoqueMinimo: 20, ordem: 17 },
  { nome: "Pimenta Moída", precoKg: 19.0, gramasPote: 50, estoqueAtual: 1200, estoqueMinimo: 50, ordem: 18 },
  { nome: "Canela Moída", precoKg: 15.0, gramasPote: 30, estoqueAtual: 5600, estoqueMinimo: 50, ordem: 19 },
];

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
  
  markupAtacado: number;
  markupCliente: number;
  contabilidadeMensal: number;
  producaoEstimada: number;
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
  
  markupAtacado: 2.3,
  markupCliente: 4.0,
  contabilidadeMensal: 500,
  producaoEstimada: 2000,
};
