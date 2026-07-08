import { useDashboard } from "@/hooks/useDashboard";
import { VariaveisPanel } from "@/components/VariaveisPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Variaveis, CanalKey, PoliticaComercial } from "@/data/temperos";

const CANAIS: { key: CanalKey; label: string }[] = [
  { key: "distribuidor", label: "Distribuidor" },
  { key: "atacado", label: "Atacado" },
  { key: "marketplace", label: "Marketplace / Cliente Final" },
];

const Configuracoes = () => {
  const { variaveis, setVariaveis, resetVariaveis } = useDashboard();

  const upd = (k: keyof Variaveis, v: string) =>
    setVariaveis({ ...variaveis, [k]: parseFloat(v) || 0 } as Variaveis);

  const rateio =
    variaveis.producaoEstimada > 0
      ? variaveis.contabilidadeMensal / variaveis.producaoEstimada
      : 0;

  const updPolitica = (patch: (p: PoliticaComercial) => PoliticaComercial) =>
    setVariaveis({ ...variaveis, politicaComercial: patch(variaveis.politicaComercial) });

  const updFaixa = (canal: CanalKey, campo: "min" | "recomendado" | "padrao" | "max", v: string) =>
    updPolitica((p) => ({
      ...p,
      canais: { ...p.canais, [canal]: { ...p.canais[canal], [campo]: parseFloat(v) || 0 } },
    }));

  const updAlerta = (campo: keyof PoliticaComercial["alertas"], v: string) =>
    updPolitica((p) => ({ ...p, alertas: { ...p.alertas, [campo]: parseFloat(v) || 0 } }));

  return (
    <div className="container py-6 space-y-6">
      <header>
        <p className="text-gold text-xs tracking-[0.3em] uppercase">Configurações</p>
        <h1 className="font-display text-3xl">Variáveis globais & Política Comercial</h1>
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

      {/* Política Comercial */}
      <Card className="shadow-card bg-card-gradient">
        <CardHeader>
          <CardTitle className="font-display text-xl">Política Comercial</CardTitle>
          <p className="text-xs text-muted-foreground">
            Faixas de markup por canal (em %). Todos os valores são editáveis e servem como referência para os alertas na Simulação e nos Produtos.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {CANAIS.map(({ key, label }) => {
            const f = variaveis.politicaComercial.canais[key];
            return (
              <div key={key} className="space-y-2">
                <h3 className="text-sm font-semibold text-accent">{label}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FaixaInput label="Mínimo (%)" value={f.min} onChange={(v) => updFaixa(key, "min", v)} />
                  <FaixaInput label="Recomendado (%)" value={f.recomendado} onChange={(v) => updFaixa(key, "recomendado", v)} />
                  <FaixaInput label="Padrão (%)" value={f.padrao} onChange={(v) => updFaixa(key, "padrao", v)} />
                  <FaixaInput label="Máximo (%)" value={f.max} onChange={(v) => updFaixa(key, "max", v)} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Limiares de alertas */}
      <Card className="shadow-card bg-card-gradient">
        <CardHeader>
          <CardTitle className="font-display text-xl">Limiares de Alertas</CardTitle>
          <p className="text-xs text-muted-foreground">
            Definem as classificações de margem (baixa / aceitável / boa / excelente) e os alertas de conflito comercial entre canais.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <FaixaInput label="Margem baixa até (%)" value={variaveis.politicaComercial.alertas.margemBaixaAte} onChange={(v) => updAlerta("margemBaixaAte", v)} />
          <FaixaInput label="Margem aceitável até (%)" value={variaveis.politicaComercial.alertas.margemAceitavelAte} onChange={(v) => updAlerta("margemAceitavelAte", v)} />
          <FaixaInput label="Margem boa até (%)" value={variaveis.politicaComercial.alertas.margemBoaAte} onChange={(v) => updAlerta("margemBoaAte", v)} />
          <FaixaInput label="Conflito: alerta abaixo de (%)" value={variaveis.politicaComercial.alertas.conflitoAlertaAbaixoDe} onChange={(v) => updAlerta("conflitoAlertaAbaixoDe", v)} />
          <FaixaInput label="Conflito: atenção abaixo de (%)" value={variaveis.politicaComercial.alertas.conflitoAtencaoAbaixoDe} onChange={(v) => updAlerta("conflitoAtencaoAbaixoDe", v)} />
        </CardContent>
      </Card>
    </div>
  );
};

const FaixaInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <Input type="number" step="0.1" value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />
  </div>
);

export default Configuracoes;
