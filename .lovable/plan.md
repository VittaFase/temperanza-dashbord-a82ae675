# Plano: Conectar projeto ao GitHub

## Objetivo
Vincular o projeto atual (Temperanza Gastronomia) a um repositório GitHub para backup, versionamento e edição externa do código.

## Passos

1. **Verificar conectores disponíveis**
   - Listar os App connectors do workspace para confirmar que o GitHub está disponível.

2. **Iniciar conexão GitHub**
   - Abrir o fluxo de conexão do connector GitHub no chat.
   - O usuário autorizará o acesso do app Lovable à conta GitHub desejada.

3. **Selecionar conta/organização e nome do repositório**
   - Escolher a conta ou organização GitHub.
   - Definir o nome do repositório (sugestão: `temperanza-dashboard`).

4. **Criar repositório e ativar sync**
   - Criar o repositório no GitHub a partir do código atual.
   - Confirmar que o sync bidirecional está ativo (alterações na Lovable refletem no GitHub e vice-versa).

5. **Validação**
   - Verificar o remote `origin` apontando para github.com.
   - Confirmar que o primeiro push/commit inicial foi realizado com sucesso.

## Resultado esperado
O projeto passa a ter um repositório GitHub vinculado, acessível para clone, pull requests e colaboração externa, mantendo o sync automático com a Lovable.