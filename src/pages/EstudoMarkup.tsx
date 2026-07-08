import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { calcularTempero, formatMarkupX, markupMultiplier } from "@/lib/calc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info } from "lucide-react";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const pctBR = (n: number) =>
  `${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

type CanalInfo = {
  key: "distribuidor" | "atacado" | "cliente";
  label: string;
  preco: number;
  margem: number;
};

const EstudoMarkup = () => {
  const { temperos, variaveis } = useDashboard();

  const defaultId = useMemo(() => {
    const ervas = temperos.find((t) => t.nome.toLowerCase().includes("ervas finas"));
    return ervas?.id ?? temperos[0]?.id ?? "";
  }, [temperos]);

  const [selectedId, setSelectedId] = useState<string>(defaultId);
  const produto = temperos.find((t) => t.id === selectedId) ?? temperos.find((t) => t.id === defaultId);

  if (!produto) {
    return (
      <div className="container py-6">
        <p className="text-muted-foreground">Cadastre um produto para visualizar o estudo.</p>
      </div>
    );
  }

  const calc = calcularTempero(produto, variaveis);
  const custo = calc.custoTotal;

  const canais: CanalInfo[] = [
    { key: "distribuidor", label: "Distribuidor", preco: calc.precoDistribuidor, margem: calc.margemDistribuidorPct },
    { key: "atacado", label: "Atacado", preco: calc.precoAtacado, margem: calc.margemAtacadoPct },
    { key: "cliente", label: "Cliente Final", preco: calc.precoCliente, margem: calc.margemClientePct },
  ];

  return (
    <div className="container py-6 space-y-6">
      <header>
        <p className="text-gold text-xs tracking-[0.3em] uppercase">Análise</p>
        <h1 className="font-display text-3xl">Estudo de Markup por Canal</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Comparativo lado a lado entre <strong>markup</strong> (multiplicador sobre o custo)
          e <strong>margem percentual</strong> (lucro bruto sobre o preço), para alinhar a
          linguagem comercial e financeira.
        </p>
      </header>

      <Card className="shadow-card">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-end gap-4 justify-between">
          <div className="flex-1 max-w-md">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Produto</p>
            <Select value={selectedId || defaultId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {temperos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Custo total do produto</p>
            <p className="font-display text-3xl text-primary tabular-nums">{brl(custo)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {canais.map((c) => {
          const lucro = c.preco - custo;
          const markup = markupMultiplier(c.preco, custo);
          return (
            <Card key={c.key} className="shadow-card bg-card-gradient">
              <CardContent className="p-6 space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gold">{c.label}</p>

                <div className="text-center py-3">
                  <p className="font-display text-5xl text-primary tabular-nums leading-none">
                    {formatMarkupX(c.preco, custo)}
                  </p>
                  <p className="font-display text-2xl text-accent tabular-nums mt-2">
                    {pctBR(c.margem)}
                  </p>
                  <div className="flex justify-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    <span>Markup</span>
                    <span>Margem</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço de venda</span>
                    <span className="font-semibold tabular-nums">{brl(c.preco)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lucro por unidade</span>
                    <span className="font-semibold tabular-nums text-emerald-600">{brl(lucro)}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground italic border-l-2 border-accent/40 pl-3">
                  "Este produto tem um markup de{" "}
                  <strong className="text-foreground not-italic">{formatMarkupX(c.preco, custo)}</strong>{" "}
                  e margem percentual de{" "}
                  <strong className="text-foreground not-italic">{pctBR(c.margem)}</strong>."
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Tabela comparativa</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60">
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Preço de venda</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-right">Margem percentual</TableHead>
                <TableHead className="text-right">Markup</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {canais.map((c) => (
                <TableRow key={c.key}>
                  <TableCell className="font-medium">{c.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{brl(c.preco)}</TableCell>
                  <TableCell className="text-right tabular-nums text-emerald-600">
                    {brl(c.preco - custo)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{pctBR(c.margem)}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-primary">
                    {formatMarkupX(c.preco, custo)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-card border-l-4 border-l-accent">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-accent" />
            <p className="font-display text-lg">Como interpretar</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-primary mb-1">Markup</p>
              <p className="text-muted-foreground">
                É o multiplicador aplicado sobre o custo do produto para chegar ao preço de venda.
                Um markup de <strong className="text-foreground">1,91x</strong> significa que o preço
                equivale a 1,91 vezes o custo.
              </p>
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">Margem percentual</p>
              <p className="text-muted-foreground">
                Representa a porcentagem do preço de venda que permanece como lucro bruto.
                Uma margem de <strong className="text-foreground">47,67%</strong> significa que quase
                metade do preço é lucro (antes de despesas fixas).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstudoMarkup;
