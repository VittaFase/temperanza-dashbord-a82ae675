import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import {
  Blend, fetchBlends, calcularPrecoBlend, blendsDisponiveis, CanalBlend,
} from "@/lib/blends";
import { calcularTempero, formatMarkupFromMargem } from "@/lib/calc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package2, AlertTriangle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type ColConfig = {
  key: CanalBlend;
  label: string;
  short: string;
  cupom: string;
  cupomPct: number;
  margemKey: "margemDistribuidorPct" | "margemAtacadoPct" | "margemClientePct";
};

const COLS: ColConfig[] = [
  { key: "distribuidor",  label: "Distribuidor",  short: "Distrib.", cupom: "BLEND03", cupomPct: 0.03, margemKey: "margemDistribuidorPct" },
  { key: "atacado",       label: "Atacado",       short: "Atacado",  cupom: "BLEND05", cupomPct: 0.05, margemKey: "margemAtacadoPct" },
  { key: "cliente_final", label: "Cliente Final", short: "Cliente",  cupom: "BLEND10", cupomPct: 0.10, margemKey: "margemClientePct" },
];

export default function Blends() {
  const { user } = useAuth();
  const { temperos, variaveis } = useDashboard();
  const [blends, setBlends] = useState<Blend[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchBlends(user.id)
      .then(setBlends)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const nomePote = (id: string) =>
    temperos.find((t) => t.id === id)?.nome ?? "—";

  /** Markup Nx médio ponderado do blend no canal (usa a margem de cada pote pelo peso do subtotal). */
  const markupPonderado = (blend: Blend, col: ColConfig): string => {
    let somaPreco = 0;
    let somaMargemPonderada = 0;
    for (const it of blend.itens) {
      const t = temperos.find((x) => x.id === it.tempero_id);
      if (!t) continue;
      const c = calcularTempero(t, variaveis);
      const preco =
        col.key === "distribuidor" ? c.precoDistribuidor :
        col.key === "atacado" ? c.precoAtacado : c.precoCliente;
      const sub = preco * it.quantidade;
      somaPreco += sub;
      somaMargemPonderada += sub * c[col.margemKey];
    }
    if (somaPreco <= 0) return "—";
    return formatMarkupFromMargem(somaMargemPonderada / somaPreco);
  };

  return (
    <div className="container py-6 space-y-6">
      <header>
        <p className="text-gold text-xs tracking-[0.3em] uppercase">Blends</p>
        <h1 className="font-display text-3xl">Kits de 12 potes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preço calculado em tempo real como a soma dos potes individuais. Cupons:{" "}
          <strong>BLEND03</strong> (3% distribuidor) · <strong>BLEND05</strong> (5% atacado) ·{" "}
          <strong>BLEND10</strong> (10% cliente final).
        </p>
      </header>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {blends.map((b) => {
          const precos = COLS.map((col) => ({
            col,
            preco: calcularPrecoBlend(b, temperos, variaveis, col.key),
            markup: markupPonderado(b, col),
          }));
          const disp = blendsDisponiveis(b, temperos);
          return (
            <Card key={b.id} className="p-4 flex flex-col gap-3 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Package2 className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-display text-lg leading-tight">{b.nome}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {b.sku}
                    </p>
                  </div>
                </div>
                {disp <= 0 ? (
                  <Badge variant="destructive" className="text-[10px]">Sem estoque</Badge>
                ) : disp < 3 ? (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <AlertTriangle className="h-3 w-3" /> {disp} disp.
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">{disp} disp.</Badge>
                )}
              </div>

              {/* Tabela de sabores × canais */}
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-[1fr_repeat(3,minmax(0,72px))] gap-2 text-[10px] uppercase tracking-widest text-muted-foreground pb-0.5">
                  <span>Sabor</span>
                  {COLS.map((c) => (
                    <span key={c.key} className="text-right">{c.short}</span>
                  ))}
                </div>
                {b.itens.map((i) => {
                  const t = temperos.find((x) => x.id === i.tempero_id);
                  if (!t) return null;
                  const c = calcularTempero(t, variaveis);
                  const subs = {
                    distribuidor: c.precoDistribuidor * i.quantidade,
                    atacado: c.precoAtacado * i.quantidade,
                    cliente_final: c.precoCliente * i.quantidade,
                  };
                  return (
                    <div
                      key={i.tempero_id}
                      className="grid grid-cols-[1fr_repeat(3,minmax(0,72px))] gap-2 items-center border-b border-dashed border-border/60 py-1"
                    >
                      <span className="min-w-0 truncate">{i.quantidade}× {nomePote(i.tempero_id)}</span>
                      {COLS.map((col) => (
                        <span key={col.key} className="text-right tabular-nums text-muted-foreground">
                          {brl(subs[col.key])}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Totais por canal */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                {precos.map(({ col, preco, markup }) => (
                  <div key={col.key}>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {col.short}
                    </div>
                    <div className="font-display text-lg text-primary tabular-nums leading-tight">
                      {brl(preco)}
                    </div>
                    <div className="text-[10px] text-muted-foreground tabular-nums">
                      Markup {markup}
                    </div>
                    <div className="text-[10px] text-herb-green tabular-nums">
                      c/ {col.cupom}: {brl(preco * (1 - col.cupomPct))}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => nav("/pedidos")}
                disabled={disp <= 0}
                className="w-full"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Usar em pedido
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
