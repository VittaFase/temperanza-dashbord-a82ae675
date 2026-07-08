import { useState } from "react";
import { Link } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import { calcularTempero, formatMultiplierX } from "@/lib/calc";
import { CanalKey } from "@/data/temperos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Simulacao = () => {
  const { variaveis, setVariaveis, temperos } = useDashboard();
  const [mDist, setMDist] = useState(variaveis.markupDistribuidor);
  const [mAtacado, setMAtacado] = useState(variaveis.markupAtacado);
  const [mCliente, setMCliente] = useState(variaveis.markupCliente);

  const sim = {
    ...variaveis,
    markupDistribuidor: mDist,
    markupAtacado: mAtacado,
    markupCliente: mCliente,
  };
  const pc = variaveis.politicaComercial;

  const linhasAtuais = temperos.map((t) => calcularTempero(t, variaveis));
  const linhasSim = temperos.map((t) => calcularTempero(t, sim));

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const mDistAtual = avg(linhasAtuais.map((l) => l.margemDistribuidorPct));
  const mDistSim = avg(linhasSim.map((l) => l.margemDistribuidorPct));
  const mAtacAtual = avg(linhasAtuais.map((l) => l.margemAtacadoPct));
  const mAtacSim = avg(linhasSim.map((l) => l.margemAtacadoPct));
  const mCliAtual = avg(linhasAtuais.map((l) => l.margemClientePct));
  const mCliSim = avg(linhasSim.map((l) => l.margemClientePct));

  // Conflito comercial: diferença entre markups consecutivos (Atacado - Distribuidor, Cliente - Atacado)
  const diffDA = (mAtacado / mDist - 1) * 100;
  const diffAC = (mCliente / mAtacado - 1) * 100;
  const conflitos: { label: string; diff: number; nivel: "ok" | "atencao" | "alerta" }[] = [
    { label: "Atacado × Distribuidor", diff: diffDA, nivel: diffDA < pc.alertas.conflitoAlertaAbaixoDe ? "alerta" : diffDA < pc.alertas.conflitoAtencaoAbaixoDe ? "atencao" : "ok" },
    { label: "Cliente × Atacado", diff: diffAC, nivel: diffAC < pc.alertas.conflitoAlertaAbaixoDe ? "alerta" : diffAC < pc.alertas.conflitoAtencaoAbaixoDe ? "atencao" : "ok" },
  ];

  const aplicar = () => {
    setVariaveis({ ...variaveis, markupDistribuidor: mDist, markupAtacado: mAtacado, markupCliente: mCliente });
    toast.success("Markups aplicados e salvos");
  };

  const restaurar = () => {
    setMDist(variaveis.markupDistribuidor);
    setMAtacado(variaveis.markupAtacado);
    setMCliente(variaveis.markupCliente);
  };

  const amostra = temperos.slice(0, 8);

  return (
    <div className="container py-6 space-y-6">
      <header>
        <p className="text-gold text-xs tracking-[0.3em] uppercase">Simulação</p>
        <h1 className="font-display text-3xl">Estudo de markups por canal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajuste independente por canal. Faixas e limiares são definidos em{" "}
          <Link to="/configuracoes" className="text-primary underline">Política Comercial</Link>.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <MarkupCard canal="distribuidor" label="Distribuidor" value={mDist} onChange={setMDist} faixa={pc.canais.distribuidor} />
        <MarkupCard canal="atacado" label="Atacado" value={mAtacado} onChange={setMAtacado} faixa={pc.canais.atacado} />
        <MarkupCard canal="marketplace" label="Cliente Final / Marketplace" value={mCliente} onChange={setMCliente} faixa={pc.canais.marketplace} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MargemCanal titulo="Distribuidor" atual={mDistAtual} simulada={mDistSim} />
        <MargemCanal titulo="Atacado" atual={mAtacAtual} simulada={mAtacSim} />
        <MargemCanal titulo="Cliente Final" atual={mCliAtual} simulada={mCliSim} />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Conflito comercial entre canais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {conflitos.map((c) => (
            <div
              key={c.label}
              className={`flex items-center justify-between rounded-md border p-3 ${
                c.nivel === "alerta"
                  ? "border-destructive/40 bg-destructive/10"
                  : c.nivel === "atencao"
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-emerald-500/40 bg-emerald-500/10"
              }`}
            >
              <div className="flex items-center gap-2">
                {c.nivel !== "ok" && <AlertTriangle className="h-4 w-4" />}
                <span className="text-sm font-medium">{c.label}</span>
              </div>
              <div className="text-right">
                <p className="font-display text-lg tabular-nums">{c.diff.toFixed(1)}%</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {c.nivel === "alerta" ? "Conflito" : c.nivel === "atencao" ? "Atenção" : "Saudável"}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-xl">Preview em {amostra.length} produtos</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={restaurar}>Restaurar</Button>
            <Button size="sm" onClick={aplicar}>Aplicar Markups</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60">
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Distrib. atual</TableHead>
                <TableHead className="text-right text-primary">Distrib. sim.</TableHead>
                <TableHead className="text-right">Atac. atual</TableHead>
                <TableHead className="text-right text-primary">Atac. sim.</TableHead>
                <TableHead className="text-right">Cli. atual</TableHead>
                <TableHead className="text-right text-primary">Cli. sim.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amostra.map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.nome}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{brl(linhasAtuais[i].precoDistribuidor)}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{brl(linhasSim[i].precoDistribuidor)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{brl(linhasAtuais[i].precoAtacado)}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{brl(linhasSim[i].precoAtacado)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{brl(linhasAtuais[i].precoCliente)}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{brl(linhasSim[i].precoCliente)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const MargemCanal = ({ titulo, atual, simulada }: { titulo: string; atual: number; simulada: number }) => {
  const delta = simulada - atual;
  const up = delta >= 0;
  // markup a partir da margem: markup = 1 / (1 - margem/100)
  const markupFromMargem = (m: number) => (m < 100 ? 1 / (1 - m / 100) : 0);
  return (
    <Card className="shadow-card bg-card-gradient">
      <CardContent className="p-5 space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">{titulo}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Atual</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="font-display text-2xl">{atual.toFixed(1)}%</p>
              <span className="text-xs font-mono text-accent tabular-nums">{formatMultiplierX(markupFromMargem(atual))}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Simulada</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="font-display text-2xl text-primary">{simulada.toFixed(1)}%</p>
              <span className="text-xs font-mono text-accent tabular-nums">{formatMultiplierX(markupFromMargem(simulada))}</span>
            </div>
            <p className={`text-xs font-mono mt-0.5 ${up ? "text-emerald-500" : "text-destructive"}`}>
              {up ? "▲ +" : "▼ "}{delta.toFixed(1)} p.p.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MarkupCard = ({
  canal, label, value, onChange, faixa,
}: {
  canal: CanalKey;
  label: string;
  value: number;
  onChange: (v: number) => void;
  faixa: { min: number; recomendado: number; padrao: number; max: number };
}) => {
  const pct = (value - 1) * 100;
  const foraFaixa = pct < faixa.min || pct > faixa.max;
  const min = 1 + faixa.min / 100;
  const max = 1 + faixa.max / 100;

  return (
    <Card className={`shadow-card ${foraFaixa ? "border-amber-500/40" : ""}`}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
            <Link
              to="/configuracoes"
              title={`Configurar faixa do canal ${label}`}
              className="text-muted-foreground hover:text-primary"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Link>
          </div>
          <span className="font-display text-2xl text-primary">{pct.toFixed(0)}%</span>
        </div>
        <Slider value={[value]} min={min} max={max} step={0.01} onValueChange={([v]) => onChange(v)} />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>min {faixa.min}%</span>
          <Badge variant="outline" className="text-[10px]">rec {faixa.recomendado}%</Badge>
          <span>max {faixa.max}%</span>
        </div>
        {foraFaixa && (
          <p className="text-[11px] text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Fora da faixa recomendada
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Simulacao;
