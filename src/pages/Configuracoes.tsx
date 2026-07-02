import { useDashboard } from "@/hooks/useDashboard";
import { VariaveisPanel } from "@/components/VariaveisPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Variaveis } from "@/data/temperos";

const Configuracoes = () => {
  const { variaveis, setVariaveis, resetVariaveis } = useDashboard();

  const upd = (k: keyof Variaveis, v: string) =>
    setVariaveis({ ...variaveis, [k]: parseFloat(v) || 0 });

  const rateio =
    variaveis.producaoEstimada > 0
      ? variaveis.contabilidadeMensal / variaveis.producaoEstimada
      : 0;

  return (
    <div className="container py-6 space-y-6">
      <header>
        <p className="text-gold text-xs tracking-[0.3em] uppercase">Configurações</p>
        <h1 className="font-display text-3xl">Variáveis globais</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Alterações são aplicadas em tempo real a todos os produtos.
        </p>
      </header>

      <Card className="shadow-card bg-card-gradient">
        <CardHeader>
          <CardTitle className="font-display text-xl">Variáveis Globais Mensais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Custo Contabilidade Mensal (R$)</Label>
            <Input type="number" step="0.01" value={variaveis.contabilidadeMensal}
              onChange={(e) => upd("contabilidadeMensal", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Produção Estimada (potes/mês)</Label>
            <Input type="number" step="1" value={variaveis.producaoEstimada}
              onChange={(e) => upd("producaoEstimada", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rateio por pote</Label>
            <div className="h-10 flex items-center px-3 rounded-md border bg-muted/50 font-semibold text-primary">
              R$ {rateio.toFixed(4)}
            </div>
          </div>
        </CardContent>
      </Card>

      <VariaveisPanel
        variaveis={variaveis}
        onChange={setVariaveis}
        onReset={resetVariaveis}
      />
    </div>
  );
};

export default Configuracoes;
