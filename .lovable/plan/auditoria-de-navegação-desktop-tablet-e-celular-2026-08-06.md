# Auditoria de navegação: desktop, tablet e celular

Rodei a navegação real nas 8 rotas (Resumo, Produtos, Blends, Pedidos, Relatórios, Configurações, Simulação, Estudo de Markup) em três viewports: 1440px (computador), 820px (tablet) e 390px (celular).

## O que está funcional

- Todas as rotas carregam autenticadas nos três tamanhos, sem tela branca e sem erro de runtime (só avisos benignos de `ref` do React).
- Zero rolagem horizontal indevida na página (overflow-X = 0 em todas as rotas e viewports).
- No celular o menu vira gaveta: o botão abre a navegação, o item clicado navega e a gaveta fecha corretamente.
- Cards de KPI, formulários e sliders reempilham bem em 1, 2 ou 4 colunas conforme a largura.

## Problemas encontrados (confirmados nas capturas)

1. Nomes dos sabores cortados nos cards de Blends
   - Desktop/tablet/celular: "4× Tempero ...", "4× Chimi Chu...", e no tablet a coluna some quase por completo. Fica impossível saber qual sabor compõe o kit.
2. Rótulos de cupom cortados nos cards de Blends
   - "c/ BLEND03:", "c/ BLEND05:" aparecem truncados em tablet.
3. Tabela de Produtos em tablet/celular
   - Só as primeiras colunas ficam visíveis; o restante exige rolagem horizontal dentro da tabela, sem nenhuma indicação visual de que há mais conteúdo à direita.
4. Filtro de canal em Relatórios sem Distribuidor
   - `src/pages/Relatorios.tsx` só tem `todos | atacado | cliente_final`; pedidos de distribuidor não podem ser filtrados e no CSV são exportados como "Cliente Final".
5. Alvos de toque pequenos no celular
   - Botão de abrir menu com 28×28 px e vários botões de ícone com 20–32 px, abaixo do mínimo confortável de 44 px.

## Correções propostas

1. Blends: mostrar o nome completo do sabor
   - Em telas estreitas, empilhar cada sabor em duas linhas (nome em cima, os três preços embaixo) em vez de forçar 4 colunas; em telas largas, deixar a coluna de nome flexível com quebra de linha em vez de truncar.
2. Blends: garantir espaço para os rótulos de cupom (quebra de linha em vez de corte).
3. Produtos: manter a rolagem horizontal, mas indicar que existe — sombra/fade na borda direita e dica "arraste para ver mais colunas" em tablet e celular.
4. Relatórios: incluir "Distribuidor" no filtro de canal e corrigir o rótulo de canal no CSV para os três canais.
5. Celular: aumentar para no mínimo 44×44 px os alvos de toque principais (abrir menu e botões de ação por item) e garantir `aria-label` nos botões só com ícone.

## Arquivos afetados

- `src/pages/Blends.tsx` — layout responsivo dos sabores e rótulos de cupom.
- `src/pages/Produtos.tsx` (ou `src/components/TemperosTable.tsx`) — indicador de rolagem horizontal.
- `src/pages/Relatorios.tsx` — canal Distribuidor no filtro e no CSV.
- `src/components/AppLayout.tsx` / `AppSidebar.tsx` — tamanho do gatilho do menu no celular.

Nenhuma regra de cálculo, preço ou dado é alterada — as mudanças são de apresentação, mais o filtro de canal em Relatórios.
