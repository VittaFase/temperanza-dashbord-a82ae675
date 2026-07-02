import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { calcularTempero } from "@/lib/calc";
import {
  Cliente, PedidoComItens, ItemPedido,
  fetchClientes, upsertCliente, criarPedido, fetchPedidos, cancelarPedido,
} from "@/lib/pedidos";
import { abrirNota } from "@/lib/nota";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import {
  Plus, Minus, Trash2, Search, UserPlus, FileText, ShoppingCart, X,
} from "lucide-react";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Canal = "atacado" | "cliente_final";

export default function Pedidos() {
  const { user } = useAuth();
  const { temperos, variaveis } = useDashboard();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pedidos, setPedidos] = useState<PedidoComItens[]>([]);
  const [busca, setBusca] = useState("");
  const [buscaProd, setBuscaProd] = useState("");
  const [clienteSel, setClienteSel] = useState<Cliente | null>(null);
  const [canal, setCanal] = useState<Canal>("cliente_final");
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);
  const [obs, setObs] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [dlgCliente, setDlgCliente] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchClientes(user.id).then(setClientes).catch((e) => toast.error(e.message));
    fetchPedidos(user.id).then(setPedidos).catch((e) => toast.error(e.message));
  }, [user]);

  const precoDoProduto = (id: string) => {
    const t = temperos.find((x) => x.id === id);
    if (!t) return 0;
    const c = calcularTempero(t, variaveis);
    return canal === "atacado" ? c.precoAtacado : c.precoCliente;
  };

  // recalcula preços quando canal muda
  useEffect(() => {
    setCarrinho((prev) =>
      prev.map((i) => {
        const preco = precoDoProduto(i.tempero_id);
        return { ...i, preco_unitario: preco, subtotal: preco * i.quantidade };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canal, variaveis]);

  const clientesFiltrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (c.documento ?? "").toLowerCase().includes(q) ||
        (c.telefone ?? "").toLowerCase().includes(q)
    );
  }, [busca, clientes]);

  const produtosFiltrados = useMemo(() => {
    const q = buscaProd.toLowerCase().trim();
    const list = q
      ? temperos.filter(
          (t) =>
            t.nome.toLowerCase().includes(q) ||
            (t.sku ?? "").toLowerCase().includes(q) ||
            (t.ean ?? "").includes(q)
        )
      : temperos;
    return [...list].sort((a, b) => a.ordem - b.ordem);
  }, [buscaProd, temperos]);

  const adicionarProduto = (temperoId: string) => {
    const t = temperos.find((x) => x.id === temperoId);
    if (!t) return;
    if (t.estoqueAtual <= 0) {
      toast.error(`${t.nome}: sem estoque`);
      return;
    }
    setCarrinho((prev) => {
      const ex = prev.find((i) => i.tempero_id === temperoId);
      const preco = precoDoProduto(temperoId);
      if (ex) {
        if (ex.quantidade + 1 > t.estoqueAtual) {
          toast.error(`Estoque máximo: ${t.estoqueAtual}`);
          return prev;
        }
        return prev.map((i) =>
          i.tempero_id === temperoId
            ? { ...i, quantidade: i.quantidade + 1, subtotal: preco * (i.quantidade + 1) }
            : i
        );
      }
      return [
        ...prev,
        {
          tempero_id: temperoId,
          nome_produto: t.nome,
          quantidade: 1,
          preco_unitario: preco,
          subtotal: preco,
        },
      ];
    });
  };

  const mudarQtd = (id: string, delta: number) => {
    setCarrinho((prev) =>
      prev
        .map((i) => {
          if (i.tempero_id !== id) return i;
          const t = temperos.find((x) => x.id === id);
          const max = t?.estoqueAtual ?? 0;
          const q = Math.max(0, Math.min(max, i.quantidade + delta));
          return { ...i, quantidade: q, subtotal: i.preco_unitario * q };
        })
        .filter((i) => i.quantidade > 0)
    );
  };

  const removerItem = (id: string) =>
    setCarrinho((prev) => prev.filter((i) => i.tempero_id !== id));

  const total = carrinho.reduce((s, i) => s + i.subtotal, 0);
  const totalItens = carrinho.reduce((s, i) => s + i.quantidade, 0);

  const confirmar = async () => {
    if (!user) return;
    if (carrinho.length === 0) {
      toast.error("Adicione ao menos um produto");
      return;
    }
    setSalvando(true);
    try {
      const p = await criarPedido(user.id, {
        cliente_id: clienteSel?.id ?? null,
        canal,
        observacoes: obs || undefined,
        itens: carrinho,
      });
      toast.success(`Pedido #${String(p.numero).padStart(6, "0")} confirmado`);
      // recarrega dados (estoque baixado + lista de pedidos)
      const [novosPedidos] = await Promise.all([fetchPedidos(user.id)]);
      setPedidos(novosPedidos);
      abrirNota(p);
      // limpa
      setCarrinho([]);
      setObs("");
      setClienteSel(null);
      // força reload dos temperos para refletir estoque
      window.dispatchEvent(new Event("temperos:refresh"));
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao registrar pedido");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Registro de vendas, baixa automática de estoque e nota não fiscal.
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={canal}
          onValueChange={(v) => v && setCanal(v as Canal)}
          className="border rounded-md"
        >
          <ToggleGroupItem value="cliente_final" className="px-4">
            Cliente Final
          </ToggleGroupItem>
          <ToggleGroupItem value="atacado" className="px-4">
            Atacado
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-4">
        {/* Clientes */}
        <Card className="p-3 flex flex-col gap-3 max-h-[calc(100vh-220px)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm tracking-widest uppercase">Clientes</h2>
            <NovoClienteDialog
              open={dlgCliente}
              onOpenChange={setDlgCliente}
              onCreated={(c) => {
                setClientes((prev) => [...prev, c].sort((a, b) => a.nome.localeCompare(b.nome)));
                setClienteSel(c);
                setCanal(c.tipo);
              }}
            />
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <div className="flex-1 overflow-auto space-y-1">
            <button
              onClick={() => setClienteSel(null)}
              className={`w-full text-left rounded-md p-2 text-xs border ${
                !clienteSel ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"
              }`}
            >
              <span className="text-muted-foreground">Consumidor não identificado</span>
            </button>
            {clientesFiltrados.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setClienteSel(c);
                  setCanal(c.tipo);
                }}
                className={`w-full text-left rounded-md p-2 text-xs border ${
                  clienteSel?.id === c.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                }`}
              >
                <div className="font-medium">{c.nome}</div>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wider">
                  {c.tipo === "atacado" ? "Atacado" : "Cliente final"}
                  {c.telefone ? ` · ${c.telefone}` : ""}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Produtos */}
        <Card className="p-3 flex flex-col gap-3 max-h-[calc(100vh-220px)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-sm tracking-widest uppercase">Produtos</h2>
            <div className="text-[11px] text-muted-foreground">
              Preços em <strong>{canal === "atacado" ? "Atacado" : "Cliente Final"}</strong>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nome, SKU ou EAN"
              value={buscaProd}
              onChange={(e) => setBuscaProd(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {produtosFiltrados.map((t) => {
                const preco = precoDoProduto(t.id);
                const semEstoque = t.estoqueAtual <= 0;
                const baixo = t.estoqueAtual > 0 && t.estoqueAtual <= t.estoqueMinimo;
                return (
                  <button
                    key={t.id}
                    disabled={semEstoque}
                    onClick={() => adicionarProduto(t.id)}
                    className="text-left rounded-md border p-2 hover:border-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-medium leading-tight">{t.nome}</div>
                      {semEstoque ? (
                        <Badge variant="destructive" className="text-[9px]">Esgotado</Badge>
                      ) : baixo ? (
                        <Badge variant="secondary" className="text-[9px]">Baixo</Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="font-display tracking-wide">{brl(preco)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Estoque: {t.estoqueAtual}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Carrinho */}
        <Card className="p-3 flex flex-col gap-3 max-h-[calc(100vh-220px)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm tracking-widest uppercase flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Pedido
            </h2>
            {carrinho.length > 0 && (
              <button
                onClick={() => setCarrinho([])}
                className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="rounded-md bg-muted/40 p-2 text-xs">
            <div className="text-muted-foreground text-[10px] uppercase tracking-widest">Cliente</div>
            <div className="font-medium mt-0.5">
              {clienteSel?.nome ?? "Consumidor não identificado"}
            </div>
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {carrinho.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                Clique em um produto para adicionar.
              </p>
            )}
            {carrinho.map((i) => (
              <div key={i.tempero_id} className="border rounded-md p-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium leading-tight">{i.nome_produto}</div>
                  <button onClick={() => removerItem(i.tempero_id)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => mudarQtd(i.tempero_id, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center tabular-nums">{i.quantidade}</span>
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => mudarQtd(i.tempero_id, +1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground">{brl(i.preco_unitario)}</div>
                    <div className="font-display">{brl(i.subtotal)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <Textarea
            placeholder="Observações do pedido..."
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            rows={2}
            className="text-xs"
          />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>{totalItens} unidades</span>
              <span>{carrinho.length} produto(s)</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Total</span>
              <span className="font-display text-2xl">{brl(total)}</span>
            </div>
          </div>

          <Button
            onClick={confirmar}
            disabled={salvando || carrinho.length === 0}
            className="w-full"
          >
            {salvando ? "Registrando..." : "Confirmar pedido"}
          </Button>
        </Card>
      </div>

      {/* Histórico */}
      <Card className="p-4">
        <h2 className="font-display text-sm tracking-widest uppercase mb-3">Últimos pedidos</h2>
        {pedidos.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum pedido registrado ainda.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-2">Nº</th>
                  <th className="text-left">Data</th>
                  <th className="text-left">Cliente</th>
                  <th className="text-left">Canal</th>
                  <th className="text-right">Itens</th>
                  <th className="text-right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/40">
                    <td className="py-2 font-mono">#{String(p.numero).padStart(6, "0")}</td>
                    <td>{new Date(p.data_pedido).toLocaleString("pt-BR")}</td>
                    <td>{p.cliente?.nome ?? <span className="text-muted-foreground">—</span>}</td>
                    <td>
                      <Badge variant="outline" className="text-[10px]">
                        {p.canal === "atacado" ? "Atacado" : "Cliente Final"}
                      </Badge>
                    </td>
                    <td className="text-right tabular-nums">
                      {p.itens.reduce((s, i) => s + i.quantidade, 0)}
                    </td>
                    <td className="text-right tabular-nums font-display">{brl(p.total)}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => abrirNota(p)}>
                          <FileText className="h-3 w-3 mr-1" /> Nota
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            if (!confirm("Cancelar este pedido? O estoque será devolvido.")) return;
                            try {
                              await cancelarPedido(p.id);
                              setPedidos((prev) => prev.filter((x) => x.id !== p.id));
                              window.dispatchEvent(new Event("temperos:refresh"));
                              toast.success("Pedido cancelado");
                            } catch (e: any) {
                              toast.error(e.message);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- Novo Cliente ----------
function NovoClienteDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: (c: Cliente) => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    nome: "",
    tipo: "cliente_final" as Canal,
    documento: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
  });
  const [saving, setSaving] = useState(false);

  const salvar = async () => {
    if (!user) return;
    if (!form.nome.trim()) {
      toast.error("Informe o nome");
      return;
    }
    setSaving(true);
    try {
      const c = await upsertCliente(user.id, form);
      onCreated(c);
      toast.success("Cliente cadastrado");
      onOpenChange(false);
      setForm({
        nome: "", tipo: "cliente_final", documento: "", telefone: "",
        email: "", endereco: "", cidade: "", estado: "", cep: "",
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8">
          <UserPlus className="h-3 w-3 mr-1" /> Novo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Nome *</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as Canal })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente_final">Cliente Final</SelectItem>
                <SelectItem value="atacado">Atacado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Documento</Label>
            <Input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Endereço</Label>
            <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
          </div>
          <div>
            <Label>Estado</Label>
            <Input value={form.estado} maxLength={2} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <Label>CEP</Label>
            <Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
