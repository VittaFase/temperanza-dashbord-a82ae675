import { useEffect, useState } from "react";
import { TEMPEROS_INICIAIS, VARIAVEIS_INICIAIS, Tempero, Variaveis } from "@/data/temperos";
import { VariaveisPanel } from "@/components/VariaveisPanel";
import { TemperosTable } from "@/components/TemperosTable";
import { calcularTempero } from "@/lib/calc";
import { Card, CardContent } from "@/components/ui/card";

const STORAGE = "temperanzza-dashboard-v1";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Index = () => {
  const [temperos, setTemperos] = useState<Tempero[]>(TEMPEROS_INICIAIS);
  const [variaveis, setVariaveis] = useState<Variaveis>(VARIAVEIS_INICIAIS);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE);
    if (raw) {
      try {
        const { temperos: t, variaveis: v } = JSON.parse(raw);
        if (t) setTemperos(t);
        if (v) setVariaveis(v);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify({ temperos, variaveis }));
  }, [temperos, variaveis]);

  const custoMedio =
    temperos.reduce((s, t) => s + calcularTempero(t, variaveis).custoTotal, 0) /
    (temperos.length || 1);
  const clienteMedio =
    temperos.reduce((s, t) => s + calcularTempero(t, variaveis).precoCliente, 0) /
    (temperos.length || 1);
  const margemMedia =
    temperos.reduce((s, t) => s + calcularTempero(t, variaveis).margemPct, 0) /
    (temperos.length || 1);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-hero-gradient text-cream border-b-4 border-gold">
        <div className="container py-10">
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-2">Temperanzza</p>
          <h1 className="font-display text-4xl md:text-5xl">Dashboard de Custos & Precificação</h1>
          <p className="text-cream/70 mt-2 max-w-2xl">
            Controle matéria-prima, encargos e markups em tempo real. Todos os valores são
            editáveis e recalculam instantaneamente.
          </p>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Produtos" value={String(temperos.length)} />
          <StatCard label="Custo médio / pote" value={brl(custoMedio)} />
          <StatCard label="Preço cliente médio" value={brl(clienteMedio)} accent />
          <StatCard label="Margem média" value={`${margemMedia.toFixed(1)}%`} accent />
        </section>

        <VariaveisPanel
          variaveis={variaveis}
          onChange={setVariaveis}
          onReset={() => setVariaveis(VARIAVEIS_INICIAIS)}
        />

        <TemperosTable temperos={temperos} variaveis={variaveis} onChange={setTemperos} />

        <footer className="text-center text-xs text-muted-foreground py-6">
          Temperanzza Gastronomia · Dashboard interno · Dados salvos localmente no navegador
        </footer>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <Card className="shadow-card bg-card-gradient">
    <CardContent className="p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p
        className={`font-display text-3xl mt-1 ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </p>
    </CardContent>
  </Card>
);

export default Index;
