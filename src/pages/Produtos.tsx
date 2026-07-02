import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Download, Search, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { calcularTempero } from "@/lib/calc";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const csvEscape = (s: string) => `"${s.replace(/"/g, '""')}"`;

const Produtos = () => {
  const { temperos, variaveis, updateTempero, deleteTempero, addTempero } = useDashboard();
  const [q, setQ] = useState("");

  const filtrados = temperos.filter((t) => t.nome.toLowerCase().includes(q.toLowerCase()));

  const exportCsv = () => {
    const header = [
      "Produto","Custo MP/kg","Gramas/pote","Estoque","Mínimo",
      "Custo MP/pote","Custo direto","Custo c/ fabril","Custo total","Preço indústria","Preço atacado","Preço cliente","Margem %"
    ];
    const rows = temperos.map((t) => {
      const c = calcularTempero(t, variaveis);
      return [
        csvEscape(t.nome), t.precoKg, t.gramasPote, t.estoqueAtual, t.estoqueMinimo,
        c.custoMateriaPrima.toFixed(4), c.custoDireto.toFixed(4), c.custoComFabril.toFixed(4),
        c.custoTotal.toFixed(4), c.precoIndustria.toFixed(2), c.precoAtacado.toFixed(2),
        c.precoCliente.toFixed(2), c.margemPct.toFixed(2),
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

      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="font-display text-xl">
            {filtrados.length} de {temperos.length} produtos
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produto..."
              className="pl-8 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60">
                <TableHead className="min-w-[200px]">Produto</TableHead>
                <TableHead className="w-24">R$/kg</TableHead>
                <TableHead className="w-20">g/pote</TableHead>
                <TableHead className="w-24">Estoque</TableHead>
                <TableHead className="w-20">Mínimo</TableHead>
                <TableHead className="w-28">Custo MP</TableHead>
                <TableHead className="w-28">Custo direto</TableHead>
                <TableHead className="w-28">Custo total</TableHead>
                <TableHead className="w-28 text-primary">Indústria</TableHead>
                <TableHead className="w-28 text-primary">Atacado</TableHead>
                <TableHead className="w-28 text-primary">Cliente</TableHead>
                <TableHead className="w-20">Margem</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((t) => {
                const c = calcularTempero(t, variaveis);
                const baixo = t.estoqueAtual < t.estoqueMinimo;
                return (
                  <TableRow key={t.id} className="hover:bg-secondary/30">
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
                        className="h-8" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="1" value={t.gramasPote}
                        onChange={(e) => updateTempero({ ...t, gramasPote: parseFloat(e.target.value) || 0 })}
                        className="h-8" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="1" value={t.estoqueAtual}
                        onChange={(e) => updateTempero({ ...t, estoqueAtual: parseInt(e.target.value) || 0 })}
                        className={`h-8 ${baixo ? "text-destructive font-semibold" : ""}`} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="1" value={t.estoqueMinimo}
                        onChange={(e) => updateTempero({ ...t, estoqueMinimo: parseInt(e.target.value) || 0 })}
                        className="h-8" />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{brl(c.custoMateriaPrima)}</TableCell>
                    <TableCell className="text-sm">{brl(c.custoDireto)}</TableCell>
                    <TableCell className="text-sm font-semibold">{brl(c.custoTotal)}</TableCell>
                    <TableCell className="font-semibold text-primary">{brl(c.precoIndustria)}</TableCell>
                    <TableCell className="font-semibold text-primary">{brl(c.precoAtacado)}</TableCell>
                    <TableCell className="font-semibold text-primary">{brl(c.precoCliente)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-herb-green">
                        {c.margemPct.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => deleteTempero(t.id)}
                        className="text-muted-foreground hover:text-destructive" aria-label="remover">
                        <Trash2 className="h-4 w-4" />
                      </button>
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

export default Produtos;
