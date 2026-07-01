export type Tempero = {
  id: number;
  nome: string;
  precoKg: number; // R$/kg da matéria-prima
  gramasPote: number; // g por pote
};

export const TEMPEROS_INICIAIS: Tempero[] = [
  { id: 1, nome: "Temperaflix Tradicional", precoKg: 7.0, gramasPote: 60 },
  { id: 2, nome: "Temperaflix Ervas Finas", precoKg: 7.0, gramasPote: 75 },
  { id: 3, nome: "Cebola em Pó", precoKg: 15.0, gramasPote: 35 },
  { id: 4, nome: "Páprica Defumada", precoKg: 9.0, gramasPote: 60 },
  { id: 5, nome: "Ana Maria", precoKg: 13.4, gramasPote: 55 },
  { id: 6, nome: "Chimi Churri Picante", precoKg: 17.5, gramasPote: 39 },
  { id: 7, nome: "Chimi Churri s/ Pimenta", precoKg: 16.0, gramasPote: 40 },
  { id: 8, nome: "Alho em Pó", precoKg: 12.9, gramasPote: 45 },
  { id: 9, nome: "Temperaflix Pipoca Bacon", precoKg: 7.3, gramasPote: 65 },
  { id: 10, nome: "Tempero Chefe c/ Páprica", precoKg: 14.5, gramasPote: 45 },
  { id: 11, nome: "Cúrcuma / Açafrão", precoKg: 9.0, gramasPote: 40 },
  { id: 12, nome: "Lemon Pepper", precoKg: 13.0, gramasPote: 50 },
  { id: 13, nome: "Salsa | Cebola | Alho", precoKg: 20.5, gramasPote: 30 },
  { id: 14, nome: "Ervas Finas", precoKg: 10.35, gramasPote: 20 },
  { id: 15, nome: "Páprica Picante", precoKg: 8.3, gramasPote: 60 },
  { id: 16, nome: "Páprica Doce", precoKg: 7.3, gramasPote: 45 },
  { id: 17, nome: "Tempero Mineiro Moído", precoKg: 15.3, gramasPote: 50 },
  { id: 18, nome: "Edu Guedes", precoKg: 17.5, gramasPote: 45 },
  { id: 19, nome: "Pimenta Moída", precoKg: 19.0, gramasPote: 50 },
  { id: 20, nome: "Canela Moída", precoKg: 15.0, gramasPote: 30 },
];

export type Variaveis = {
  pote: number;
  lacre: number;
  rotulo: number;
  caixa: number;
  termoencolhivel: number;
  simplesNacional: number; // %
  custoFabril: number; // %
  comissao: number; // %
  transporte: number; // %
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
