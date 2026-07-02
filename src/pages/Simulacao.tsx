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

  const margemAtual =
    linhasAtuais.length ? linhasAtuais.reduce((a, l) => a + l.margemPct, 0) / linhasAtuais.length : 0;
  const margemSim =
    linhasSim.length ? linhasSim.reduce((a, l) => a + l.margemPct, 0) / linhasSim.length : 0;

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

      <Card className="shadow-card bg-card-gradient">
        <CardContent className="p-5 grid gap-4 md:grid-cols-2">
          <Stat label="Margem média atual" value={`${margemAtual.toFixed(1)}%`} />
          <Stat label="Margem média simulada" value={`${margemSim.toFixed(1)}%`} accent />
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
                <TableHead className="text-right">Cliente atual</TableHead>
                <TableHead className="text-right text-primary">Cliente simulado</TableHead>
                <TableHead className="text-right">Δ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {amostra.map((t, i) => {
                const atual = linhasAtuais[i].precoCliente;
                const novo = linhasSim[i].precoCliente;
                const delta = novo - atual;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.nome}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{brl(atual)}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{brl(novo)}</TableCell>
                    <TableCell className={`text-right font-mono ${delta >= 0 ? "text-herb-green" : "text-destructive"}`}>
                      {delta >= 0 ? "+" : ""}{brl(delta)}
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

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div>
    <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
    <p className={`font-display text-3xl mt-1 ${accent ? "text-primary" : ""}`}>{value}</p>
  </div>
);

export default Simulacao;
