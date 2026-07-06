
# Plano — Temperanzza Dashboard como cérebro de precificação

Entregável desta rodada: **apenas plano**. Nada será codado até você aprovar bloco por bloco.

---

## Bloco 1 — Alinhamento de catálogo com o site

**Migration única** `add_shopify_mapping_to_temperos`:

1. `ALTER TABLE public.temperos ADD COLUMN shopify_variant_id text;`
2. `ALTER TABLE public.temperos ADD COLUMN shopify_product_id text;`
3. `ALTER TABLE public.temperos ADD COLUMN handle_site text;`
4. `CREATE UNIQUE INDEX temperos_handle_site_user_uidx ON public.temperos(user_id, handle_site) WHERE handle_site IS NOT NULL;` (unique por usuário, não global — respeita multi-tenant futuro)
5. `UPDATE public.temperos SET handle_site = CASE nome ... END;` cobrindo os 19 SKUs da sua tabela.
6. `shopify_variant_id` / `shopify_product_id` ficam **NULL** — serão preenchidos no Bloco 3 por uma tela "Vincular Shopify" que lista variantes da Admin API e permite associar.

Itens a confirmar antes da migration:
- `Ana Maria → tempero-da-ana-maria` (marcado como "confirmar" no seu prompt) — preciso validar via Storefront antes.
- `Pimenta Moída` e `Canela Moída` no site são "Premium Black 30g" (gramagem diferente do dashboard: 50g e 30g). Mapeamento funciona, mas o **preço enviado assume a gramagem do dashboard**. Sinalizar na UI que essas 2 têm gramagem divergente.

Nenhuma mudança em `calc.ts`, `useDashboard`, ou nas RLS existentes.

---

## Bloco 2 — Auditoria de segurança (relatório, sem correção)

Vou rodar `supabase--linter` + `security--run_security_scan` + inspeção manual das policies e devolver **um relatório com severidade por item**. Estrutura do relatório:

| # | Item | Severidade | Status esperado |
|---|---|---|---|
| 1 | RLS ativa em `temperos`, `variaveis`, `pedidos`, `itens_pedido`, `blends`, `blend_itens`, `cupons_blend`, `clientes`, `notas_nao_fiscais`, `pedido_sequencia` | Crítico | Verificar policy `USING (auth.uid() = user_id)` em cada operação |
| 2 | GRANTs explícitos por tabela para `authenticated` (e `service_role` onde edge functions leem) | Crítico | Sem GRANT a Data API devolve permission error |
| 3 | Tabela `user_roles` + enum `app_role` + função `has_role` SECURITY DEFINER | Alto | Ainda não existe — proposta de migration separada no Bloco 2b se aprovado |
| 4 | Bucket `produtos`: policies de leitura, signed URLs com TTL | Alto | Confirmar que não é público e frontend usa `createSignedUrl` |
| 5 | HIBP (leaked password) no Auth | Médio | Ligar via `configure_auth` se estiver off |
| 6 | Tokens de terceiros (Shopify Admin, Bling) fora do frontend | Crítico | Hoje só `SHOPIFY_ACCESS_TOKEN` existe (managed) — validar que nenhum código cliente lê |
| 7 | Aviso na UI de Configurações se `simples% + comissao% + transporte% ≥ 100%` | Baixo | Hoje `Math.max(0.01, ...)` protege cálculo, falta UX |
| 8 | Search path fixo em todas as funções SECURITY DEFINER | Médio | Verificar `tg_baixar_estoque`, `tg_atribuir_numero_pedido` (já têm `SET search_path`) |

Saída: markdown com cada item marcado ✅ conforme / ⚠️ ajuste sugerido / ❌ risco ativo. **Sem correção automática.**

---

## Bloco 3 — Sync de preço Dashboard → Shopify

### Arquitetura

```text
[Botão "Sincronizar preço"]  (ProdutoDetalhesDrawer)
        │
        ▼
supabase.functions.invoke("sync-shopify-price", { temperoId })
        │
        ▼
┌──────────────────────────────────────────────┐
│ edge function sync-shopify-price/index.ts    │
│ 1. valida JWT do caller                      │
│ 2. lê tempero + variaveis do user            │
│ 3. calcularTempero() → precoCliente          │
│ 4. sanity check (0 < preco < 999)            │
│ 5. PATCH Admin API 2025-07                   │
│    /variants/{id}.json { price }             │
│ 6. INSERT em sync_log                        │
│ 7. retorna { ok, preco, shopify_response }   │
└──────────────────────────────────────────────┘
        │
        ▼
[toast sucesso/erro + refresh do log na UI]
```

