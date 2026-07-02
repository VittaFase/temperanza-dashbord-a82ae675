import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const FN_URL = `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`;

type State = "loading" | "confirm" | "done" | "already" | "invalid" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const r = await fetch(`${FN_URL}?token=${encodeURIComponent(token)}`, {
          headers: { apikey: SUPABASE_ANON_KEY },
        });
        const j = await r.json();
        if (j.valid) setState("confirm");
        else if (j.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      } catch { setState("error"); }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const r = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ token }),
      });
      const j = await r.json();
      if (j.success) setState("done");
      else if (j.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch { setState("error"); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <h1 className="font-display text-2xl">Cancelar inscrição</h1>
        {state === "loading" && <Loader2 className="mx-auto h-6 w-6 animate-spin" />}
        {state === "confirm" && (
          <>
            <p className="text-muted-foreground">
              Confirme que deseja parar de receber e-mails da Temperanzza.
            </p>
            <Button onClick={confirm} disabled={busy} className="w-full">
              {busy ? "Processando..." : "Confirmar cancelamento"}
            </Button>
          </>
        )}
        {state === "done" && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <p>Você não receberá mais e-mails deste remetente.</p>
          </>
        )}
        {state === "already" && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
            <p>Sua inscrição já havia sido cancelada.</p>
          </>
        )}
        {(state === "invalid" || state === "error") && (
          <>
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <p className="text-muted-foreground">
              Link inválido ou expirado.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
