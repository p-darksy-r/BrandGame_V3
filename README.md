# BrandGame V3

Jogo de adivinhar marcas, com 100 níveis por categoria, salas personalizadas e uma aplicação Windows em C# / WinForms / WebView2. **Versão atual: 3.3.0 — assinatura de desenvolvimento.**

Código-fonte privado: [p-darksy-r/BrandGame_V3](https://github.com/p-darksy-r/BrandGame_V3). Downloads públicos: [BrandGame_Releases](https://github.com/p-darksy-r/BrandGame_Releases).

## Abrir a aplicação

Depois da compilação, abre **`app/BrandGame.exe`**. Os ficheiros HTML, CSS e JavaScript publicados estão em **`app/web/`**. A distribuição inclui o runtime .NET; o computador precisa do [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/).

`BrandGame.exe` e `update.exe` têm assinatura Authenticode SHA-256 e timestamp RFC 3161. A identidade é **BrandGame Development, O=p-darksy-r**, criada para testes e confiada apenas no perfil Windows do autor. Os dois executáveis passaram testes de arranque reais neste PC. **Isto não garante aceitação noutros PCs**: SmartScreen, Smart App Control e políticas empresariais podem bloquear certificados de desenvolvimento. Não desatives as proteções nem instales certificados de desenvolvimento para contornar um bloqueio.

Obtém a [versão 3.3.0](https://github.com/p-darksy-r/BrandGame_Releases/releases/tag/v3.3.0), ou usa o pacote web no navegador quando o Windows não permitir o executável. Consulta [como jogar](docs/PLAYTEST.md) e [assinatura Windows](docs/CODE_SIGNING.md).

## Novidades da versão 3.3.0

- Atualização online pelo GitHub, com manifesto RSA/SHA-256 e chave pública fixada no lançador, sem SDK para jogar ou atualizar.
- Estrelas conquistadas e recordes de pontuação/tempo por nível e dificuldade. As repetições não duplicam estrelas; os pontos acumulados continuam separados dos recordes.
- Migração preserva pontos, níveis e salas antigas. Os resultados históricos desconhecidos não são inventados: aparece uma indicação para voltar a jogar esses níveis.
- O jogo mantém todos os recursos offline. A atualização online usa Internet apenas quando executas o atualizador.

## Atualizar a app instalada

Extrai o pacote Windows com `update.exe` ao lado da pasta `app`. Fecha o jogo e executa:

```powershell
.\update.exe --check
.\update.exe --no-pause
.\update.exe --launch --no-pause
```

O canal predefinido `preview` inclui releases estáveis e de desenvolvimento autenticadas. Usa `--channel stable` para aceitar apenas estáveis; as releases antigas sem manifesto assinado são ignoradas. Não há regressão automática para versões anteriores. `--repair` permite reinstalar a mesma versão e `--recover` recupera uma troca interrompida sem rede.

O atualizador verifica a assinatura do manifesto e o hash do ZIP, prepara uma pasta temporária e guarda a app anterior em `.brandgame-updates/backup-*`. Os saves em AppData são preservados. O `update.exe` que está em execução não se substitui: quando precisares de uma versão nova do próprio lançador, extrai-a da release com o lançador fechado. Consulta [atualizações](docs/UPDATES.md) e [progresso](docs/PROGRESS.md).

## Compilar e atualizar

Para desenvolver: Windows x64, PowerShell 5.1 ou superior, **.NET SDK 8 ou superior** e o SignTool do Windows SDK. Node.js 22 ou superior e `npm ci` são necessários para preparar o catálogo, CSS e testes web. O restauro de dependências e o timestamp das assinaturas requerem Internet.

Na raiz do projeto:

```powershell
# Dependências e recursos web locais
npm ci --ignore-scripts
npm run build:web

# Preparação única no PC do programador: cria a identidade local e confia
# apenas no certificado público deste projeto no perfil Windows atual.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-signing.ps1

# Primeira compilação: cria update.exe e publica a aplicação completa
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1

# Publicar as alterações locais mais recentes
.\update.exe --local --no-pause

# Acompanhar alterações ao código e voltar a publicar automaticamente
.\update.exe --watch

# Atualizar e abrir a aplicação
.\update.exe --local --launch --no-pause
```

No modo local, o atualizador recompila quando os conteúdos das fontes mudam. Prepara a nova versão numa pasta temporária, valida os recursos web e só depois substitui `app`. Se a aplicação estiver aberta, pede para a fechar; em `--watch`, tenta novamente automaticamente. Não termina processos nem apaga o progresso. A versão anterior fica em `artifacts/backups/`, e uma troca interrompida é recuperada na execução seguinte.

**No modo `--local`, “última versão” significa o código local atual.** Este modo não faz `git pull` nem descarrega releases. O modo `--watch` deve permanecer aberto para acompanhar alterações. Para atualizar o código remoto, sincroniza primeiro o repositório, preservando as tuas alterações locais.

O script de publicação também pode ser usado diretamente no desenvolvimento:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/update.ps1
```

Apenas o modo `--local` precisa das pastas `scripts` e `src` e das ferramentas de desenvolvimento. O modo online funciona com o lançador independente. Para recompilar o próprio atualizador, executa `scripts/build.ps1`.

As compilações locais exigem assinatura e verificam o certificado esperado antes de substituir os executáveis. Se a assinatura ou o timestamp falharem, a nova publicação é rejeitada. O GitHub Actions usa explicitamente `-SigningMode None` e gera artefactos identificados como `Unsigned-CI`; não recebe a chave privada nem publica esses ficheiros como releases assinadas.

## Organização

```text
BrandGame_V3/
├── app/                      # Gerada: aplicação pronta a usar
│   ├── BrandGame.exe
│   ├── build-info.json       # Versão, hash das fontes e data de compilação
│   └── web/                  # HTML, CSS, JavaScript e dados publicados
├── src/
│   ├── csharp/               # Janela Windows, ponte web e serviços
│   ├── cpp/                  # Motor C++ opcional
│   ├── web/                  # Fontes web editáveis, organizadas por responsabilidade
│   └── updater/              # Código do update.exe
├── scripts/                  # Compilação, publicação, testes e empacotamento
├── tests/                    # Testes web, nativos e do atualizador
├── docs/                     # Arquitetura, desenvolvimento e melhorias
├── artifacts/                # Temporários, backups e pacotes; não versionados
├── VERSION                   # Versão da distribuição
└── update.exe                # Atualização online; --local para desenvolver
```

Edita **`src/web`**, e publica com o atualizador. `app/web` é uma cópia de distribuição e será substituída na atualização seguinte. `app`, `artifacts` e os executáveis ficam fora do Git; os pacotes Windows podem ser publicados nas [releases](https://github.com/p-darksy-r/BrandGame_Releases/releases).

## Testes

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test.ps1
npx playwright install chromium
npm run test:e2e
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-signatures.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/smoke-windows.ps1
```

Os testes verificam seleção determinística de marcas, regras de pontuação, persistência, comunicação com o anfitrião e atualização com recuperação. O teste Windows joga um nível completo, avalia respostas pela ponte nativa e verifica o save no disco, usando um perfil temporário sem abrir os saves do jogador. Os testes no navegador cobrem jogo offline, imagens em falta, cancelamento durante o carregamento, derrota e definições persistentes. A assinatura e os testes de arranque são verificações separadas. O workflow de GitHub Actions executa os testes de lógica e gera uma build Windows de CI sem assinatura.

## Dados e funcionamento web

- Progresso nativo: `%APPDATA%/BrandGame_V3/save_data_v3_custom.json`.
- Perfil WebView2: `%LOCALAPPDATA%/BrandGame_V3/WebView2`.
- Modo web: abre `src/web/index.html` no navegador; o progresso usa armazenamento local do navegador.
- Servidor local opcional: `node scripts/serve-web.mjs`, disponível em `http://127.0.0.1:8765`.
- **O jogo funciona offline**, com CSS compilado, fontes e logótipos incluídos. A instalação inicial de dependências de desenvolvimento e o timestamp das assinaturas continuam a precisar de Internet.
- O catálogo ativo tem **496 entradas**: tecnologia 317, automóveis 57, alimentação 20, moda 13 e media 89. As 1438 entradas sem correspondência verificada ficam preservadas nas fontes e fora das rondas; consulta a [auditoria](docs/CATALOG_AUDIT.md). Existem 100 níveis por categoria, com reutilização de marcas.
- As salas antigas são preservadas. Se usarem um logótipo que não está no catálogo offline, o jogo avisa antes de começar; o criador sugere identificadores disponíveis.
- O motor C++ é opcional. Sem `BrandEngine.dll`, a aplicação usa as mesmas regras em C#.

Consulta a [arquitetura](docs/ARCHITECTURE.md), o [guia de desenvolvimento](docs/DEVELOPMENT.md), as [melhorias propostas](docs/ROADMAP.md) e o [histórico de versões](docs/CHANGELOG.md).
