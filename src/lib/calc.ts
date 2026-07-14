import { Tempero, Variaveis } from "@/data/temperos";

/** Multiplicador de markup: preco / custo (ex.: 1.91). Retorna 0 se custo inválido. */
export const markupMultiplier = (preco: number, custo: number): number =>
  custo > 0 ? preco / custo : 0;

/** Formata markup como "1,91x" no padrão pt-BR. */
export const formatMarkupX = (preco: number, custo: number): string => {
  const m = markupMultiplier(preco, custo);
  return `${m.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
};

/** Formata um multiplicador direto (ex.: 1.9 → "1,90x"). */
export const formatMultiplierX = (mult: number): string =>
  `${mult.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;

/** Converte margem% (lucro sobre preço) em markup Nx: 1 / (1 - m/100). */
export const markupFromMargem = (margemPct: number): number =>
  margemPct < 100 && margemPct > -Infinity ? 1 / (1 - margemPct / 100) : 0;

/** Formata margem como "Nx" a partir do percentual de margem. */
export const formatMarkupFromMargem = (margemPct: number): string =>
  formatMultiplierX(markupFromMargem(margemPct));

export type CalculoTempero = {
  custoMateriaPrima: number;
  custosFixos: number;
  rateioContabilidade: number;
  custoDireto: number;
  custoComFabril: number;
  custoTotal: number;

  precoDistribuidor: number;
  precoAtacado: number;
  precoCliente: number;
  margemPct: number;
  margemDistribuidorPct: number;
  margemAtacadoPct: number;
  margemClientePct: number;
};

// Fórmula Manus: impostos e comissão incidem "por dentro" sobre o preço de venda.
// Taxa de cartão incide APENAS na venda direta ao Cliente Final.
export const calcularTempero = (t: Tempero, v: Variaveis): CalculoTempero => {
  const custoMateriaPrima = (t.precoKg * t.gramasPote) / 1000;
  const ov = t.custosFixosOverride ?? {};
  const custosFixos =
    (ov.pote ?? v.pote) +
    (ov.lacre ?? v.lacre) +
    (ov.rotulo ?? v.rotulo) +
    (ov.caixa ?? v.caixa) +
    (ov.termoencolhivel ?? v.termoencolhivel);
  const rateioContabilidade =
    v.producaoEstimada > 0 ? v.contabilidadeMensal / v.producaoEstimada : 0;

  const custoDireto = custoMateriaPrima + custosFixos + rateioContabilidade;
  const custoComFabril = custoDireto * (1 + v.custoFabril / 100);

  const baseDivisor = 1 - v.simplesNacional / 100 - v.comissao / 100 - v.transporte / 100;
  const divisorPadrao = Math.max(0.01, baseDivisor);
  const custoTotal = custoComFabril / divisorPadrao;

  // Cliente Final: taxa de cartão entra "por dentro" (subtrai do divisor).
  const taxaCartao = v.politicaComercial?.custos?.taxaCartaoCliente ?? 0;
  const divisorCliente = Math.max(0.01, baseDivisor - taxaCartao / 100);
  const custoTotalCliente = custoComFabril / divisorCliente;

  const precoDistribuidor = custoTotal * v.markupDistribuidor;
  const precoAtacado = custoTotal * v.markupAtacado;
  const precoCliente = custoTotalCliente * v.markupCliente;

  const margem = (preco: number, custo: number) =>
    preco > 0 ? ((preco - custo) / preco) * 100 : 0;

  const margemDistribuidorPct = margem(precoDistribuidor, custoTotal);
  const margemAtacadoPct = margem(precoAtacado, custoTotal);
  const margemClientePct = margem(precoCliente, custoTotalCliente);

  return {
    custoMateriaPrima,
    custosFixos,
    rateioContabilidade,
    custoDireto,
    custoComFabril,
    custoTotal,
    precoDistribuidor,
    precoAtacado,
    precoCliente,
    margemPct: margemClientePct,
    margemDistribuidorPct,
    margemAtacadoPct,
    margemClientePct,
  };
};
