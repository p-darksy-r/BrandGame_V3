# Jogar BrandGame 3.2.0

## Windows

Extrai `BrandGame-3.2.0-win-x64.zip` e abre `app/BrandGame.exe`. Mantém `app/web` junto do executável. O runtime .NET está incluído; é necessário o Microsoft Edge WebView2 Runtime. O jogo inclui interface, fontes e logótipos locais e funciona sem Internet depois de instalado o WebView2.

Os executáveis usam uma assinatura de desenvolvimento autoassinada. A assinatura identifica esta build, mas não garante aceitação pelo Windows noutros computadores. Se SmartScreen, Smart App Control ou uma política empresarial bloquearem a execução, mantém a proteção e usa o pacote web. Não é pedido aos jogadores que instalem certificados.

## Navegador

Extrai `BrandGame-3.2.0-web.zip` e abre `web/index.html` no navegador. Não é necessário executar um EXE, instalar certificados ou ter o SDK .NET. Este modo usa o armazenamento local do navegador e tem progresso separado da aplicação Windows. Os recursos estão incluídos; podes jogar sem Internet. Mantém a pasta no mesmo local para continuar a usar o mesmo armazenamento do navegador.

## Atualizador

O `update.exe` é uma ferramenta para quem tem o código-fonte completo e o ambiente de desenvolvimento configurado. Não é um instalador para jogadores nem um descarregador de releases. Quem só quer jogar deve descarregar o pacote Windows ou web da versão pretendida.

## Partidas e catálogo

O cronómetro começa quando o logótipo termina de carregar. Usa **Pause** ou **Esc** para pausar e **Resume** para continuar. Ao mudar de separador, a partida pausa automaticamente. Se faltar uma imagem, não perdes tempo nem vidas: podes tentar novamente ou sair do nível.

Em **Settings**, a opção de movimento reduzido desativa animações e tremores. A preferência de movimento reduzido do sistema também é respeitada. As antigas opções de FPS e VSync foram removidas porque não controlavam a apresentação do WebView2.

São 496 entradas distribuídas por cinco categorias e 100 níveis em cada categoria; os níveis reutilizam marcas. Salas antigas com identificadores indisponíveis mantêm os dados e mostram um aviso antes de começar. O criador de salas apresenta os identificadores locais disponíveis.
