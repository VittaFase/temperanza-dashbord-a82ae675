import { useDashboard } from "@/hooks/useDashboard";
import { calcularTempero, formatMarkupFromMargem } from "@/lib/calc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import {
  Pie, PieChart, ResponsiveContainer, Tooltip, Cell,
} from "recharts";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Dashboard = () => {
  const { temperos, variaveis } = useDashboard();

  const linhas = temperos.map((t) => {
    const c = calcularTempero(t, variaveis);
    return {
      ...t,
      ...c,
      valorEstoqueCusto: c.custoTotal * t.estoqueAtual,
      valorEstoqueAtacado: c.precoAtacado * t.estoqueAtual,
      valorEstoqueCliente: c.precoCliente * t.estoqueAtual,
    };
  });

  const totalCusto = linhas.reduce((a, l) => a + l.valorEstoqueCusto, 0);
  const totalVendaAtacado = linhas.reduce((a, l) => a + l.valorEstoqueAtacado, 0);
  const totalVendaCliente = linhas.reduce((a, l) => a + l.valorEstoqueCliente, 0);
  const margemAtacadoMedia = linhas.length
    ? linhas.reduce((a, l) => a + l.margemAtacadoPct, 0) / linhas.length
    : 0;
  const margemClienteMedia = linhas.length
    ? linhas.reduce((a, l) => a + l.margemClientePct, 0) / linhas.length
    : 0;
  const potesTotal = linhas.reduce((a, l) => a + l.estoqueAtual, 0);
  const alertas = linhas.filter((l) => l.estoqueAtual < l.estoqueMinimo);


  return (
    <div className="container py-6 space-y-6">
      <header>
        <p className="text-gold text-xs tracking-[0.3em] uppercase">Resumo</p>
        <h1 className="font-display text-3xl">Visão geral do negócio</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Stat label="Potes em estoque" value={potesTotal.toLocaleString("pt-BR")} />
        <Stat label="Valor estoque (custo)" value={brl(totalCusto)} />
      </section>

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Canal Atacado</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Stat label="Valor estoque (venda atacado)" value={brl(totalVendaAtacado)} accent />
          <Stat label="Margem média atacado" value={`${margemAtacadoMedia.toFixed(1)}%`} sub={formatMarkupFromMargem(margemAtacadoMedia)} accent />
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Canal Cliente Final</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Stat label="Valor estoque (venda cliente)" value={brl(totalVendaCliente)} accent />
          <Stat label="Margem média cliente" value={`${margemClienteMedia.toFixed(1)}%`} sub={formatMarkupFromMargem(margemClienteMedia)} accent />
        </div>
      </section>

      <StockOverview linhas={linhas} totalPotes={potesTotal} />


      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Alertas de estoque baixo
          </CardTitle>
          <Badge variant={alertas.length ? "destructive" : "secondary"}>
            {alertas.length} produto{alertas.length !== 1 ? "s" : ""}
          </Badge>
        </CardHeader>
        <CardContent>
          {alertas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum alerta. Estoque saudável ✓</p>
          ) : (
            <ul className="divide-y">
              {alertas.map((a) => (
                <li key={a.id} className="py-2 flex items-center justify-between text-sm">
                  <NavLink to="/produtos" className="font-medium hover:text-primary">{a.nome}</NavLink>
                  <span className="text-destructive font-mono">
                    {a.estoqueAtual} / mín {a.estoqueMinimo}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Stat = ({ label, value, accent, sub }: { label: string; value: string; accent?: boolean; sub?: string }) => (
  <Card className="shadow-card bg-card-gradient">
    <CardContent className="p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-3 mt-1">
        <p className={`font-display text-3xl ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
        {sub && <span className="text-sm font-mono text-accent tabular-nums">{sub}</span>}
      </div>
    </CardContent>
  </Card>
);

const PALETTE = [
  "hsl(var(--primary))", "hsl(var(--gold))", "#c97b3a", "#8fae5d", "#b8574b",
  "#6b8e9e", "#d4a05a", "#7d5a8f", "#9c6b4f", "#5c8f7a",
];

type Linha = { id: string; nome: string; estoqueAtual: number; estoqueMinimo: number };

const StockOverview = ({ linhas, totalPotes }: { linhas: Linha[]; totalPotes: number }) => {
  const ordenadas = [...linhas].sort((a, b) => b.estoqueAtual - a.estoqueAtual);
  const top = ordenadas.slice(0, 8);
  const restoTotal = ordenadas.slice(8).reduce((a, l) => a + l.estoqueAtual, 0);
  const pieData = [
    ...top.map((l) => ({ name: l.nome, value: l.estoqueAtual })),
    ...(restoTotal > 0 ? [{ name: "Outros", value: restoTotal }] : []),
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-xl">Distribuição do estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  formatter={(v: number) => [`${v} potes`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="font-display text-4xl">{totalPotes.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-muted-foreground">potes</p>
            </div>
          </div>

          <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {ordenadas.map((l, i) => {
              const critico = l.estoqueAtual < l.estoqueMinimo;
              const alvo = Math.max(l.estoqueMinimo * 2, 1);
              const pct = Math.min(100, (l.estoqueAtual / alvo) * 100);
              return (
                <li key={l.id} className="flex items-center gap-3 text-sm">
                  <span
                    className="h-3 w-3 rounded-sm shrink-0"
                    style={{ background: i < 8 ? PALETTE[i % PALETTE.length] : "hsl(var(--muted))" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <span className="truncate">{l.nome}</span>
                      <span className={`font-mono tabular-nums text-xs ${critico ? "text-destructive" : "text-muted-foreground"}`}>
                        {l.estoqueAtual}/{l.estoqueMinimo}
                      </span>
                    </div>
                    <Progress value={pct} className={`h-1.5 mt-1 ${critico ? "[&>div]:bg-destructive" : ""}`} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
