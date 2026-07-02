import { useDashboard } from "@/hooks/useDashboard";
import { calcularTempero } from "@/lib/calc";
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

  const chartData = [...linhas]
    .sort((a, b) => a.estoqueAtual - b.estoqueAtual)
    .map((l) => ({ nome: l.nome, estoque: l.estoqueAtual, minimo: l.estoqueMinimo }));

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
          <Stat label="Margem média atacado" value={`${margemAtacadoMedia.toFixed(1)}%`} accent />
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Canal Cliente Final</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Stat label="Valor estoque (venda cliente)" value={brl(totalVendaCliente)} accent />
          <Stat label="Margem média cliente" value={`${margemClienteMedia.toFixed(1)}%`} accent />
        </div>
      </section>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-xl">Estoque por produto</CardTitle>
        </CardHeader>
        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 8, right: 16, top: 8, bottom: 60 }}>
              <XAxis dataKey="nome" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} height={80} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="estoque" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.estoque < d.minimo ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                ))}
              </Bar>
              <ReferenceLine y={0} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <Card className="shadow-card bg-card-gradient">
    <CardContent className="p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`font-display text-3xl mt-1 ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </CardContent>
  </Card>
);

export default Dashboard;
