# Plano: Módulo de Blends (Kits de 12 potes)

## Visão geral
Adicionar 6 SKUs de **Blends** — kits com 12 potes divididos em 3 sabores (4 de cada). O preço de cada blend é calculado automaticamente como a **soma dos 12 potes individuais**, usando o preço vigente do canal (atacado ou cliente final) já calculado em `src/lib/calc.ts`. Dois cupons fixos:
- `BLEND05` → 5% desconto (canal atacado)
- `BLEND10` → 10% desconto (canal cliente final)

O canal já é definido no pedido (`canal: "atacado" | "cliente_final"`), então o sistema **valida automaticamente** se o cupom aplicado corresponde ao canal do cliente.

## Os 6 Blends (composição confirmada)

| SKU | Blend | Sabores (4 potes cada) |
|---|---|---|
| BLEND-BRA | Brasil | Cúrcuma, Tempero Mineiro, Tuchef com Páprica |
| BLEND-CHU | Churrasco | Páprica Picante, Chimi com Pimenta, Salsa/Cebola |
| BLEND-ESS | Essenza | Chimi Churri, Ervas Finas, Edu Guedes |
| BLEND-GOU | Gourmet | Ervas Finas, Lemon Pepper, Páprica Doce |
| BLEND-SUP | Supremo | Páprica Defumada, Cebola em Pó, Ana Maria |
| BLEND-TFX | Temperaflix | Temperaflix Tradicional, Temperaflix Ervas Finas, Temperaflix Sabor Bacon |

> **Confirmar antes de implementar:** o item "Chimi Churri" do Essenza é o "Chimi Churri" (sem pimenta) já cadastrado, correto? E o "Tempero do Edu" = "Edu Guedes" do catálogo?

## Arquitetura (respeitando a estrutura atual)

Os blends **não são novos produtos no `temperos`** — são uma camada de composição por cima. Isso preserva:
- Ficha técnica e precificação individual continuam intocadas
- Estoque continua sendo por pote (vender 1 blend = baixa 4 unidades de cada um dos 3 temperos)
- Cálculo do preço reaproveita `calcularTempero()` sem duplicação

### Modelo de dados

```text
blends                    blend_itens
─────────                 ───────────
id (uuid)                 blend_id → blends.id
sku (BLEND-XXX)           tempero_id → temperos.id
nome                      quantidade (int, ex: 4)
descricao
foto_path
ativo (bool)
ordem (int)
```

Grants + RLS por `user_id` como nas outras tabelas. Blends são **globais do usuário** (mesmo padrão de `temperos`).

### Cupons
Tabela leve `cupons_blend` com `codigo`, `canal`, `percentual`. Já semeado com BLEND05/BLEND10, mas editável em Configurações no futuro.

## UI

1. **Nova página `/blends`** no sidebar (ícone Package2):
   - Grid de cards com foto, nome, composição e **preço atacado / preço cliente** calculados em tempo real
   - Botão "Editar composição" (drawer) para ajustar itens/quantidades
   - Alerta se algum tempero componente tem estoque < 4

2. **Integração no `/pedidos`:**
   - Ao adicionar item, aba "Produtos" | "**Blends**"
   - Selecionar blend → gera 3 linhas de itens (4 potes cada) com preço do canal
   - Campo "Cupom" no rodapé do pedido: valida canal, aplica % sobre subtotal dos blends
   - Se cliente é atacado e digitar BLEND10 → rejeita com mensagem clara

3. **Nota não-fiscal:** o blend aparece como cabeçalho agrupador ("Blend Brasil - R$ XX,XX") com os 3 sabores listados abaixo, mantendo o layout atual.

## Regras de negócio

- **Preço do blend = Σ (preço_canal_do_pote × quantidade)** — recalculado a cada render (sempre atual)
- **Desconto do cupom** incide só sobre o subtotal dos blends do pedido (não sobre itens avulsos), somado a qualquer desconto manual
- **Baixa de estoque** continua no trigger `tg_baixar_estoque` — como cada blend gera itens_pedido individuais, funciona sem alteração
- Se um tempero componente for excluído, o blend fica marcado como "inativo" (não quebra pedidos antigos)

## Etapas de implementação

1. Migration: tabelas `blends`, `blend_itens`, `cupons_blend` + grants + RLS + seed dos 6 blends e 2 cupons
2. Upload das 6 imagens ao bucket `produtos` (você me envia ou uso placeholders?)
3. `src/lib/blends.ts` — fetch/CRUD + `calcularPrecoBlend(blend, temperos, variaveis, canal)`
4. Página `src/pages/Blends.tsx` + rota + item no sidebar
5. Extensão de `src/pages/Pedidos.tsx` — aba Blends + campo cupom
6. Ajuste em `src/components/NotaPreviewDialog.tsx` para agrupar itens de blend
7. Teste manual: criar pedido atacado com BLEND05, verificar baixa de estoque e preço

## Perguntas antes de começar

1. Confirmo os mapeamentos "Tempero do Edu → Edu Guedes" e "Chimi Churri (sem pimenta) → Chimi Churri" do catálogo?
2. As 6 imagens dos blends — você anexa nesta conversa para eu subir ao bucket, ou começo com placeholder e você substitui depois?
3. Os cupons devem ser **editáveis** em Configurações desde já, ou fixos por enquanto (hardcoded seed)?