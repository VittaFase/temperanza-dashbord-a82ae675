# Nota: baixar + abrir, imprimir em qualquer impressora, WhatsApp com o arquivo

Três ajustes no diálogo da nota (Pedidos → Nota / Cupom).

## 1. Baixar PDF deve abrir na tela

Hoje o PDF é salvo direto pela pasta de downloads do navegador e some da vista.

Mudança: gerar o PDF em memória (blob), abrir em uma nova aba (visualizador do navegador) **e** disparar o download com o nome `Nota-000123.pdf`. Assim você vê a nota na hora e ela também fica salva para reenviar depois.

No celular, se o navegador bloquear a nova aba, aparece um aviso com um botão "Abrir nota" para abrir manualmente.

## 2. Imprimir com escolha de impressora (Bluetooth / Wi-Fi / AirPrint)

O botão continuará chamando a caixa de impressão do sistema, que é onde ficam todas as impressoras conectadas ao aparelho — inclusive térmicas por Bluetooth pareadas e impressoras de rede.

Melhorias:
- No celular/tablet, em vez de imprimir o iframe escondido (que às vezes não abre a caixa nativa), a nota é aberta em uma janela própria e a impressão é chamada de lá — é o caminho que expõe corretamente as impressoras do Android/iOS.
- Para o cupom, manter `@page size: 80mm` para sair no tamanho certo em impressora térmica.
- Texto de ajuda no diálogo: "Escolha a impressora na janela do sistema (Bluetooth, Wi-Fi ou AirPrint)".

Observação: navegador não pareia impressora Bluetooth sozinho — o pareamento é feito uma vez nas configurações do aparelho; depois ela aparece na lista de impressoras.

## 3. WhatsApp enviando a nota como arquivo, não como texto

Hoje o link `wa.me` só carrega texto digitado.

Mudança: o botão WhatsApp passa a gerar o PDF da nota e compartilhá-lo como arquivo:
- Celular/tablet: usa o compartilhamento nativo do sistema com o arquivo anexado — você escolhe WhatsApp e o contato, e o cliente recebe a nota como documento para abrir e imprimir.
- Computador (sem suporte a compartilhar arquivo): o PDF é baixado/aberto automaticamente e, em seguida, abre o WhatsApp Web com a mensagem curta — basta arrastar o arquivo para a conversa. Um aviso explica esse passo.

A mensagem de texto detalhada atual vira um resumo curto (nº da nota, cliente, total), já que a nota completa vai anexada.

## Detalhes técnicos

- `src/components/NotaPreviewDialog.tsx`: extrair um helper `gerarPdfBlob()` usando `html2pdf().outputPdf("blob")` com as mesmas opções e `onclone` já existentes; usar o blob em Baixar PDF (URL.createObjectURL + window.open + link de download), no WhatsApp (`navigator.canShare({files})` → `navigator.share`) e no fallback desktop.
- `src/lib/nota.ts`: acrescentar `montarResumoWhatsApp(p)` (mensagem curta) mantendo `montarMensagemWhatsApp` para o fallback de texto; ajustar `abrirNota`/`abrirCupom80mm` para chamar `print()` após `load` quando usados no fluxo de impressão mobile.
- `src/pages/Pedidos.tsx`: a ação de WhatsApp do histórico passa a usar o mesmo fluxo com anexo.
- Sem mudanças de banco de dados nem de cálculo de preços.

## Verificação

Gerar a nota A4 e o cupom: conferir que o PDF abre na tela e é baixado, que Imprimir abre a caixa de impressão do sistema, e que o WhatsApp recebe o PDF como anexo (mobile) ou o arquivo é aberto com o WhatsApp Web (desktop).
