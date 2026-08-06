# Substituir "Desc." por "Valor especial" em cada item do pedido

## Feedback: é viável e sem quebra

O campo "Desc." de cada item hoje só subtrai um valor do subtotal daquele item. Ele nunca pode aumentar o preço — por isso não serve para o caso do pote de ervas finas passar de R$ 4,12 para R$ 4,63.

O mecanismo que faz exatamente isso já existe no sistema: é o preço negociado da "Tabela especial" (grava `preco_base` = preço do canal e `preco_unitario` = preço decidido, marcando o item como especial). A mudança é apenas trazer esse campo para o lugar do "Desc.", sempre visível, em vez de escondido atrás do botão ON/OFF.

Nada da estrutura de banco muda: `preco_base`, `tabela_especial` e o desconto no total continuam funcionando igual. Notas, e-mail, WhatsApp, baixa de estoque e duplicação de pedido seguem lendo os mesmos campos.

Ponto de atenção único: descontos por item deixam de existir. Um valor menor que o de tabela passa a ser digitado direto como preço final (ex.: em vez de "desconto de R$ 0,50", digita-se R$ 3,62). O desconto geral do pedido e o cupom continuam disponíveis normalmente.

## O que muda na tela de Pedidos

- No lugar de cada campo "Desc." aparece **"Valor especial"**: um campo de preço unitário, sempre visível, já preenchido com o preço do canal.
- Ao digitar um valor diferente, o item mostra:
  - o preço de tabela riscado ao lado do novo valor;
  - o desvio percentual, verde quando acima da tabela e vermelho quando abaixo;
  - um botão de retorno (↺) para voltar ao preço do canal.
- O subtotal do item passa a ser simplesmente quantidade × valor especial.
- O botão "Tabela especial · ON/OFF" no cabeçalho deixa de controlar a exibição do campo e passa a indicar o estado do pedido (liga sozinho quando algum item tem valor diferente da tabela).
- Trocar o canal (Distribuidor / Atacado / Cliente final) continua recarregando os preços de tabela; itens com valor especial digitado são mantidos e sinalizados.

## Detalhes técnicos

- Arquivo: `src/pages/Pedidos.tsx`.
- Remover o bloco do input `desconto` por item e o handler `mudarDescontoItem`; promover o bloco de preço (hoje condicionado a `tabelaEspecial`) para renderização permanente com o rótulo "Valor especial".
- `recalcSubtotal` passa a ignorar `i.desconto` (fixado em 0) e usar `preco_unitario * quantidade`.
- `tabelaEspecial` deixa de ser gate de UI; vira derivado de `carrinho.some(i => i.tabela_especial)` para o rótulo no cabeçalho e para o flag salvo no pedido.
- Sem migration: `itens_pedido.desconto` continua existindo com valor 0 e os pedidos antigos seguem exibindo seus descontos no histórico.
