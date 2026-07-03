# Custos fixos individualizados por produto

## Objetivo
Hoje todos os produtos usam os mesmos 5 custos fixos globais (Pote+Tampa, Lacre, Rótulo, Caixa, Termoencolhível). Produtos como Canela Moída (sem lacre e sem rótulo, pote diferente) e o futuro Pote de Milho para Pipoca (só pote + matéria-prima) precisam de estrutura própria.

Vamos permitir que **cada produto** defina se usa o valor global ou um valor próprio para cada um dos 5 custos fixos, podendo inclusive **desligar** um item (valor = 0).

Encargos %, Custo Fabril, Comissão, Transporte, Contabilidade e Markups permanecem globais — não muda nada neles.

## Como o usuário vai enxergar
No drawer de detalhes do produto, uma nova seção **"Custo Fixo por Produto"** com uma linha por item:

```text
                  [ usar global ]   valor
Pote + Tampa       [x]              R$ 0,95   (do global)
Lacre              [ ]              R$ 0,00   (desativado neste produto)
Rótulo             [ ]              R$ 0,00
Caixa (rateio)     [x]              R$ 0,12
Termoencolhível    [x]              R$ 0,10
```

- Checkbox marcado → usa o valor global (padrão para todos os produtos existentes, nada muda).
- Checkbox desmarcado → habilita o input do valor próprio (pode ser 0 para "não tem").
- Um botão "Restaurar padrão global" volta tudo para marcado.

## Impacto na precificação
`calcularTempero` passa a montar os 5 custos fixos assim: para cada item, se o produto tiver override, usa o override; senão, usa o global. O resto da fórmula (matéria-prima, contabilidade, encargos, markups) fica idêntico.

## Compatibilidade
- Coluna nova é opcional; produtos existentes ficam sem override e continuam usando os globais → **zero mudança de preço** ao aplicar.
- Painel global de Variáveis continua funcionando como hoje (afeta todos que não têm override).
- Notas, pedidos, relatórios: nenhum é afetado, pois só consomem o preço final calculado.

## Detalhes técnicos

**Banco (`temperos`)** — 1 coluna nova:
- `custos_fixos_override jsonb null` no formato `{ "pote": 1.20, "lacre": 0, "rotulo": 0 }`. Chaves ausentes = usar global.

**Types/API** (`src/data/temperos.ts`, `src/lib/api.ts`):
- Adicionar `custosFixosOverride?: Partial<Record<'pote'|'lacre'|'rotulo'|'caixa'|'termoencolhivel', number>>` no tipo `Tempero`.
- Mapear no `toTempero` / `upsertTempero`.

**Cálculo** (`src/lib/calc.ts`):
- Substituir a soma fixa por: `['pote','lacre','rotulo','caixa','termoencolhivel'].reduce((s,k) => s + (t.custosFixosOverride?.[k] ?? v[k]), 0)`.

**UI** (`src/components/ProdutoDetalhesDrawer.tsx`):
- Nova seção "Custo Fixo por Produto" com 5 linhas (checkbox "usar global" + Input numérico habilitado quando desmarcado) + botão restaurar. Salva via `onUpdate` no mesmo fluxo já existente (debounced auto-save).

**Fora do escopo**: nenhuma alteração em Pedidos, Notas, Dashboard, Relatórios, Configurações ou variáveis globais.

## Riscos
Muito baixos. Mudança aditiva, retrocompatível (campo opcional, fallback para global), isolada em 4 arquivos + 1 migração.

Posso implementar?
