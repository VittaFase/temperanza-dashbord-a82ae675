import { Tempero, Variaveis } from "@/data/temperos";

export type CalculoTempero = {
  custoMateriaPrima: number;
  custosFixos: number;
  rateioContabilidade: number;
  custoDireto: number;
  custoComFabril: number;
  custoTotal: number;
  precoIndustria: number;
  precoAtacado: number;
  precoCliente: number;
  margemPct: number;
};

// Fórmula Manus: impostos e comissão incidem "por dentro" sobre o preço de venda.
export const calcularTempero = (t: Tempero, v: Variaveis): CalculoTempero => {
  const custoMateriaPrima = (t.precoKg * t.gramasPote) / 1000;
  const custosFixos = v.pote + v.lacre + v.rotulo + v.caixa + v.termoencolhivel;
  const rateioContabilidade =
    v.producaoEstimada > 0 ? v.contabilidadeMensal / v.producaoEstimada : 0;

  const custoDireto = custoMateriaPrima + custosFixos + rateioContabilidade;
  const custoComFabril = custoDireto * (1 + v.custoFabril / 100);

  const divisor = Math.max(
    0.01,
    1 - v.simplesNacional / 100 - v.comissao / 100 - v.transporte / 100
  );
  const custoTotal = custoComFabril / divisor;

  const precoIndustria = custoTotal * v.markupIndustria;
  const precoAtacado = custoTotal * v.markupAtacado;
  const precoCliente = t.nome === "Ervas Finas" ? 20.00 : custoTotal * v.markupCliente;
  const margemPct =
    precoCliente > 0 ? ((precoCliente - custoTotal) / precoCliente) * 100 : 0;

  return {
    custoMateriaPrima,
    custosFixos,
    rateioContabilidade,
    custoDireto,
    custoComFabril,
    custoTotal,
    precoIndustria,
    precoAtacado,
    precoCliente,
    margemPct,
  };
};
