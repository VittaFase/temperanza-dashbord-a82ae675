import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Variaveis } from "@/data/temperos";

type Props = {
  variaveis: Variaveis;
  onChange: (v: Variaveis) => void;
  onReset: () => void;
};

const CAMPOS_FIXOS: { key: keyof Variaveis; label: string; suffix?: string }[] = [
  { key: "pote", label: "Pote + Tampa", suffix: "R$" },
  { key: "lacre", label: "Lacre", suffix: "R$" },
  { key: "rotulo", label: "Rótulo", suffix: "R$" },
  { key: "caixa", label: "Caixa (rateio)", suffix: "R$" },
  { key: "termoencolhivel", label: "Termoencolhível", suffix: "R$" },
];

const CAMPOS_PERC: { key: keyof Variaveis; label: string }[] = [
  { key: "simplesNacional", label: "Simples Nacional" },
  { key: "custoFabril", label: "Custo Fabril" },
  { key: "comissao", label: "Comissão Representante" },
  { key: "transporte", label: "Transporte" },
];

const MARKUPS: { key: keyof Variaveis; label: string }[] = [
  { key: "markupAtacado", label: "Markup Atacado" },
  { key: "markupCliente", label: "Markup Cliente Final" },
];

export const VariaveisPanel = ({ variaveis, onChange, onReset }: Props) => {
  const upd = (k: keyof Variaveis, v: string) =>
    onChange({ ...variaveis, [k]: parseFloat(v) || 0 });

  return (
    <Card className="shadow-card bg-card-gradient">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-2xl">Variáveis de Custo</CardTitle>
        <button
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-primary underline"
        >
          restaurar padrões
        </button>
      </CardHeader>
      <CardContent className="grid gap-6">
        <section>
          <h3 className="text-sm font-semibold mb-3 text-accent">Custos Fixos por Pote (R$)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CAMPOS_FIXOS.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variaveis[key]}
                  onChange={(e) => upd(key, e.target.value)}
                  className="h-9"
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-3 text-accent">Encargos & Percentuais (%)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CAMPOS_PERC.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={variaveis[key]}
                  onChange={(e) => upd(key, e.target.value)}
                  className="h-9"
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-3 text-accent">Markups de Venda (multiplicador)</h3>
          <div className="grid grid-cols-2 gap-3">
            {MARKUPS.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={variaveis[key]}
                  onChange={(e) => upd(key, e.target.value)}
                  className="h-9 font-semibold text-primary"
                />
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
};
