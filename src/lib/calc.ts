import { Tempero, Variaveis } from "@/data/temperos";

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

  const divisor = Math.max(
    0.01,
    1 - v.simplesNacional / 100 - v.comissao / 100 - v.transporte / 100
  );
  const custoTotal = custoComFabril / divisor;

  const precoDistribuidor = custoTotal * v.markupDistribuidor;
  const precoAtacado = custoTotal * v.markupAtacado;
  const precoCliente = custoTotal * v.markupCliente;

  const margem = (preco: number) =>
    preco > 0 ? ((preco - custoTotal) / preco) * 100 : 0;

  const margemDistribuidorPct = margem(precoDistribuidor);
  const margemAtacadoPct = margem(precoAtacado);
  const margemClientePct = margem(precoCliente);

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
