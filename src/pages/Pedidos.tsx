import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { calcularTempero } from "@/lib/calc";
import {
  Cliente, PedidoComItens, ItemPedido,
  fetchClientes, upsertCliente, criarPedido, fetchPedidos, cancelarPedido,
} from "@/lib/pedidos";
import { NotaPreviewDialog } from "@/components/NotaPreviewDialog";
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
  Pencil, Copy, Receipt, Mail, MessageCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Canal = "atacado" | "cliente_final";
type ClienteForm = {
  nome: string; tipo: Canal; documento: string; telefone: string;
  email: string; endereco: string; cidade: string; estado: string; cep: string;
};
const formVazio: ClienteForm = {
  nome: "", tipo: "cliente_final", documento: "", telefone: "",
  email: "", endereco: "", cidade: "", estado: "", cep: "",
};

const recalcSubtotal = (i: ItemPedido): ItemPedido => ({
  ...i,
  subtotal: Math.max(0, i.preco_unitario * i.quantidade - (i.desconto ?? 0)),
});

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
  const [descontoGeral, setDescontoGeral] = useState<string>("");
  const [descontoTipo, setDescontoTipo] = useState<"valor" | "percent">("valor");
  const [salvando, setSalvando] = useState(false);
  const [dlgCliente, setDlgCliente] = useState<{ open: boolean; edit: Cliente | null }>({ open: false, edit: null });
  const [preview, setPreview] = useState<{ open: boolean; pedido: PedidoComItens | null; formato: "a4" | "cupom" }>({ open: false, pedido: null, formato: "a4" });
  const [histBusca, setHistBusca] = useState("");
  const [histPeriodo, setHistPeriodo] = useState<"7" | "30" | "90" | "all">("30");
  const [histCanal, setHistCanal] = useState<"todos" | Canal>("todos");

  const abrirPreview = (p: PedidoComItens, formato: "a4" | "cupom" = "a4") =>
    setPreview({ open: true, pedido: p, formato });

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

  useEffect(() => {
    setCarrinho((prev) =>
      prev.map((i) => {
        const preco = precoDoProduto(i.tempero_id);
        return recalcSubtotal({ ...i, preco_unitario: preco });
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
          i.tempero_id === temperoId ? recalcSubtotal({ ...i, quantidade: i.quantidade + 1 }) : i
        );
      }
      return [
        ...prev,
        recalcSubtotal({
          tempero_id: temperoId,
          nome_produto: t.nome,
          quantidade: 1,
          preco_unitario: preco,
          desconto: 0,
          subtotal: 0,
        }),
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
          return recalcSubtotal({ ...i, quantidade: q });
        })
        .filter((i) => i.quantidade > 0)
    );
  };

  const mudarDescontoItem = (id: string, valor: number) => {
    setCarrinho((prev) =>
      prev.map((i) =>
        i.tempero_id === id
          ? recalcSubtotal({ ...i, desconto: Math.max(0, Math.min(i.preco_unitario * i.quantidade, valor)) })
          : i
      )
    );
  };

  const removerItem = (id: string) =>
    setCarrinho((prev) => prev.filter((i) => i.tempero_id !== id));

  const subtotal = carrinho.reduce((s, i) => s + i.subtotal, 0);
  const totalItens = carrinho.reduce((s, i) => s + i.quantidade, 0);
  const descontoNum = Number(descontoGeral.replace(",", ".")) || 0;
  const descontoAplicado = descontoTipo === "percent"
    ? Math.min(subtotal, subtotal * (descontoNum / 100))
    : Math.min(subtotal, descontoNum);
  const total = Math.max(0, subtotal - descontoAplicado);

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
        desconto: descontoAplicado,
        itens: carrinho,
      });
      toast.success(`Pedido #${String(p.numero).padStart(6, "0")} confirmado`);
      const novosPedidos = await fetchPedidos(user.id);
      setPedidos(novosPedidos);
      abrirPreview(p, "a4");
      setCarrinho([]);
      setObs("");
      setDescontoGeral("");
      setClienteSel(null);
      window.dispatchEvent(new Event("temperos:refresh"));
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao registrar pedido");
    } finally {
      setSalvando(false);
    }
  };

  const duplicarPedido = (p: PedidoComItens) => {
    // recarrega itens no carrinho com preços atuais e valida estoque
    const novos: ItemPedido[] = [];
    let ajustou = false;
    for (const item of p.itens) {
      const t = temperos.find((x) => x.id === item.tempero_id);
      if (!t) continue;
      const qtd = Math.min(item.quantidade, t.estoqueAtual);
      if (qtd <= 0) { ajustou = true; continue; }
      if (qtd < item.quantidade) ajustou = true;
      const preco = (() => {
        const c = calcularTempero(t, variaveis);
        return p.canal === "atacado" ? c.precoAtacado : c.precoCliente;
      })();
      novos.push(recalcSubtotal({
        tempero_id: item.tempero_id,
        nome_produto: t.nome,
        quantidade: qtd,
        preco_unitario: preco,
        desconto: 0,
        subtotal: 0,
      }));
    }
    if (novos.length === 0) {
      toast.error("Nenhum item disponível em estoque para duplicar");
      return;
    }
    setCanal(p.canal);
    setClienteSel(p.cliente ?? null);
    setCarrinho(novos);
    setObs(p.observacoes ?? "");
    setDescontoGeral("");
    toast.success(ajustou ? "Pedido duplicado (quantidades ajustadas ao estoque)" : "Pedido duplicado no carrinho");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_380px] gap-4">
        {/* Clientes */}
        <Card className="p-3 flex flex-col gap-3 max-h-[calc(100vh-220px)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm tracking-widest uppercase">Clientes</h2>
            <Button
              size="sm" variant="outline" className="h-8"
              onClick={() => setDlgCliente({ open: true, edit: null })}
            >
              <UserPlus className="h-3 w-3 mr-1" /> Novo
            </Button>
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
              <div
                key={c.id}
                className={`group rounded-md border ${
                  clienteSel?.id === c.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-muted"
                }`}
              >
                <button
                  onClick={() => {
                    setClienteSel(c);
                    setCanal(c.tipo);
                  }}
                  className="w-full text-left p-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.nome}</div>
                      <div className="text-muted-foreground text-[10px] uppercase tracking-wider">
                        {c.tipo === "atacado" ? "Atacado" : "Cliente final"}
                        {c.telefone ? ` · ${c.telefone}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDlgCliente({ open: true, edit: c }); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary p-1"
                      title="Editar"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                </button>
              </div>
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
                onClick={() => { setCarrinho([]); setDescontoGeral(""); }}
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
              <div key={i.tempero_id} className="border rounded-md p-2 text-xs space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium leading-tight">{i.nome_produto}</div>
                  <button onClick={() => removerItem(i.tempero_id)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
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
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Desc.</span>
                  <Input
                    type="number" min={0} step="0.01"
                    value={i.desconto || ""}
                    placeholder="R$ 0,00"
                    onChange={(e) => mudarDescontoItem(i.tempero_id, Number(e.target.value) || 0)}
                    className="h-6 text-xs px-2"
                  />
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

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Desconto no total
            </Label>
            <div className="flex gap-1">
              <Input
                type="number" min={0} step="0.01"
                value={descontoGeral}
                placeholder="0"
                onChange={(e) => setDescontoGeral(e.target.value)}
                className="h-8 text-xs"
              />
              <ToggleGroup
                type="single"
                value={descontoTipo}
                onValueChange={(v) => v && setDescontoTipo(v as any)}
                className="border rounded-md"
              >
                <ToggleGroupItem value="valor" className="h-8 px-2 text-xs">R$</ToggleGroupItem>
                <ToggleGroupItem value="percent" className="h-8 px-2 text-xs">%</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>{totalItens} unidades · {carrinho.length} produto(s)</span>
              <span>{brl(subtotal)}</span>
            </div>
            {descontoAplicado > 0 && (
              <div className="flex justify-between text-destructive text-xs">
                <span>Desconto</span>
                <span>-{brl(descontoAplicado)}</span>
              </div>
            )}
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="font-display text-sm tracking-widest uppercase">Histórico de pedidos</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Nº, cliente..."
                value={histBusca}
                onChange={(e) => setHistBusca(e.target.value)}
                className="pl-7 h-9 w-56 text-xs"
              />
            </div>
            <ToggleGroup
              type="single"
              value={histCanal}
              onValueChange={(v) => v && setHistCanal(v as any)}
              className="border rounded-md"
            >
              <ToggleGroupItem value="todos" className="h-9 px-3 text-xs">Todos</ToggleGroupItem>
              <ToggleGroupItem value="cliente_final" className="h-9 px-3 text-xs">Cliente</ToggleGroupItem>
              <ToggleGroupItem value="atacado" className="h-9 px-3 text-xs">Atacado</ToggleGroupItem>
            </ToggleGroup>
            <Select value={histPeriodo} onValueChange={(v) => setHistPeriodo(v as any)}>
              <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {(() => {
          const agora = Date.now();
          const dias = histPeriodo === "all" ? Infinity : Number(histPeriodo);
          const limite = agora - dias * 24 * 60 * 60 * 1000;
          const q = histBusca.toLowerCase().trim();
          const filtrados = pedidos.filter((p) => {
            if (new Date(p.data_pedido).getTime() < limite) return false;
            if (histCanal !== "todos" && p.canal !== histCanal) return false;
            if (q) {
              const num = String(p.numero).padStart(6, "0");
              const nome = (p.cliente?.nome ?? "").toLowerCase();
              if (!num.includes(q) && !nome.includes(q)) return false;
            }
            return true;
          });
          if (filtrados.length === 0) {
            return <p className="text-xs text-muted-foreground">Nenhum pedido encontrado para o filtro selecionado.</p>;
          }
          const totalPeriodo = filtrados.reduce((s, p) => s + Number(p.total), 0);
          return (
            <>
              <div className="text-[11px] text-muted-foreground mb-2">
                {filtrados.length} pedido(s) · Total: <span className="font-display text-foreground">{brl(totalPeriodo)}</span>
              </div>
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
                    {filtrados.map((p) => (
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
                            <Button size="sm" variant="ghost" title="Nota A4" onClick={() => abrirPreview(p, "a4")}>
                              <FileText className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" title="Cupom 80mm" onClick={() => abrirPreview(p, "cupom")}>
                              <Receipt className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" title="Duplicar" onClick={() => duplicarPedido(p)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Enviar por e-mail"
                              disabled={!p.cliente?.email}
                              onClick={async () => {
                                if (!p.cliente?.email) {
                                  toast.error("Cliente sem e-mail cadastrado");
                                  return;
                                }
                                try {
                                  const { error } = await supabase.functions.invoke(
                                    "send-transactional-email",
                                    {
                                      body: {
                                        templateName: "nota-pedido",
                                        recipientEmail: p.cliente.email,
                                        idempotencyKey: `nota-${p.id}`,
                                        templateData: {
                                          numero: p.numero,
                                          data: new Date(p.data_pedido).toLocaleString("pt-BR"),
                                          clienteNome: p.cliente?.nome ?? "Cliente",
                                          canal: p.canal === "atacado" ? "Atacado" : "Cliente Final",
                                          itens: p.itens.map((i) => ({
                                            nome_produto: i.nome_produto,
                                            quantidade: i.quantidade,
                                            preco_unitario: i.preco_unitario,
                                            subtotal: i.subtotal,
                                          })),
                                          subtotal: p.itens.reduce((s, i) => s + i.preco_unitario * i.quantidade, 0),
                                          desconto: (p as any).desconto ?? 0,
                                          total: p.total,
                                          observacoes: (p as any).observacoes,
                                        },
                                      },
                                    }
                                  );
                                  if (error) throw error;
                                  toast.success(`Nota enviada para ${p.cliente.email}`);
                                } catch (e: any) {
                                  toast.error(e.message ?? "Falha ao enviar");
                                }
                              }}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Cancelar"
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
            </>
          );
        })()}
      </Card>

      <NotaPreviewDialog
        pedido={preview.pedido}
        open={preview.open}
        onOpenChange={(o) => setPreview((s) => ({ ...s, open: o }))}
        formato={preview.formato}
      />


      <ClienteDialog
        state={dlgCliente}
        onOpenChange={(o) => setDlgCliente((s) => ({ ...s, open: o }))}
        onSaved={(c, isNew) => {
          setClientes((prev) => {
            const rest = prev.filter((x) => x.id !== c.id);
            return [...rest, c].sort((a, b) => a.nome.localeCompare(b.nome));
          });
          if (isNew) {
            setClienteSel(c);
            setCanal(c.tipo);
          } else if (clienteSel?.id === c.id) {
            setClienteSel(c);
          }
        }}
      />
    </div>
  );
}

// ---------- Cliente Dialog (novo + editar) ----------
function ClienteDialog({
  state, onOpenChange, onSaved,
}: {
  state: { open: boolean; edit: Cliente | null };
  onOpenChange: (o: boolean) => void;
  onSaved: (c: Cliente, isNew: boolean) => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState<ClienteForm>(formVazio);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state.open) {
      if (state.edit) {
        setForm({
          nome: state.edit.nome,
          tipo: state.edit.tipo,
          documento: state.edit.documento ?? "",
          telefone: state.edit.telefone ?? "",
          email: state.edit.email ?? "",
          endereco: state.edit.endereco ?? "",
          cidade: state.edit.cidade ?? "",
          estado: state.edit.estado ?? "",
          cep: state.edit.cep ?? "",
        });
      } else {
        setForm(formVazio);
      }
    }
  }, [state]);

  const salvar = async () => {
    if (!user) return;
    if (!form.nome.trim()) {
      toast.error("Informe o nome");
      return;
    }
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (state.edit) payload.id = state.edit.id;
      const c = await upsertCliente(user.id, payload);
      onSaved(c, !state.edit);
      toast.success(state.edit ? "Cliente atualizado" : "Cliente cadastrado");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{state.edit ? "Editar cliente" : "Novo cliente"}</DialogTitle>
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
