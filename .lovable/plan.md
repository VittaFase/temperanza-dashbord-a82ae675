## Análise da estratégia

A ideia é excelente e reforça algo que já vinha aparecendo nas conversas anteriores: **markup e margem são a mesma realidade financeira dita em duas linguagens**, e o comercial precisa das duas visíveis ao mesmo tempo para não errar negociação.

- **Markup (Nx / %)** → linguagem de precificação. "Multiplico o custo por 1,91 para chegar ao preço."
- **Margem %** → linguagem de rentabilidade. "47,67% do preço fica como lucro bruto."

Nas marcações vermelhas da imagem (91%, 130%, 230% na Simulação), o que aparece hoje é o **markup em percentual sobre o custo** (ex.: markup 1,91x = +91% sobre o custo). Adicionar o **multiplicador Nx ao lado** deixa a leitura instantânea e alinha o vocabulário com o brief.

Confirmei os números do exemplo com a fórmula atual em `src/lib/calc.ts`:

```
custo R$ 2,58 → Distribuidor 1,91x → R$ 4,93 → margem 47,67%
                Atacado      2,30x → R$ 5,94 → margem 56,57%
                Cliente      3,30x → R$ 8,52 → margem 69,72%
```

Bate exatamente. Nenhuma mudança de cálculo é necessária — só apresentação.

## Escopo da entrega

Duas frentes, ambas puramente de UI, sem migração, sem RLS, sem alteração de fórmula.

### Frente 1 — Multiplicador Nx ao lado dos percentuais (marcações vermelhas)

**Onde:** `src/pages/Simulacao.tsx`

1. **Cabeçalho dos 3 sliders** (Distribuidor 91%, Atacado 130%, Cliente 230%):
   - Formato: `91% · 1,91x` (o `%` continua sendo o markup-sobre-custo já usado hoje; o `Nx` é o mesmo valor expresso como multiplicador).
2. **Chips `rec`, `min`, `max`** abaixo dos sliders:
   - Cada um ganha o Nx entre parênteses: `rec 90% (1,90x)`, `min 80% (1,80x)`, `max 110% (2,10x)`.
3. **Cards "Atual / Simulada"** (47,6%, 56,5%, 69,7%):
   - Esses são **margem %**, não markup. Ao lado de cada número, mostrar o markup correspondente em fonte menor e cor `accent`:
     ```
     ATUAL              SIMULADA
     47,6%  1,91x       47,6%  1,91x
     ```
   - Mantém a hierarquia visual atual (margem grande, markup como referência).

### Frente 2 — Nova página "Estudo de Markup por Canal"

**Rota:** `/estudo-markup`
**Arquivo:** `src/pages/EstudoMarkup.tsx`
**Sidebar:** novo item entre "Simulação" e "Configurações", ícone `Calculator` (lucide).

**Estrutura da página:**

1. **Header** no padrão das outras páginas (kicker "ANÁLISE" + título "Estudo de Markup por Canal" + subtítulo).
2. **Seletor de produto** (Select shadcn) — default: primeiro produto da lista, ou "Ervas Finas" se existir. Também mostra o **Custo total** do produto em destaque ao lado.
3. **3 cards de canal** (Distribuidor / Atacado / Cliente final) em grid responsivo:

   ```text
   ┌─────────────────────────────┐
   │ DISTRIBUIDOR                │
   │                             │
   │        1,91x                │  ← markup destacado (font-display, accent)
   │        47,67%               │  ← margem em destaque secundário
   │                             │
   │ Preço de venda  R$ 4,93     │
   │ Lucro/unidade   R$ 2,35     │
   │                             │
   │ "Este produto tem um markup │
   │  de 1,91x e margem          │
   │  percentual de 47,67%."     │
   └─────────────────────────────┘
   ```

4. **Tabela comparativa** (mesma estrutura do brief):

   | Canal | Preço de venda | Lucro | Margem % | Markup |
   |---|---|---|---|---|
   | Distribuidor | R$ 4,93 | R$ 2,35 | 47,67% | 1,91x |
   | Atacado | R$ 5,94 | R$ 3,36 | 56,57% | 2,30x |
   | Cliente final | R$ 8,52 | R$ 5,94 | 69,72% | 3,30x |

5. **Nota explicativa** (card com borda accent):
   > **Markup** é o multiplicador aplicado sobre o custo do produto para chegar ao preço de venda.
   >
   > **Margem percentual** representa a porcentagem do preço de venda que permanece como lucro bruto.

6. **Frase padrão dinâmica** por canal (gerada a partir do produto selecionado, não hard-coded — funciona para os 19 SKUs).

**Formatação:** `toLocaleString("pt-BR")` para reais, vírgula decimal, markup como `1,91x` (não `1.91x`).

## Segurança / robustez

- **Zero mudança em banco, RLS, cálculo ou API.** Só leitura do estado já existente (`useDashboard`).
- **Fonte única da verdade**: markup e margem derivados diretamente de `calcularTempero()`. Nenhum recálculo paralelo.
- Helper novo `formatMarkup(precoVenda, custo)` colocado em `src/lib/calc.ts` para garantir que Simulação, Produtos e a nova página usem exatamente a mesma conversão.
- Nada altera o comportamento dos sliders, das faixas min/rec/max, dos alertas de conflito comercial nem dos badges coloridos de margem já entregues na Fase 1.

## Detalhes técnicos

**Arquivos alterados:**
- `src/pages/Simulacao.tsx` — cabeçalho dos sliders, chips e cards Atual/Simulada com Nx.
- `src/lib/calc.ts` — adicionar helpers `markupMultiplier(preco, custo)` e `formatMarkupX(preco, custo)`.
- `src/components/AppSidebar.tsx` — novo item "Estudo de Markup".
- `src/App.tsx` — nova rota `/estudo-markup`.

**Arquivos criados:**
- `src/pages/EstudoMarkup.tsx` — página nova completa.

**Sem tocar:** `calc.ts` na parte de fórmula, migrations, `types.ts`, componentes de Produtos, Blends, Pedidos, Relatórios, Dashboard.

## Ordem de execução

1. Adicionar helpers de markup em `calc.ts`.
2. Atualizar `Simulacao.tsx` com `Nx` ao lado dos percentuais (as marcações vermelhas).
3. Criar página `EstudoMarkup.tsx` + rota + item de sidebar.
4. Fase 2 (mapeamento Shopify) segue depois, como já estava planejado.

## Fora de escopo desta entrega

- Badges da tabela de Produtos: **não alterados** nesta rodada (evita mudar duas telas ao mesmo tempo). Se quiser adicionar Nx lá depois, é um follow-up de 5 minutos usando o mesmo helper.
- Nenhuma mudança em Política Comercial (Configurações) — as faixas continuam em % de markup como já estão.
