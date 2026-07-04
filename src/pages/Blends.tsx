import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { Blend, fetchBlends, calcularPrecoBlend, blendsDisponiveis } from "@/lib/blends";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package2, AlertTriangle, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

  return (
    <div className="container py-6 space-y-6">
      <header>
        <p className="text-gold text-xs tracking-[0.3em] uppercase">Blends</p>
        <h1 className="font-display text-3xl">Kits de 12 potes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preço calculado em tempo real como a soma dos potes individuais.
          Cupons: <strong>BLEND05</strong> (5% atacado) · <strong>BLEND10</strong> (10% cliente final).
        </p>
      </header>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {blends.map((b) => {
          const precoAtacado = calcularPrecoBlend(b, temperos, variaveis, "atacado");
          const precoCliente = calcularPrecoBlend(b, temperos, variaveis, "cliente_final");
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

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground pb-0.5">
                  <span>Sabor</span>
                  <span className="flex gap-4">
                    <span className="w-20 text-right">Atacado</span>
                    <span className="w-20 text-right">Cliente</span>
                  </span>
                </div>
                {b.itens.map((i) => {
                  const subAtac = variaveis && temperos.find((t) => t.id === i.tempero_id)
                    ? calcularPrecoBlend(
                        { ...b, itens: [{ tempero_id: i.tempero_id, quantidade: i.quantidade }] },
                        temperos, variaveis, "atacado"
                      )
                    : 0;
                  const subCli = variaveis && temperos.find((t) => t.id === i.tempero_id)
                    ? calcularPrecoBlend(
                        { ...b, itens: [{ tempero_id: i.tempero_id, quantidade: i.quantidade }] },
                        temperos, variaveis, "cliente_final"
                      )
                    : 0;
                  return (
                    <div key={i.tempero_id} className="flex justify-between items-center border-b border-dashed border-border/60 py-1 gap-2">
                      <span className="flex-1 min-w-0 truncate">{i.quantidade}× {nomePote(i.tempero_id)}</span>
                      <span className="flex gap-4 shrink-0">
                        <span className="w-20 text-right tabular-nums text-muted-foreground">{brl(subAtac)}</span>
                        <span className="w-20 text-right tabular-nums text-foreground">{brl(subCli)}</span>
                      </span>
                    </div>
                  );
                })}
              </div>


              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Atacado</div>
                  <div className="font-display text-xl text-primary tabular-nums">{brl(precoAtacado)}</div>
                  <div className="text-[10px] text-herb-green">c/ BLEND05: {brl(precoAtacado * 0.95)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Cliente Final</div>
                  <div className="font-display text-xl text-primary tabular-nums">{brl(precoCliente)}</div>
                  <div className="text-[10px] text-herb-green">c/ BLEND10: {brl(precoCliente * 0.9)}</div>
                </div>
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
