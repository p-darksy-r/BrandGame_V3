# Jogar BrandGame 3.1.1

## Windows

Extrai `BrandGame-3.1.1-win-x64.zip` e abre `app/BrandGame.exe`. Mantém `app/web` junto do executável. O runtime .NET está incluído; é necessário o Microsoft Edge WebView2 Runtime. A interface e os logótipos ainda usam serviços na Internet.

Os executáveis usam uma assinatura de desenvolvimento autoassinada. A assinatura identifica esta build, mas não garante aceitação pelo Windows noutros computadores. Se SmartScreen, Smart App Control ou uma política empresarial bloquearem a execução, mantém a proteção e usa o pacote web. Não é pedido aos jogadores que instalem certificados.

## Navegador

Extrai `BrandGame-3.1.1-web.zip` e abre `web/index.html` no navegador. Não é necessário executar um EXE, instalar certificados ou ter o SDK .NET. Este modo usa o armazenamento local do navegador e tem progresso separado da aplicação Windows. Os recursos externos continuam a exigir Internet.

## Atualizador

O `update.exe` é uma ferramenta para quem tem o código-fonte completo e o ambiente de desenvolvimento configurado. Não é um instalador para jogadores nem um descarregador de releases. Quem só quer jogar deve descarregar o pacote Windows ou web da versão pretendida.
