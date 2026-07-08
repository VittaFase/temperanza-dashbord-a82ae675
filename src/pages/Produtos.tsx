import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Download, Search, AlertTriangle, Pencil, Package, Coins, TrendingUp, Truck, Store, Users, Warehouse } from "lucide-react";
import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { calcularTempero } from "@/lib/calc";
import { classificarMargem, FaixaMargem } from "@/data/temperos";
import { ProdutoFoto } from "@/components/ProdutoFoto";
import { ProdutoDetalhesDrawer } from "@/components/ProdutoDetalhesDrawer";
import { Tempero } from "@/data/temperos";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const csvEscape = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;

const MARGEM_CLASSES: Record<FaixaMargem, string> = {
  baixa: "bg-destructive/15 text-destructive border-destructive/30",
  aceitavel: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  boa: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  excelente: "bg-sky-500/15 text-sky-600 border-sky-500/30",
};

const Produtos = () => {
  const { temperos, variaveis, updateTempero, deleteTempero, addTempero } = useDashboard();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Tempero | null>(null);

  const filtrados = temperos.filter((t) => {
    const s = q.toLowerCase();
    return (
      t.nome.toLowerCase().includes(s) ||
      (t.sku ?? "").toLowerCase().includes(s) ||
      (t.ean ?? "").includes(s)
    );
  });

  const editingSync = editing ? temperos.find((t) => t.id === editing.id) ?? null : null;

  const resumo = useMemo(() => {
    const calc = temperos.map((t) => ({ t, c: calcularTempero(t, variaveis) }));
    const n = calc.length || 1;
    const avg = (fn: (x: typeof calc[number]) => number) =>
      calc.reduce((a, x) => a + fn(x), 0) / n;
    const valorEstoque = calc.reduce((a, x) => a + x.c.custoTotal * x.t.estoqueAtual, 0);
    return {
      total: temperos.length,
      custoMedio: avg((x) => x.c.custoTotal),
      distribMedio: avg((x) => x.c.precoDistribuidor),
      atacadoMedio: avg((x) => x.c.precoAtacado),
      clienteMedio: avg((x) => x.c.precoCliente),
      margemMedia: avg((x) => x.c.margemClientePct),
      valorEstoque,
    };
  }, [temperos, variaveis]);

  const exportCsv = () => {
    const header = [
      "SKU","EAN","Produto","Custo MP/kg","Gramas/pote","Estoque","Mínimo",
      "Custo total","Preço Distribuidor","Preço Atacado","Preço Cliente",
      "Margem Distrib. %","Margem Atac. %","Margem Cli. %",
    ];
    const rows = temperos.map((t) => {
      const c = calcularTempero(t, variaveis);
      return [
        csvEscape(t.sku ?? ""), csvEscape(t.ean ?? ""), csvEscape(t.nome),
        t.precoKg, t.gramasPote, t.estoqueAtual, t.estoqueMinimo,
        c.custoTotal.toFixed(4),
        c.precoDistribuidor.toFixed(2), c.precoAtacado.toFixed(2), c.precoCliente.toFixed(2),
        c.margemDistribuidorPct.toFixed(2), c.margemAtacadoPct.toFixed(2), c.margemClientePct.toFixed(2),
      ].join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `temperanzza-produtos-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-6 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-gold text-xs tracking-[0.3em] uppercase">Produtos</p>
          <h1 className="font-display text-3xl">Ficha técnica & precificação</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button size="sm" onClick={addTempero}>
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </div>
      </header>

      {/* Painel resumo - 7 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard icon={<Package className="h-4 w-4" />} label="Produtos" value={String(resumo.total)} />
        <KpiCard icon={<Coins className="h-4 w-4" />} label="Custo médio" value={brl(resumo.custoMedio)} />
        <KpiCard icon={<Truck className="h-4 w-4" />} label="Distribuidor médio" value={brl(resumo.distribMedio)} accent />
        <KpiCard icon={<Store className="h-4 w-4" />} label="Atacado médio" value={brl(resumo.atacadoMedio)} accent />
        <KpiCard icon={<Users className="h-4 w-4" />} label="Cliente médio" value={brl(resumo.clienteMedio)} accent />
        <KpiCard icon={<TrendingUp className="h-4 w-4" />} label="Margem média" value={`${resumo.margemMedia.toFixed(1)}%`} />
        <KpiCard icon={<Warehouse className="h-4 w-4" />} label="Valor do estoque" value={brl(resumo.valorEstoque)} />
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="font-display text-xl">
            {filtrados.length} de {temperos.length} produtos
          </CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, SKU ou EAN..."
              className="pl-8 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60">
                <TableHead className="w-14"></TableHead>
                <TableHead className="min-w-[200px]">Produto</TableHead>
                <TableHead className="w-24 text-right">Preço/kg</TableHead>
                <TableHead className="w-20 text-right">Gramas</TableHead>
                <TableHead className="w-24 text-right">Estoque</TableHead>
                <TableHead className="w-28 border-l">Custo total</TableHead>
                <TableHead className="w-28 text-primary border-l">Distribuidor</TableHead>
                <TableHead className="w-28 text-primary">Atacado</TableHead>
                <TableHead className="w-28 text-primary">Cliente Final</TableHead>
                <TableHead className="w-20 text-center border-l">M. Dist.</TableHead>
                <TableHead className="w-20 text-center">M. Atac.</TableHead>
                <TableHead className="w-20 text-center">M. Cli.</TableHead>
                <TableHead className="w-20 border-l"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((t) => {
                const c = calcularTempero(t, variaveis);
                const baixo = t.estoqueAtual < t.estoqueMinimo;
                const alertas = variaveis.politicaComercial.alertas;
                const fD = classificarMargem(c.margemDistribuidorPct, alertas);
                const fA = classificarMargem(c.margemAtacadoPct, alertas);
                const fC = classificarMargem(c.margemClientePct, alertas);
                return (
                  <TableRow key={t.id} className="hover:bg-secondary/30">
                    <TableCell>
                      <button
                        onClick={() => setEditing(t)}
                        className="block hover:opacity-80 transition"
                        title="Abrir detalhes"
                      >
                        <ProdutoFoto path={t.fotoPath} size={40} alt={t.nome} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {baixo && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                        <Input
                          value={t.nome}
                          onChange={(e) => updateTempero({ ...t, nome: e.target.value })}
                          className="h-8 border-0 bg-transparent focus-visible:bg-background font-medium"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" value={t.precoKg}
                        onChange={(e) => updateTempero({ ...t, precoKg: parseFloat(e.target.value) || 0 })}
                        className="h-8 no-spin text-right tabular-nums text-[10px] px-1.5" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="1" value={t.gramasPote}
                        onChange={(e) => updateTempero({ ...t, gramasPote: parseFloat(e.target.value) || 0 })}
                        className="h-8 no-spin text-right tabular-nums text-[10px] px-1.5" />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="1"
                        value={t.estoqueAtual}
                        onChange={(e) => updateTempero({ ...t, estoqueAtual: parseInt(e.target.value) || 0 })}
                        className={`h-8 no-spin text-right tabular-nums text-[10px] px-1.5 ${baixo ? "text-destructive font-semibold" : ""}`}
                      />
                    </TableCell>
                    <TableCell className="text-xs font-semibold tabular-nums border-l">{brl(c.custoTotal)}</TableCell>
                    <TableCell className="text-xs font-semibold text-primary tabular-nums border-l">{brl(c.precoDistribuidor)}</TableCell>
                    <TableCell className="text-xs font-semibold text-primary tabular-nums">{brl(c.precoAtacado)}</TableCell>
                    <TableCell className="text-xs font-semibold text-primary tabular-nums">{brl(c.precoCliente)}</TableCell>
                    <TableCell className="text-center border-l">
                      <Badge variant="outline" className={`text-[10px] ${MARGEM_CLASSES[fD]}`}>
                        {c.margemDistribuidorPct.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-[10px] ${MARGEM_CLASSES[fA]}`}>
                        {c.margemAtacadoPct.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-[10px] ${MARGEM_CLASSES[fC]}`}>
                        {c.margemClientePct.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="border-l">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditing(t)}
                          className="text-muted-foreground hover:text-primary p-1"
                          aria-label="editar detalhes"
                          title="Foto, SKU, EAN e tabela nutricional"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTempero(t.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                          aria-label="remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {/* Legenda das faixas de margem */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            <span className="uppercase tracking-widest">Faixas de margem:</span>
            <Badge variant="outline" className={MARGEM_CLASSES.baixa}>Baixa ≤ {variaveis.politicaComercial.alertas.margemBaixaAte}%</Badge>
            <Badge variant="outline" className={MARGEM_CLASSES.aceitavel}>Aceitável ≤ {variaveis.politicaComercial.alertas.margemAceitavelAte}%</Badge>
            <Badge variant="outline" className={MARGEM_CLASSES.boa}>Boa ≤ {variaveis.politicaComercial.alertas.margemBoaAte}%</Badge>
            <Badge variant="outline" className={MARGEM_CLASSES.excelente}>Excelente &gt; {variaveis.politicaComercial.alertas.margemBoaAte}%</Badge>
          </div>
        </CardContent>
      </Card>

      <ProdutoDetalhesDrawer
        tempero={editingSync}
        variaveis={variaveis}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        onSave={updateTempero}
      />
    </div>
  );
};

const KpiCard = ({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) => (
  <Card className="shadow-card bg-card-gradient">
    <CardContent className="p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="text-gold">{icon}</span>
        <span>{label}</span>
      </div>
      <p className={`font-display text-lg tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
    </CardContent>
  </Card>
);

export default Produtos;
