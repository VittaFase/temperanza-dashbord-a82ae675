# Comando por voz no Dashboard

Adicionar ditado e comandos por voz em todo o app, no modo "gravar e soltar": você segura (ou clica em) o microfone, fala, solta — o áudio é transcrito e aplicado.

## 1. Botão de microfone reutilizável

Um componente único `VoiceButton` (ícone de microfone) com três estados: parado, gravando (pulsando) e transcrevendo. Grava áudio em WAV pelo navegador, envia para o backend e devolve o texto.

- Pede permissão de microfone na primeira vez, com mensagem clara em português.
- Se a gravação sair vazia ou o microfone estiver bloqueado, mostra aviso e não chama a transcrição.

## 2. Ditado nos campos de texto

O mesmo botão aparece dentro dos campos onde digitar é mais lento:

- Histórico de Pedidos: busca de cliente (o texto falado entra direto no filtro).
- Observações do pedido.
- Buscas de produto em Produtos e Blends.

## 3. Barra de comando por voz global

Um botão de microfone fixo no cabeçalho, disponível em todas as telas. Ao soltar, o texto falado é interpretado e executado:

- Navegação: "abrir produtos", "ir para blends", "ver relatórios", "estudo de markup", "configurações", "resumo".
- Busca: "procurar cliente Maria", "buscar tempero alho" — navega para a tela certa já com o filtro preenchido.
- Pedido: "novo pedido", "canal distribuidor", "adicionar 3 potes de chimichurri" (usa o catálogo atual para casar o nome falado com o SKU).
- Se o comando não for reconhecido, aparece o texto transcrito com a opção de usá-lo como busca — nada é executado por adivinhação.

Ações destrutivas (cancelar pedido, excluir produto) **não** são executadas por voz.

Um painel pequeno mostra o que foi entendido e o que foi feito, para você confirmar visualmente.

## 4. Segurança

A transcrição roda numa função de backend com a chave de IA guardada no servidor — o navegador nunca vê credenciais. A função exige usuário autenticado e limita o tamanho do áudio.

## Detalhes técnicos

- Nova edge function `transcribe-audio`: recebe `multipart/form-data`, valida sessão e tamanho, encaminha para o gateway Lovable AI (`/v1/audio/transcriptions`, modelo `openai/gpt-4o-mini-transcribe`, sem streaming) e devolve `{ text }`. Erros 4xx/5xx são repassados com a mensagem real.
- `src/hooks/useVoiceInput.ts`: captura PCM via Web Audio, codifica WAV mono 16 kHz, guarda de tamanho mínimo, chama a function e devolve `{ recording, transcribing, start, stop, error }`.
- `src/components/VoiceButton.tsx`: UI push-to-talk (pointer down/up + tecla espaço quando focado), acessível, usando tokens do design system.
- `src/lib/voiceCommands.ts`: parser determinístico em português (normaliza acentos, casa por palavras-chave e por nome de produto vindo do `useDashboard`), retornando `{ tipo: "navegar" | "buscar" | "pedido" | "desconhecido", ... }`. Sem chamada extra de IA.
- `src/components/VoiceCommandBar.tsx` montado no header do `AppLayout`; usa `useNavigate` e query params (`?q=`) para preencher buscas nas páginas de destino.
- `Pedidos.tsx`, `Produtos.tsx`, `Blends.tsx`: adicionam `VoiceButton` nos inputs existentes e leem `?q=` na montagem. Nenhuma mudança em cálculo de preço, estoque ou fluxo de pedido.
