import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    if (req.method !== "POST") {
      return json({ error: "Método não permitido" }, 405);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Não autenticado" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: "Sessão inválida" }, 401);
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return json({ error: "Envie o áudio como multipart/form-data" }, 400);
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return json({ error: "Arquivo de áudio ausente" }, 400);
    }
    if (file.size === 0) {
      return json({ error: "Gravação vazia" }, 400);
    }
    if (file.size > MAX_BYTES) {
      return json({ error: "Áudio muito longo (máx. 10 MB)" }, 413);
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return json({ error: "LOVABLE_API_KEY não configurada" }, 500);
    }

    const upstreamForm = new FormData();
    upstreamForm.append("model", "openai/gpt-4o-mini-transcribe");
    upstreamForm.append("file", file, "recording.wav");
    upstreamForm.append("language", "pt");

    const upstream = await fetch(
      "https://ai.gateway.lovable.dev/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: upstreamForm,
      },
    );

    if (!upstream.ok) {
      const details = await upstream.text().catch(() => "");
      console.error(`Transcrição falhou [${upstream.status}]: ${details}`);
      return json(
        { error: "Falha na transcrição", status: upstream.status, details },
        upstream.status,
      );
    }

    const result = await upstream.json();
    return json({ text: (result?.text ?? "").toString().trim() }, 200);
  } catch (err) {
    console.error("transcribe-audio error:", err);
    return json({ error: (err as Error).message ?? "Erro inesperado" }, 500);
  }
});