### Arquivo `supabase/functions/sync-shopify-price/index.ts`

- Runtime: Deno, `verify_jwt` default (já valida token).
- Input schema (Zod): `{ temperoId: string(uuid) }`.
- Secret usado: `SHOPIFY_ACCESS_TOKEN` (já existe no projeto). **Nunca** exposto ao cliente.
- Domínio da loja: buscado via `shopify--get_shop_permanent_domain` uma vez e fixado como constante `SHOPIFY_STORE_DOMAIN` no código da função (não é secret).
- Endpoint chamado: `PUT https://{domain}/admin/api/2025-07/variants/{numeric_id}.json` com body `{ "variant": { "id": <id>, "price": "12.34" } }`. O `shopify_variant_id` armazenado no formato `gid://shopify/ProductVariant/123` — a função extrai o numeric id.
- Sanity checks (falham com 400 antes de chamar Shopify):
  - `precoCliente > 0` e `< 999`
  - `variação vs. último preço enviado` maior que 50% → exige flag `force: true` no payload
  - `shopify_variant_id IS NOT NULL`
- Resposta: `{ ok, preco_enviado, shopify_status, sync_log_id }`.

### Nova tabela `sync_log`

```sql
CREATE TABLE public.sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tempero_id uuid NOT NULL REFERENCES public.temperos(id) ON DELETE CASCADE,
  canal text NOT NULL DEFAULT 'shopify',
  preco_enviado numeric(10,2) NOT NULL,
  status text NOT NULL,           -- 'ok' | 'error' | 'skipped'
  http_status int,
  erro text,
  payload_resposta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.sync_log TO authenticated;
GRANT ALL ON public.sync_log TO service_role;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_le_seu_log" ON public.sync_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "edge_insere_log" ON public.sync_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

### UI (mudança mínima)

- Botão "Sincronizar preço no site" em `ProdutoDetalhesDrawer`, visível só quando `shopify_variant_id IS NOT NULL`.
- Sub-aba "Histórico de sync" no drawer lendo `sync_log` por `tempero_id`.
- Tela nova `/configuracoes` → seção "Vinculação Shopify": lista SKUs, mostra `handle_site` + `shopify_variant_id`, com dropdown alimentado por `shopify--list_products` para associar.

### Fases
1. **Fase 1 (MVP):** manual, 1 SKU por vez, via botão.
2. **Fase 2 (só após 3 dias em produção sem erro):** debounce automático quando `precoKg`, `gramasPote`, `markup*` ou variáveis globais mudam.
3. **Fase 3:** batch "Sincronizar todos os preços" com progresso.

Escopo do MVP envia **apenas `precoCliente`**. `precoAtacado` permanece no dashboard.

---

## Bloco 4 — Guardrails (o que NÃO fazer)

Anotado e vinculado ao plano:
- Zero alteração em `src/lib/calc.ts`, `src/lib/blends.ts`, `useDashboard`.
- Zero alteração no projeto do site (`bcad438d-...`). Site continua lendo via Storefront API.
- Nenhum endpoint público sem verificação (a edge function exige JWT).
- Sem seed automático em novos logins.
- `service_role` só dentro de edge functions; nunca no bundle client.
- HMAC será obrigatório quando/ se adicionarmos webhook de entrada (não é o caso agora — só saída).

---

## Bloco 5 — Backlog (pós-Bloco 3 estável)

- Integração Bling API v3: OAuth device flow, sync de estoque, importação de pedidos, emissão de NF-e.
- Webhook Bling → dashboard para estoque em tempo real (com HMAC).
- Painel consolidado: pedidos Shopify + Bling + status fiscal + margem realizada.
- Alertas de estoque mínimo via `send-transactional-email` (já existente).
- Sync inverso Shopify → Dashboard (webhook `orders/paid` decrementa `temperos.estoque_atual`) se quisermos unificar estoque.

---

## Ordem de aprovação sugerida

1. Aprovar Bloco 1 → rodo a migration de mapeamento.
2. Aprovar Bloco 2 → devolvo relatório de segurança (sem mexer em nada).
3. Decidir correções do Bloco 2 (uma migration por item aprovado).
4. Aprovar Bloco 3 → crio `sync_log`, edge function e UI mínima.
5. Validar 1 SKU real por 3 dias → libera Fase 2.

Me diz qual bloco você quer que eu execute primeiro.
