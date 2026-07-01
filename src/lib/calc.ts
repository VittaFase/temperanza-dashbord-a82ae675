import { Tempero, Variaveis } from "@/data/temperos";

export type CalculoTempero = {
  custoMateriaPrima: number;
  custosFixos: number;
  encargosPct: number; // soma dos %
  custoTotal: number; // custo final por pote
  precoIndustria: number;
  precoAtacado: number;
  precoCliente: number;
  margemPct: number; // margem sobre preço cliente
};

export const calcularTempero = (t: Tempero, v: Variaveis): CalculoTempero => {
  const custoMateriaPrima = (t.precoKg * t.gramasPote) / 1000;
  const custosFixos = v.pote + v.lacre + v.rotulo + v.caixa + v.termoencolhivel;
  const encargosPct =
    (v.simplesNacional + v.custoFabril + v.comissao + v.transporte) / 100;

  const subtotal = custoMateriaPrima + custosFixos;
  const custoTotal = subtotal * (1 + encargosPct);

  const precoIndustria = custoTotal * v.markupIndustria;
  const precoAtacado = custoTotal * v.markupAtacado;
  const precoCliente = custoTotal * v.markupCliente;
  const margemPct =
    precoCliente > 0 ? ((precoCliente - custoTotal) / precoCliente) * 100 : 0;

  return {
    custoMateriaPrima,
    custosFixos,
    encargosPct,
    custoTotal,
    precoIndustria,
    precoAtacado,
    precoCliente,
    margemPct,
  };
};
