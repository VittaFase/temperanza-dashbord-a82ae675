
ALTER TABLE public.variaveis
  ADD COLUMN IF NOT EXISTS markup_distribuidor numeric(6,3) NOT NULL DEFAULT 1.40,
  ADD COLUMN IF NOT EXISTS politica_comercial jsonb NOT NULL DEFAULT '{
    "canais": {
      "distribuidor": {"min": 30, "recomendado": 40, "padrao": 40, "max": 45},
      "atacado":      {"min": 50, "recomendado": 60, "padrao": 60, "max": 70},
      "marketplace":  {"min": 90, "recomendado": 120, "padrao": 120, "max": 150}
    },
    "alertas": {
      "margemBaixaAte": 35,
      "margemAceitavelAte": 50,
      "margemBoaAte": 65,
      "conflitoAlertaAbaixoDe": 10,
      "conflitoAtencaoAbaixoDe": 15
    }
  }'::jsonb;
