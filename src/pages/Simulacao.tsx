import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { calcularTempero } from "@/lib/calc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Simulacao = () => {
  const { variaveis, setVariaveis, temperos } = useDashboard();
  const [mAtacado, setMAtacado] = useState(variaveis.markupAtacado);
  const [mCliente, setMCliente] = useState(variaveis.markupCliente);

  const sim = { ...variaveis, markupAtacado: mAtacado, markupCliente: mCliente };

  const linhasAtuais = temperos.map((t) => calcularTempero(t, variaveis));
  const linhasSim = temperos.map((t) => calcularTempero(t, sim));

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const margemAtacadoAtual = avg(linhasAtuais.map((l) => l.margemAtacadoPct));
  const margemAtacadoSim = avg(linhasSim.map((l) => l.margemAtacadoPct));
  const margemClienteAtual = avg(linhasAtuais.map((l) => l.margemClientePct));
  const margemClienteSim = avg(linhasSim.map((l) => l.margemClientePct));

  const aplicar = () => {
    setVariaveis({ ...variaveis, markupAtacado: mAtacado, markupCliente: mCliente });
    toast.success("Markups aplicados e salvos");
  };

  const restaurar = () => {
    setMAtacado(variaveis.markupAtacado);
    setMCliente(variaveis.markupCliente);
  };

  const amostra = temperos.slice(0, 8);

  return (
    <div className="container py-6 space-y-6">
      <header>
        <p className="text-gold text-xs tracking-[0.3em] uppercase">Simulação</p>
        <h1 className="font-display text-3xl">Estudo de markups</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajuste os multiplicadores e veja o impacto antes de aplicar.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <MarkupCard label="Markup Atacado" value={mAtacado} onChange={setMAtacado} />
        <MarkupCard label="Markup Cliente Final" value={mCliente} onChange={setMCliente} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MargemCanal
          titulo="Atacado"
          atual={margemAtacadoAtual}
          simulada={margemAtacadoSim}
        />
        <MargemCanal
          titulo="Cliente Final"
          atual={margemClienteAtual}
          simulada={margemClienteSim}
        />
      </div>

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
                <TableHead className="text-right">Atacado atual</TableHead>
                <TableHead className="text-right text-primary">Atacado sim.</TableHead>
                <TableHead className="text-right">Δ Atac.</TableHead>
                <TableHead className="text-right">Cliente atual</TableHead>
                <TableHead className="text-right text-primary">Cliente sim.</TableHead>
                <TableHead className="text-right">Δ Cli.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amostra.map((t, i) => {
                const aAtual = linhasAtuais[i].precoAtacado;
                const aNovo = linhasSim[i].precoAtacado;
                const aDelta = aNovo - aAtual;
                const cAtual = linhasAtuais[i].precoCliente;
                const cNovo = linhasSim[i].precoCliente;
                const cDelta = cNovo - cAtual;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.nome}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{brl(aAtual)}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{brl(aNovo)}</TableCell>
                    <TableCell className={`text-right font-mono text-xs ${aDelta >= 0 ? "text-herb-green" : "text-destructive"}`}>
                      {aDelta >= 0 ? "+" : ""}{brl(aDelta)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{brl(cAtual)}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{brl(cNovo)}</TableCell>
                    <TableCell className={`text-right font-mono text-xs ${cDelta >= 0 ? "text-herb-green" : "text-destructive"}`}>
                      {cDelta >= 0 ? "+" : ""}{brl(cDelta)}
                    </TableCell>
                  </TableRow>
                );
              })}
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
  return (
    <Card className="shadow-card bg-card-gradient">
      <CardContent className="p-5 space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">{titulo}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Margem atual</p>
            <p className="font-display text-2xl mt-1">{atual.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Margem simulada</p>
            <p className="font-display text-2xl mt-1 text-primary">{simulada.toFixed(1)}%</p>
            <p className={`text-xs font-mono mt-0.5 ${up ? "text-herb-green" : "text-destructive"}`}>
              {up ? "▲ +" : "▼ "}{delta.toFixed(1)} p.p.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MarkupCard = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <Card className="shadow-card">
    <CardContent className="p-5 space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <span className="font-display text-2xl text-primary">{value.toFixed(2)}x</span>
      </div>
      <Slider value={[value]} min={1} max={8} step={0.05} onValueChange={([v]) => onChange(v)} />
    </CardContent>
  </Card>
);

export default Simulacao;
