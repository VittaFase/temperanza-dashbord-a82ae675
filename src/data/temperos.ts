export type Tempero = {
  id: string;
  nome: string;
  precoKg: number;
  gramasPote: number;
  ordem: number;
};

export const TEMPEROS_SEED: Omit<Tempero, "id">[] = [
  { nome: "Temperaflix Tradicional", precoKg: 7.0, gramasPote: 60, ordem: 1 },
  { nome: "Temperaflix Ervas Finas", precoKg: 7.0, gramasPote: 75, ordem: 2 },
  { nome: "Cebola em Pó", precoKg: 15.0, gramasPote: 35, ordem: 3 },
  { nome: "Páprica Defumada", precoKg: 9.0, gramasPote: 60, ordem: 4 },
  { nome: "Ana Maria", precoKg: 13.4, gramasPote: 55, ordem: 5 },
  { nome: "Chimi Churri Picante", precoKg: 17.5, gramasPote: 39, ordem: 6 },
  { nome: "Chimi Churri s/ Pimenta", precoKg: 16.0, gramasPote: 40, ordem: 7 },
  { nome: "Alho em Pó", precoKg: 12.9, gramasPote: 45, ordem: 8 },
  { nome: "Temperaflix Pipoca Bacon", precoKg: 7.3, gramasPote: 65, ordem: 9 },
  { nome: "Tempero Chefe c/ Páprica", precoKg: 14.5, gramasPote: 45, ordem: 10 },
  { nome: "Cúrcuma / Açafrão", precoKg: 9.0, gramasPote: 40, ordem: 11 },
  { nome: "Lemon Pepper", precoKg: 13.0, gramasPote: 50, ordem: 12 },
  { nome: "Salsa | Cebola | Alho", precoKg: 20.5, gramasPote: 30, ordem: 13 },
  { nome: "Ervas Finas", precoKg: 10.35, gramasPote: 20, ordem: 14 },
  { nome: "Páprica Picante", precoKg: 8.3, gramasPote: 60, ordem: 15 },
  { nome: "Páprica Doce", precoKg: 7.3, gramasPote: 45, ordem: 16 },
  { nome: "Tempero Mineiro Moído", precoKg: 15.3, gramasPote: 50, ordem: 17 },
  { nome: "Edu Guedes", precoKg: 17.5, gramasPote: 45, ordem: 18 },
  { nome: "Pimenta Moída", precoKg: 19.0, gramasPote: 50, ordem: 19 },
  { nome: "Canela Moída", precoKg: 15.0, gramasPote: 30, ordem: 20 },
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
  markupIndustria: number;
  markupAtacado: number;
  markupCliente: number;
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
  markupIndustria: 2.3,
  markupAtacado: 2.3,
  markupCliente: 4.0,
};
