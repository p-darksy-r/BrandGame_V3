# Arquitetura

## Código e distribuição

`src` é a fonte de verdade. `app` contém uma publicação substituível, criada com `dotnet publish` para Windows x64. Os executáveis incluem o runtime .NET; o WebView2 Runtime continua a ser uma dependência do sistema. Os recursos web são ficheiros externos para permitir inspeção e distribuição simples.

`VERSION` alimenta a versão dos projetos .NET através de `Directory.Build.props`. O frontend mantém a identificação do esquema do jogo em `src/web/js/core/state.js`; atualiza-a quando publicares uma versão. `app/build-info.json` regista também o hash dos conteúdos usados, o commit de referência e a data UTC. O hash inclui alterações ainda não commitadas; o commit por si só não identifica o código local.

## Frontend

Os scripts clássicos são carregados explicitamente por `index.html`, incluindo no modo `file://`, sem bundler:

- `js/data`: catálogo por categoria e normalização dos dados.
- `js/core`: estado, regras de comparação e seleção determinística de níveis.
- `js/platform`: comunicação com o anfitrião e persistência no navegador.
- `js/gameplay`: rondas, pistas, feedback e resultados.
- `js/ui`: navegação, eventos, catálogo, criação de salas e definições.
- `js/audio.js`: sintetizador de efeitos sonoros.
- `js/app.js`: inicialização.
- `styles`: estilos globais e componentes.

Os módulos partilham um contexto de scripts clássico e a ordem de carregamento faz parte do contrato. Uma futura migração para módulos ES deve incluir a alteração do servidor/modo web e os respetivos testes. Não reintroduzir um segundo catálogo nem uma segunda função de geração de níveis.

## Anfitrião Windows

`MainWindow` gere a janela e o WebView2; os serviços separam caminhos, persistência, motor de comparação e mensagens. Só a origem local virtual da aplicação pode enviar comandos ao anfitrião. Dados de gravação são tratados como JSON, não como código JavaScript.

Os saves mantêm o caminho antigo em AppData. O perfil WebView2 fica em LocalAppData e é independente de `app`, para sobreviver às atualizações. As regras de comparação e pontuação devem permanecer equivalentes em JavaScript, C# e C++.

## Atualização local

`update.exe` é um lançador .NET que chama `scripts/update.ps1` com argumentos estruturados. O script adquire um bloqueio exclusivo, recupera uma publicação interrompida, calcula o hash das fontes e publica para `artifacts/staging`.

Uma compilação bem-sucedida só é instalada se as fontes não tiverem mudado entretanto, o conjunto de ficheiros estiver completo e a assinatura esperada com timestamp for válida. O processo de assinatura usa uma identidade previamente preparada; não cria confiança durante o build. A troca guarda a instalação anterior em `artifacts/backups`. Um registo em `artifacts/pending-update.json` permite recuperar uma interrupção entre as duas operações de mover pastas. As operações recusam caminhos fora do projeto e ligações de diretório nos destinos.

O modo `--watch` verifica as fontes de três em três segundos. Enquanto a aplicação estiver aberta, mantém a versão em execução e espera que seja fechada. A atualização não descarrega código, não força o encerramento da aplicação, nem altera ficheiros de progresso.

Os backups ficam guardados para recuperação manual e podem ocupar bastante espaço. Elimina apenas os que já não precisas, com a aplicação e o atualizador fechados.
