# Desenvolvimento e versões

## Trabalhar no projeto

1. Prepara a assinatura uma vez com `scripts/setup-signing.ps1`, ou configura uma identidade pública; altera as fontes em `src`.
2. Instala as dependências com `npm ci --ignore-scripts`; executa `npm run build:web` depois de editar o frontend ou o catálogo. Usa `scripts/test.ps1` e `npm run test:e2e` para verificar o comportamento (prepara o Chromium uma vez com `npx playwright install chromium`).
3. Executa `scripts/build.ps1` para criar o atualizador e a distribuição, ou `update.exe --watch` durante o desenvolvimento. O modo pontual de compilação é agora `update.exe --local`; sem essa opção, o lançador procura releases online.
4. Abre `app/BrandGame.exe` e verifica os fluxos alterados.

O VS Code tem tarefas separadas para compilar em Debug, publicar e testar. O motor C++ não é obrigatório para o arranque. Se o compilares com o toolchain C++ do Visual Studio, coloca a DLL x64 atual em `src/csharp/BrandEngine.dll` antes de publicar. Uma DLL antiga pode ter regras incompatíveis; não a reutilizes depois de alterar o motor.

## Dividir código à medida que cresce

- Um ficheiro deve ter uma responsabilidade clara. Se começar a reunir persistência, apresentação e regras, separa-o antes de acrescentar funcionalidades.
- Usa cerca de 300 linhas como sinal para rever ficheiros de lógica, não como limite arbitrário. Catálogos de dados podem ser maiores.
- Extrai funções com nomes claros e dependências explícitas. Evita copiar regras entre funcionalidades.
- Para scripts clássicos, atualiza a ordem em `index.html` e verifica que todos os recursos existem na distribuição.
- Acrescenta testes para regras ou falhas reais; não é necessário testar alterações puramente cosméticas.

## Concluir uma versão

O proprietário pediu que as versões concluídas sejam enviadas para **https://github.com/p-darksy-r/BrandGame_V3**.

1. Atualiza `VERSION`, `package.json`, o badge estático de `index.html` e `docs/CHANGELOG.md`. Executa `npm run build:web`: `js/core/version.js` é gerado a partir de `VERSION`.
2. Atualiza `README.md`; este mesmo ficheiro é o README mostrado pelo GitHub.
3. Executa testes, publicação, `scripts/verify-signatures.ps1` e `scripts/smoke-windows.ps1`. Regista limitações de validação, como um bloqueio de execução pelo Windows.
4. Revê `git diff` e preserva alterações locais existentes.
5. Faz commit e push para o repositório indicado, sem force-push. Se a branch estiver protegida, usa uma branch `codex/` e um pull request.
6. Executa `scripts/package.ps1` depois da assinatura e anexa os ZIPs Windows/web, checksums, atualizador e relatório de assinaturas e `release-manifest.json`/`release-manifest.sig` à release. Identifica releases com certificado autoassinado como versões de desenvolvimento. Não adiciona binários pesados nem chaves privadas ao histórico Git.

## Recuperação

Em caso de falha de compilação, a instalação existente permanece. Se uma troca foi interrompida, executa novamente o atualizador para recuperar. Para regressar manualmente a uma versão anterior, fecha a app e copia uma pasta de `artifacts/backups` para `app`, preservando antes qualquer conteúdo de que precises.

`docs/legacy/make_game.py.txt` conserva o antigo gerador de projeto como referência histórica. Era um ficheiro incompleto que continha cópias antigas das fontes; não faz parte da compilação e não deve ser usado para regenerar o projeto.

## Recursos offline e catálogo

`scripts/build-web.cjs` gera CSS Tailwind 3, fontes, SVGs, manifesto de hashes e o catálogo ativo, usando versões exatas de dependências no `package-lock.json`. Estes recursos gerados são versionados para permitir abrir o jogo sem Node.js. `npm run check:web` falha se estiverem desatualizados. As quebras de linha são fixadas em LF para manter os hashes iguais no Windows e no CI.

Os ficheiros por categoria em `src/web/js/data` preservam o catálogo original. `scripts/lib/catalog.cjs` resolve nomes, aplica aliases explícitos e exclui identidades sem correspondência ou ambíguas. Para incluir uma marca nova, confirma a origem do ícone e a pista, adiciona-a à categoria e regenera. A auditoria completa fica em `docs/CATALOG_AUDIT.md`. O jogo carrega apenas `offline-catalog.js` e não solicita recursos externos.

O atualizador prepara os recursos antes de publicar uma mudança; se essa preparação falhar, conserva a app instalada. A publicação verifica cada hash do manifesto offline. Os backups anteriores continuam a usar o formato da respetiva versão.

## Publicar atualizações online

`scripts/package.ps1` inclui o lançador no pacote Windows e, por defeito, assina o manifesto para o canal `preview`. Só usa `-Channel stable` se a release do GitHub também for estável. Anexa os dois ficheiros de manifesto sem os editar: a assinatura cobre os bytes exatos do JSON. O modo `-AllowUnsigned` do CI não cria manifestos assinados e não fornece atualizações elegíveis.

As primeiras verificações devem usar uma pasta isolada com uma cópia do lançador e `--install-package ZIP --manifest JSON --signature SIG`; depois de publicar, testa a instalação pela API pública numa pasta vazia. Nunca usa os saves reais nesses testes. Para atualizar o próprio lançador, distribui o novo `update.exe` e substitui-o quando estiver fechado.

O workflow manual `Published Windows release` permite testar a distribuição publicada noutro Windows. Indica a tag e os hashes SHA-256 dos dois executáveis assinados localmente. O runner verifica o lançador descarregado, instala pela API pública sem token e joga um nível com perfil isolado. Os registos ficam num artefacto do workflow; documenta separadamente eventuais bloqueios por políticas do Windows local.

O código, o README e as Releases ficam no mesmo repositório público `p-darksy-r/BrandGame_V3`. Os pacotes e manifestos são anexados às Releases, sem adicionar binários ao histórico Git. Não é necessário um branch de downloads.

Cada versão concluída recebe uma nova tag `vX.Y.Z` no commit correspondente do `main`, preservando as tags anteriores. Depois dos testes e do CI, cria a tag, envia-a e publica a Release com essa tag. A visibilidade pública permite ao atualizador descarregar os pacotes sem conta ou token GitHub.
