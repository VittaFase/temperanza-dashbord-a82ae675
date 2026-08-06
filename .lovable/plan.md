# Nota/Cupom: texto preto sólido em PDF e impressão

## Diagnóstico

O PDF já sai com fundo branco, mas as letras ficam quase transparentes.

Causa provável: o `html2pdf` (html2canvas) **clona o conteúdo para dentro do documento do app** antes de rasterizar. O clone deixa de estar isolado no iframe e passa a receber o CSS global do tema escuro — inclusive a regra de texto em gradiente de `src/index.css` (`-webkit-text-fill-color: transparent`) e a cor clara de `text-foreground`. Com o fundo forçado para branco, o texto some.

O CSS atual em `src/lib/nota.ts` fixa cor só em alguns seletores (`body`, `td`, `th`, `.block`...). Elementos como `span`, `strong`, `div` soltos e o `h1` do cupom herdam — e é justamente o que desaparece.

## Correção

1. **Blindar os dois templates** (`src/lib/nota.ts`, nota A4 e cupom 80mm):
   - regra coringa `*, *::before, *::after { color: #1a1512 !important; -webkit-text-fill-color: #1a1512 !important; text-shadow: none !important; opacity: 1 !important; background-image: none !important; }` (no cupom, `#000`);
   - manter exceção só para `.muted` (cinza legível `#555`) e para o botão `.no-print`;
   - repetir as mesmas regras dentro de `@media print`, com `print-color-adjust: exact`.

2. **Injetar as mesmas regras no clone do html2pdf** (`src/components/NotaPreviewDialog.tsx`):
   - usar o hook `html2canvas.onclone` para adicionar um `<style>` no documento clonado forçando fundo branco e texto sólido, além de esconder `.no-print`;
   - assim o resultado independe de o clone herdar ou não o tema do app.

3. **Mesmo tratamento nos dois formatos** (A4 e cupom) e nos três caminhos: pré-visualização, Imprimir e Baixar PDF, incluindo as janelas abertas por `abrirNota` / `abrirCupom80mm`.

## Verificação

Gerar o PDF da nota A4 e do cupom, converter as páginas em imagem e conferir visualmente: fundo branco, todo o texto preto e legível (cabeçalho, itens, totais, rodapé), logo visível.

## Arquivos

- `src/lib/nota.ts` — CSS light blindado nos dois templates.
- `src/components/NotaPreviewDialog.tsx` — `onclone` do html2canvas com estilo forçado.
