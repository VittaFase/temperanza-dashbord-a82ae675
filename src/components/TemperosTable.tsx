import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tempero, Variaveis } from "@/data/temperos";
import { calcularTempero } from "@/lib/calc";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  temperos: Tempero[];
  variaveis: Variaveis;
  onChange: (t: Tempero[]) => void;
};

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const TemperosTable = ({ temperos, variaveis, onChange }: Props) => {
  const upd = (id: number, patch: Partial<Tempero>) =>
    onChange(temperos.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const remove = (id: number) => onChange(temperos.filter((t) => t.id !== id));

  const add = () => {
    const nextId = Math.max(0, ...temperos.map((t) => t.id)) + 1;
    onChange([
      ...temperos,
      { id: nextId, nome: "Novo tempero", precoKg: 10, gramasPote: 50 },
    ]);
  };

  const totais = temperos.reduce(
    (acc, t) => {
      const c = calcularTempero(t, variaveis);
      acc.custo += c.custoTotal;
      acc.industria += c.precoIndustria;
      acc.atacado += c.precoAtacado;
      acc.cliente += c.precoCliente;
      return acc;
    },
    { custo: 0, industria: 0, atacado: 0, cliente: 0 }
  );

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-2xl">Temperos & Precificação</CardTitle>
        <Button size="sm" onClick={add} variant="outline">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/60">
              <TableHead className="w-10">#</TableHead>
              <TableHead className="min-w-[200px]">Produto</TableHead>
              <TableHead className="w-28">R$/kg</TableHead>
              <TableHead className="w-24">g/pote</TableHead>
              <TableHead className="w-28">Matéria-prima</TableHead>
              <TableHead className="w-28">Custo Total</TableHead>
              <TableHead className="w-28 text-primary">Indústria</TableHead>
              <TableHead className="w-28 text-primary">Atacado</TableHead>
              <TableHead className="w-28 text-primary">Cliente</TableHead>
              <TableHead className="w-20">Margem</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {temperos.map((t, i) => {
              const c = calcularTempero(t, variaveis);
              return (
                <TableRow key={t.id} className="hover:bg-secondary/30">
                  <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                  <TableCell>
                    <Input
                      value={t.nome}
                      onChange={(e) => upd(t.id, { nome: e.target.value })}
                      className="h-8 border-0 bg-transparent focus-visible:bg-background font-medium"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={t.precoKg}
                      onChange={(e) => upd(t.id, { precoKg: parseFloat(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="1"
                      value={t.gramasPote}
                      onChange={(e) => upd(t.id, { gramasPote: parseFloat(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{brl(c.custoMateriaPrima)}</TableCell>
                  <TableCell className="text-sm font-semibold">{brl(c.custoTotal)}</TableCell>
                  <TableCell className="font-semibold text-primary">{brl(c.precoIndustria)}</TableCell>
                  <TableCell className="font-semibold text-primary">{brl(c.precoAtacado)}</TableCell>
                  <TableCell className="font-semibold text-primary">{brl(c.precoCliente)}</TableCell>
                  <TableCell className="text-sm text-herb-green font-medium">
                    {c.margemPct.toFixed(0)}%
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => remove(t.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-accent/10 font-semibold">
              <TableCell colSpan={5} className="text-right">Totais ({temperos.length} itens)</TableCell>
              <TableCell>{brl(totais.custo)}</TableCell>
              <TableCell className="text-primary">{brl(totais.industria)}</TableCell>
              <TableCell className="text-primary">{brl(totais.atacado)}</TableCell>
              <TableCell className="text-primary">{brl(totais.cliente)}</TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
