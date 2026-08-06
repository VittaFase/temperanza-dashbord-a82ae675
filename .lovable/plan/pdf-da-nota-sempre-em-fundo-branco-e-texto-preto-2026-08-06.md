# PDF da nota sempre em fundo branco e texto preto

## Problema (confirmado)

O app é dark-first: em `src/index.css` o tema base define fundo escuro (`--background: 30 15% 10%`) e texto claro (`--foreground: 45 30% 94%`).

Na pré-visualização a nota aparece correta porque é renderizada dentro de um `iframe` isolado (`srcDoc`), que não herda o CSS do app.

No "Baixar PDF" (`src/components/NotaPreviewDialog.tsx`), o `body` do iframe é **clonado e renderizado dentro do documento do app**. O clone perde o isolamento do iframe e passa a herdar as cores do tema escuro — daí o PDF sair com fundo preto e letras brancas.

## Solução

1. Gerar o PDF a partir do próprio documento do iframe, e não de um clone inserido no app:
   - esconder os elementos `.no-print` dentro do iframe durante a geração e restaurá-los no final;
   - passar `iframeDoc.body` diretamente para o `html2pdf`, mantendo o contexto de estilos isolado.
2. Reforçar o "à prova de tema" no HTML da nota (`src/lib/nota.ts`), tanto A4 quanto cupom 80mm:
   - `color-scheme: light` e `background:#fff; color:#000` explícitos em `html` e `body`;
   - cores explícitas nas tabelas/linhas (nada dependendo de herança);
   - regras `@media print` garantindo fundo branco e `print-color-adjust: exact`.
3. Manter `backgroundColor: "#ffffff"` no html2canvas e aplicar o mesmo tratamento aos dois formatos (nota A4 e cupom), tanto no botão Imprimir quanto no Baixar PDF e nas janelas abertas por `abrirNota` / `abrirCupom80mm`.

## Verificação

Abrir um pedido, gerar PDF nos dois formatos e conferir visualmente as páginas renderizadas: fundo branco, texto preto, logo legível.

## Arquivos

- `src/components/NotaPreviewDialog.tsx` — geração do PDF a partir do documento do iframe.
- `src/lib/nota.ts` — CSS explícito light nos dois templates.
