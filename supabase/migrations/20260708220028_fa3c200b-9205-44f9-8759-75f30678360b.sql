ALTER TABLE public.cupons_blend DROP CONSTRAINT IF EXISTS cupons_blend_canal_check;
ALTER TABLE public.cupons_blend ADD CONSTRAINT cupons_blend_canal_check
  CHECK (canal IN ('distribuidor','atacado','cliente_final'));

INSERT INTO public.cupons_blend (user_id, codigo, canal, percentual, ativo)
SELECT DISTINCT user_id, 'BLEND03', 'distribuidor', 3.00, true
FROM public.cupons_blend
ON CONFLICT DO NOTHING;