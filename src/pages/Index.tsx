import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tempero, Variaveis, VARIAVEIS_INICIAIS } from "@/data/temperos";
import {
  fetchTemperos, fetchVariaveis, upsertTempero, deleteTempero as apiDelete,
  createTempero, saveVariaveis,
} from "@/lib/api";
import { VariaveisPanel } from "@/components/VariaveisPanel";
import { TemperosTable } from "@/components/TemperosTable";
import { calcularTempero } from "@/lib/calc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const useDebouncedEffect = (fn: () => void, deps: any[], ms = 500) => {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(fn, ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [temperos, setTemperos] = useState<Tempero[]>([]);
  const [variaveis, setVariaveis] = useState<Variaveis>(VARIAVEIS_INICIAIS);
  const [loading, setLoading] = useState(true);
  const dirtyTemperos = useRef<Set<string>>(new Set());
  const varDirty = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) nav("/auth", { replace: true });
  }, [user, authLoading, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const [t, v] = await Promise.all([fetchTemperos(user.id), fetchVariaveis(user.id)]);
        setTemperos(t);
        setVariaveis(v);
      } catch (e: any) {
        toast.error("Erro ao carregar: " + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Persist alterações de temperos (debounced)
  useDebouncedEffect(() => {
    if (!user || dirtyTemperos.current.size === 0) return;
    const ids = Array.from(dirtyTemperos.current);
    dirtyTemperos.current.clear();
    const toSave = temperos.filter((t) => ids.includes(t.id));
    Promise.all(toSave.map((t) => upsertTempero(user.id, t)))
      .catch((e) => toast.error("Falha ao salvar: " + e.message));
  }, [temperos, user]);

  useDebouncedEffect(() => {
    if (!user || !varDirty.current) return;
    varDirty.current = false;
    saveVariaveis(user.id, variaveis).catch((e) =>
      toast.error("Falha ao salvar variáveis: " + e.message)
    );
  }, [variaveis, user]);

  const handleUpdate = (t: Tempero) => {
    dirtyTemperos.current.add(t.id);
    setTemperos((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  };

  const handleDelete = async (id: string) => {
    setTemperos((prev) => prev.filter((t) => t.id !== id));
    try { await apiDelete(id); } catch (e: any) { toast.error(e.message); }
  };

  const handleAdd = async () => {
    if (!user) return;
    const ordem = Math.max(0, ...temperos.map((t) => t.ordem)) + 1;
    try {
      const novo = await createTempero(user.id, ordem);
      setTemperos((prev) => [...prev, novo]);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleVarChange = (v: Variaveis) => {
    varDirty.current = true;
    setVariaveis(v);
  };

  const handleResetVars = () => {
    varDirty.current = true;
    setVariaveis(VARIAVEIS_INICIAIS);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/auth", { replace: true });
  };

  const stats = useMemo(() => {
    if (temperos.length === 0) return { custo: 0, cliente: 0, margem: 0 };
    const totals = temperos.reduce(
      (acc, t) => {
        const c = calcularTempero(t, variaveis);
        acc.custo += c.custoTotal; acc.cliente += c.precoCliente; acc.margem += c.margemPct;
        return acc;
      },
      { custo: 0, cliente: 0, margem: 0 }
    );
    return {
      custo: totals.custo / temperos.length,
      cliente: totals.cliente / temperos.length,
      margem: totals.margem / temperos.length,
    };
  }, [temperos, variaveis]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-hero-gradient text-cream border-b-4 border-gold">
        <div className="container py-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-gold text-sm tracking-[0.3em] uppercase mb-2">Temperanzza</p>
            <h1 className="font-display text-4xl md:text-5xl">Dashboard de Custos & Precificação</h1>
            <p className="text-cream/70 mt-2 max-w-2xl">
              Controle matéria-prima, encargos e markups em tempo real. Alterações
              são salvas automaticamente na nuvem.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-cream/60">{user?.email}</span>
            <Button size="sm" variant="outline" onClick={logout}
              className="bg-transparent border-gold/40 text-cream hover:bg-gold/10">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Produtos" value={String(temperos.length)} />
          <StatCard label="Custo médio / pote" value={brl(stats.custo)} />
          <StatCard label="Preço cliente médio" value={brl(stats.cliente)} accent />
          <StatCard label="Margem média" value={`${stats.margem.toFixed(1)}%`} accent />
        </section>

        <VariaveisPanel
          variaveis={variaveis}
          onChange={handleVarChange}
          onReset={handleResetVars}
        />

        <TemperosTable
          temperos={temperos}
          variaveis={variaveis}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />

        <footer className="text-center text-xs text-muted-foreground py-6">
          Temperanzza Condimentos · Dashboard interno · Salvo automaticamente
        </footer>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <Card className="shadow-card bg-card-gradient">
    <CardContent className="p-5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`font-display text-3xl mt-1 ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </CardContent>
  </Card>
);

export default Index;
