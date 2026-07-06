import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tempero, Variaveis, VARIAVEIS_INICIAIS } from "@/data/temperos";
import {
  fetchTemperos, fetchVariaveis, upsertTempero, deleteTempero as apiDelete,
  createTempero, saveVariaveis,
} from "@/lib/api";
import { toast } from "sonner";

type Ctx = {
  loading: boolean;
  temperos: Tempero[];
  variaveis: Variaveis;
  updateTempero: (t: Tempero) => void;
  deleteTempero: (id: string) => void;
  addTempero: () => Promise<void>;
  setVariaveis: (v: Variaveis) => void;
  resetVariaveis: () => void;
};

const DashboardCtx = createContext<Ctx | null>(null);

const useDebouncedEffect = (fn: () => void, deps: any[], ms = 500) => {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(fn, ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [temperos, setTemperos] = useState<Tempero[]>([]);
  const [variaveis, setVars] = useState<Variaveis>(VARIAVEIS_INICIAIS);
  const [loading, setLoading] = useState(true);
  const dirtyTemperos = useRef<Set<string>>(new Set());
  const varDirty = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) nav("/auth", { replace: true });
  }, [user, authLoading, nav]);

  const seedingRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Guard contra corridas: StrictMode dupla-monta o efeito e o
      // listener "temperos:refresh" também dispara fetchTemperos, o que
      // já causou seed duplicado. Um único fetch por ciclo de user.
      if (seedingRef.current) return;
      seedingRef.current = true;
      try {
        setLoading(true);
        const [t, v] = await Promise.all([fetchTemperos(user.id), fetchVariaveis(user.id)]);
        setTemperos(t);
        setVars(v);
        try { localStorage.setItem(`temperanzza:seeded:${user.id}`, "1"); } catch {}
      } catch (e: any) {
        toast.error("Erro ao carregar: " + e.message);
      } finally {
        setLoading(false);
        seedingRef.current = false;
      }
    };
    load();
    const refresh = () => {
      if (seedingRef.current) return;
      fetchTemperos(user.id).then(setTemperos).catch(() => {});
    };
    window.addEventListener("temperos:refresh", refresh);
    return () => window.removeEventListener("temperos:refresh", refresh);
  }, [user]);

  useDebouncedEffect(() => {
    if (!user || dirtyTemperos.current.size === 0) return;
    const ids = Array.from(dirtyTemperos.current);
    dirtyTemperos.current.clear();
    const toSave = temperos.filter((t) => ids.includes(t.id));
    Promise.all(toSave.map((t) => upsertTempero(user.id, t))).catch((e) =>
      toast.error("Falha ao salvar: " + e.message)
    );
  }, [temperos, user]);

  useDebouncedEffect(() => {
    if (!user || !varDirty.current) return;
    varDirty.current = false;
    saveVariaveis(user.id, variaveis).catch((e) =>
      toast.error("Falha ao salvar variáveis: " + e.message)
    );
  }, [variaveis, user]);

  const updateTempero = (t: Tempero) => {
    dirtyTemperos.current.add(t.id);
    setTemperos((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  };

  const deleteTempero = async (id: string) => {
    setTemperos((prev) => prev.filter((t) => t.id !== id));
    try { await apiDelete(id); } catch (e: any) { toast.error(e.message); }
  };

  const addTempero = async () => {
    if (!user) return;
    const ordem = Math.max(0, ...temperos.map((t) => t.ordem)) + 1;
    try {
      const novo = await createTempero(user.id, ordem);
      setTemperos((prev) => [...prev, novo]);
    } catch (e: any) { toast.error(e.message); }
  };

  const setVariaveis = (v: Variaveis) => {
    varDirty.current = true;
    setVars(v);
  };

  const resetVariaveis = () => {
    varDirty.current = true;
    setVars(VARIAVEIS_INICIAIS);
  };

  return (
    <DashboardCtx.Provider
      value={{ loading: loading || authLoading, temperos, variaveis, updateTempero, deleteTempero, addTempero, setVariaveis, resetVariaveis }}
    >
      {children}
    </DashboardCtx.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error("useDashboard fora do Provider");
  return ctx;
};
