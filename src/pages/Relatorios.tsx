import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { fetchPedidos, PedidoComItens } from "@/lib/pedidos";
import { calcularTempero } from "@/lib/calc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Periodo = "7" | "30" | "90" | "all";
type CanalFiltro = "todos" | "distribuidor" | "atacado" | "cliente_final";

export default function Relatorios() {
  const { user } = useAuth();
  const { temperos, variaveis } = useDashboard();
  const [pedidos, setPedidos] = useState<PedidoComItens[]>([]);
  const [periodo, setPeriodo] = useState<Periodo>("30");
  const [canal, setCanal] = useState<CanalFiltro>("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchPedidos(user.id, 500)
      .then(setPedidos)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const custoAtualPorProduto = useMemo(() => {
    const m = new Map<string, number>();
    temperos.forEach((t) => m.set(t.id, calcularTempero(t, variaveis).custoTotal));
    return m;
  }, [temperos, variaveis]);

  const filtrados = useMemo(() => {
    const now = Date.now();
    const limite =
      periodo === "all" ? 0 : now - Number(periodo) * 24 * 60 * 60 * 1000;
    return pedidos.filter((p) => {
      if (canal !== "todos" && p.canal !== canal) return false;
      if (limite && new Date(p.data_pedido).getTime() < limite) return false;
      return true;
    });
  }, [pedidos, periodo, canal]);

  const kpis = useMemo(() => {
    let faturamento = 0;
    let custo = 0;
    let unidades = 0;
    filtrados.forEach((p) => {
      faturamento += Number(p.total);
      p.itens.forEach((i) => {
        unidades += i.quantidade;
        custo += (custoAtualPorProduto.get(i.tempero_id) ?? 0) * i.quantidade;
      });
    });
    const pedidosCount = filtrados.length;
    const ticket = pedidosCount > 0 ? faturamento / pedidosCount : 0;
    const lucroBruto = faturamento - custo;
    const margemPct = faturamento > 0 ? (lucroBruto / faturamento) * 100 : 0;
    return { faturamento, pedidosCount, ticket, custo, lucroBruto, margemPct, unidades };
  }, [filtrados, custoAtualPorProduto]);

  const serieDiaria = useMemo(() => {
    const map = new Map<string, { data: string; total: number; pedidos: number }>();
    filtrados.forEach((p) => {
      const d = new Date(p.data_pedido).toISOString().slice(0, 10);
      const ex = map.get(d) ?? { data: d, total: 0, pedidos: 0 };
      ex.total += Number(p.total);
      ex.pedidos += 1;
      map.set(d, ex);
    });
    return Array.from(map.values()).sort((a, b) => a.data.localeCompare(b.data))
      .map((r) => ({ ...r, label: r.data.slice(5).replace("-", "/") }));
  }, [filtrados]);

  const topProdutos = useMemo(() => {
    const map = new Map<string, { nome: string; qtd: number; receita: number }>();
    filtrados.forEach((p) => {
      p.itens.forEach((i) => {
        const ex = map.get(i.tempero_id) ?? { nome: i.nome_produto, qtd: 0, receita: 0 };
        ex.qtd += i.quantidade;
        ex.receita += Number(i.subtotal);
        map.set(i.tempero_id, ex);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 8);
  }, [filtrados]);

  const topClientes = useMemo(() => {
    const map = new Map<string, { nome: string; pedidos: number; total: number }>();
    filtrados.forEach((p) => {
      const key = p.cliente?.id ?? "anon";
      const nome = p.cliente?.nome ?? "Consumidor não identificado";
      const ex = map.get(key) ?? { nome, pedidos: 0, total: 0 };
      ex.pedidos += 1;
      ex.total += Number(p.total);
      map.set(key, ex);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filtrados]);

  const estoqueBaixo = useMemo(
    () =>
      temperos
        .filter((t) => t.estoqueAtual <= t.estoqueMinimo)
        .sort((a, b) => a.estoqueAtual / Math.max(1, a.estoqueMinimo) - b.estoqueAtual / Math.max(1, b.estoqueMinimo)),
    [temperos]
  );

  const exportCSV = () => {
    const linhas = [
      ["Numero", "Data", "Cliente", "Canal", "Itens", "Unidades", "Total"],
      ...filtrados.map((p) => [
        String(p.numero).padStart(6, "0"),
        new Date(p.data_pedido).toLocaleString("pt-BR"),
        p.cliente?.nome ?? "Consumidor não identificado",
        p.canal === "atacado" ? "Atacado" : p.canal === "distribuidor" ? "Distribuidor" : "Cliente Final",
        String(p.itens.length),
        String(p.itens.reduce((s, i) => s + i.quantidade, 0)),
        Number(p.total).toFixed(2).replace(".", ","),
      ]),
    ];
    const csv = linhas.map((l) => l.map((c) => `"${c}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            BI de vendas, margem realizada e alertas de estoque.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup type="single" value={periodo} onValueChange={(v) => v && setPeriodo(v as Periodo)} className="border rounded-md">
            <ToggleGroupItem value="7" className="px-3 text-xs">7d</ToggleGroupItem>
            <ToggleGroupItem value="30" className="px-3 text-xs">30d</ToggleGroupItem>
            <ToggleGroupItem value="90" className="px-3 text-xs">90d</ToggleGroupItem>
            <ToggleGroupItem value="all" className="px-3 text-xs">Tudo</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" value={canal} onValueChange={(v) => v && setCanal(v as CanalFiltro)} className="border rounded-md">
            <ToggleGroupItem value="todos" className="px-3 text-xs">Todos</ToggleGroupItem>
            <ToggleGroupItem value="cliente_final" className="px-3 text-xs">Cliente</ToggleGroupItem>
            <ToggleGroupItem value="atacado" className="px-3 text-xs">Atacado</ToggleGroupItem>
            <ToggleGroupItem value="distribuidor" className="px-3 text-xs">Distribuidor</ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtrados.length === 0}>
            <Download className="h-3 w-3 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Faturamento" value={brl(kpis.faturamento)} accent />
        <Kpi label="Pedidos" value={String(kpis.pedidosCount)} />
        <Kpi label="Ticket médio" value={brl(kpis.ticket)} />
        <Kpi label="Unidades" value={String(kpis.unidades)} />
        <Kpi label="Custo estimado" value={brl(kpis.custo)} sub="preço de custo atual" />
        <Kpi label="Lucro bruto" value={brl(kpis.lucroBruto)} accent />
        <Kpi label="Margem realizada" value={`${kpis.margemPct.toFixed(1)}%`} accent />
        <Kpi label="Produtos em alerta" value={String(estoqueBaixo.length)} sub="estoque ≤ mínimo" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="p-4">
          <h2 className="font-display text-sm tracking-widest uppercase mb-3">Curva de vendas</h2>
          {serieDiaria.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Sem dados no período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={serieDiaria}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="font-display text-sm tracking-widest uppercase mb-3">Top produtos (receita)</h2>
          {topProdutos.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Sem dados no período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProdutos} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${v}`} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} width={120} />
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="p-4">
          <h2 className="font-display text-sm tracking-widest uppercase mb-3">Top clientes</h2>
          {topClientes.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem dados no período.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-2">Cliente</th>
                  <th className="text-right">Pedidos</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {topClientes.map((c, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-1.5">{c.nome}</td>
                    <td className="text-right tabular-nums">{c.pedidos}</td>
                    <td className="text-right tabular-nums font-display">{brl(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="font-display text-sm tracking-widest uppercase mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Estoque em alerta
          </h2>
          {estoqueBaixo.length === 0 ? (
            <p className="text-xs text-muted-foreground">Todos os produtos acima do mínimo. ✓</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-2">Produto</th>
                  <th className="text-right">Atual</th>
                  <th className="text-right">Mín.</th>
                  <th className="text-right">Repor</th>
                </tr>
              </thead>
              <tbody>
                {estoqueBaixo.map((t) => {
                  const repor = Math.max(0, t.estoqueMinimo * 2 - t.estoqueAtual);
                  const critico = t.estoqueAtual === 0;
                  return (
                    <tr key={t.id} className="border-b">
                      <td className="py-1.5">
                        {t.nome}{" "}
                        {critico && <Badge variant="destructive" className="text-[9px] ml-1">Esgotado</Badge>}
                      </td>
                      <td className="text-right tabular-nums">{t.estoqueAtual}</td>
                      <td className="text-right tabular-nums text-muted-foreground">{t.estoqueMinimo}</td>
                      <td className="text-right tabular-nums font-display">{repor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {loading && <p className="text-xs text-muted-foreground text-center">Carregando dados...</p>}
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <Card className={`p-3 ${accent ? "border-primary/40" : ""}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-xl md:text-2xl mt-1 ${accent ? "text-primary" : ""}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}
