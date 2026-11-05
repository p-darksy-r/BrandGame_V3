# Jogar BrandGame 3.3.0

## Windows

Extrai `BrandGame-3.3.0-win-x64.zip` e abre `app/BrandGame.exe`. Mantém `app/web` junto do executável. O runtime .NET está incluído; é necessário o Microsoft Edge WebView2 Runtime. O jogo inclui interface, fontes e logótipos locais e funciona sem Internet depois de instalado o WebView2.

Os executáveis usam uma assinatura de desenvolvimento autoassinada. A assinatura identifica esta build, mas não garante aceitação pelo Windows noutros computadores. Se SmartScreen, Smart App Control ou uma política empresarial bloquearem a execução, mantém a proteção e usa o pacote web. Não é pedido aos jogadores que instalem certificados.

## Navegador

Extrai `BrandGame-3.3.0-web.zip` e abre `web/index.html` no navegador. Não é necessário executar um EXE, instalar certificados ou ter o SDK .NET. Este modo usa o armazenamento local do navegador e tem progresso separado da aplicação Windows. Os recursos estão incluídos; podes jogar sem Internet. Mantém a pasta no mesmo local para continuar a usar o mesmo armazenamento do navegador.

## Atualizador

O pacote Windows inclui `update.exe` junto de `app`. Fecha o jogo e abre o atualizador para procurar e instalar a última release autenticada. Não exige SDK, Node ou SignTool. O canal predefinido inclui versões de desenvolvimento; para aceitar apenas estáveis, usa `update.exe --channel stable`. `--check` apenas consulta; `--launch` abre o jogo após a verificação/atualização.

As releases anteriores à 3.3.0 não têm manifesto de atualização e são ignoradas. A assinatura do pacote confirma a origem e integridade; não muda a confiança do Windows na assinatura de desenvolvimento. O próprio lançador deve ser substituído manualmente, com ele fechado, quando uma release pedir uma versão nova. Os modos `--local`/`--watch` destinam-se ao desenvolvimento.

## Partidas e catálogo

O cronómetro começa quando o logótipo termina de carregar. Usa **Pause** ou **Esc** para pausar e **Resume** para continuar. Ao mudar de separador, a partida pausa automaticamente. Se faltar uma imagem, não perdes tempo nem vidas: podes tentar novamente ou sair do nível.

Em **Settings**, a opção de movimento reduzido desativa animações e tremores. A preferência de movimento reduzido do sistema também é respeitada. As antigas opções de FPS e VSync foram removidas porque não controlavam a apresentação do WebView2.

São 496 entradas distribuídas por cinco categorias e 100 níveis em cada categoria; os níveis reutilizam marcas. Salas antigas com identificadores indisponíveis mantêm os dados e mostram um aviso antes de começar. O criador de salas apresenta os identificadores locais disponíveis.

## Estrelas e recordes

Cada nível guarda estrelas, melhor pontuação e menor tempo de jogo por dificuldade. O total usa as melhores estrelas de cada nível/sala, sem duplicar por repetição. Criar uma sala não atribui estrelas. Os pontos acumulados anteriores mantêm-se.

Uma conclusão com pelo menos 75% de acertos dá uma estrela; 90% dá duas e 100% dá três. Os recordes de tempo só contam conclusões aprovadas e excluem carregamento, pausa e espera no painel de resposta. Saves antigos mantêm os níveis concluídos, mas os resultados por nível eram desconhecidos: volta a jogá-los para registar estrelas e recordes.
