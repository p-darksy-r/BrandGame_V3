# BrandGame V3

Jogo de adivinhar marcas, com 100 níveis por categoria, salas personalizadas e uma aplicação Windows em C# / WinForms / WebView2. **Versão atual: 3.1.0.**

Repositório oficial: [p-darksy-r/BrandGame_V3](https://github.com/p-darksy-r/BrandGame_V3).

## Abrir a aplicação

Depois da compilação, abre **`app/BrandGame.exe`**. Os ficheiros HTML, CSS e JavaScript publicados estão em **`app/web/`**. A distribuição inclui o runtime .NET; o computador precisa do [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/).

Os executáveis gerados não têm assinatura digital. Uma política de Controlo de Aplicações do Windows pode impedir o seu arranque. A assinatura de versões distribuídas é uma melhoria pendente; não é necessário nem recomendado alterar a segurança do sistema para compilar o projeto.

## Compilar e atualizar

Para desenvolver: Windows x64, PowerShell 5.1 ou superior e **.NET SDK 8 ou superior**. Node.js 22 ou superior é usado nos testes web. O primeiro restauro de dependências requer Internet.

Na raiz do projeto:

```powershell
# Primeira compilação: cria update.exe e publica a aplicação completa
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1

# Publicar as alterações locais mais recentes
.\update.exe --no-pause

# Acompanhar alterações ao código e voltar a publicar automaticamente
.\update.exe --watch

# Atualizar e abrir a aplicação
.\update.exe --launch --no-pause
```

O atualizador recompila quando os conteúdos das fontes mudam. Prepara a nova versão numa pasta temporária, valida os recursos web e só depois substitui `app`. Se a aplicação estiver aberta, pede para a fechar; em `--watch`, tenta novamente automaticamente. Não termina processos nem apaga o progresso. A versão anterior fica em `artifacts/backups/`, e uma troca interrompida é recuperada na execução seguinte.

**“Última versão” significa o código local atual.** O atualizador não faz `git pull`, não procura releases online e não corre em segundo plano depois de ser fechado. O modo `--watch` deve permanecer aberto para acompanhar alterações. Para atualizar o código remoto, sincroniza primeiro o repositório, preservando as tuas alterações locais.

O script de publicação também pode ser usado diretamente no desenvolvimento:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/update.ps1
```

O `update.exe` precisa das pastas `scripts` e `src` ao seu lado; não é um instalador independente. Para recompilar o próprio atualizador, executa `scripts/build.ps1`.

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
└── update.exe                # Gerado na raiz
```

Edita **`src/web`**, e publica com o atualizador. `app/web` é uma cópia de distribuição e será substituída na atualização seguinte. `app`, `artifacts` e os executáveis ficam fora do Git; os pacotes Windows podem ser publicados nas [releases](https://github.com/p-darksy-r/BrandGame_V3/releases).

## Testes

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test.ps1
```

Os testes verificam seleção determinística de marcas, regras de pontuação, persistência, comunicação com o anfitrião e atualização com recuperação. O workflow de GitHub Actions executa a validação e gera a distribuição Windows.

## Dados e funcionamento web

- Progresso nativo: `%APPDATA%/BrandGame_V3/save_data_v3_custom.json`.
- Perfil WebView2: `%LOCALAPPDATA%/BrandGame_V3/WebView2`.
- Modo web: abre `src/web/index.html` no navegador; o progresso usa armazenamento local do navegador.
- Servidor local opcional: `node scripts/serve-web.mjs`, disponível em `http://127.0.0.1:8765`.
- Tailwind, fontes e logótipos ainda dependem de serviços externos. A aplicação **ainda não funciona totalmente offline**, e algumas marcas não têm um logótipo disponível.
- O motor C++ é opcional. Sem `BrandEngine.dll`, a aplicação usa as mesmas regras em C#.

Consulta a [arquitetura](docs/ARCHITECTURE.md), o [guia de desenvolvimento](docs/DEVELOPMENT.md), as [melhorias propostas](docs/ROADMAP.md) e o [histórico de versões](docs/CHANGELOG.md).
