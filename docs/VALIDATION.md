# Validação

## Versão 3.3.0

- 94 verificações passaram: 14 testes web, 22 verificações nativas, 36 verificações do atualizador online, 19 do atualizador local e 3 de assinatura.
- Sete testes Playwright passaram, incluindo uma partida offline com estrelas persistidas, resultados nos níveis e migração de um save 3.2.0 sem inventar resultados históricos.
- O novo atualizador foi testado contra manifesto alterado, chave errada, metadata inválida, redirecionamentos externos, limites de download, ZIP inseguro, downgrade, reparação e falha/interrupção durante a substituição.
- O jogo Windows assinado completou um nível, validou as respostas pela ponte nativa e gravou três estrelas no disco, num perfil isolado.
- Instalação real pelo novo `update.exe`, numa pasta sem fontes e com PATH limitado ao Windows: manifesto alterado rejeitado, pacote assinado instalado e partida completa executada na app resultante. Evidência em `artifacts/install-test-*/results.json`; teste reproduzível em `tests/online.Install.ps1`.
- O repositório de código foi confirmado como privado; os downloads são separados para o repositório público `BrandGame_Releases`, por escolha do proprietário.
- A variante `tests/online.Install.ps1 -Online` permite confirmar o download público depois da publicação; esse resultado é registado nas notas da release.
- As assinaturas Authenticode continuam a usar SHA-256 com timestamp; o manifesto do pacote usa RSA/SHA-256 com chave pública fixada.

Os testes nativos foram feitos neste PC. A assinatura permanece de desenvolvimento e o atualizador não modifica a confiança ou as proteções do Windows. O próprio lançador continua a ser substituído manualmente, com ele fechado.

## Versão 3.2.0

- 10 testes web, 22 verificações C#, 19 testes do atualizador e 3 testes de assinatura passaram.
- Os 510 ficheiros gerados foram verificados contra as dependências fixadas: catálogo, SVGs, fontes, CSS, licenças e manifesto.
- Seis testes Playwright: partida completa em `file://` com a rede desligada, todos os logótipos carregados, fontes locais e progresso preservado ao reabrir; recuperação de uma imagem em falta, saída durante carregamento, derrota, definições persistentes e compatibilidade das salas personalizadas.
- Verificações do relógio monotónico, tempo de pausa, migração das definições antigas e rejeição de recursos offline alterados ou fora da pasta web.
- `update.exe --help` e `update.exe --no-pause` passaram. `BrandGame.exe --smoke-test` completou um nível no WebView2, confirmou respostas pela ponte nativa e verificou o progresso gravado no disco, num perfil isolado.
- Menu e definições revistos em capturas de ecrã. As assinaturas finais mantêm Authenticode SHA-256 e timestamp RFC 3161.

O teste nativo correu neste PC; não foi feita uma campanha completa em todos os níveis, nem validação noutras máquinas ou escalas de DPI. A assinatura continua a ser de desenvolvimento. O jogo é offline; a compilação inicial, o timestamp e a publicação de releases requerem rede.

## Versão 3.1.1

- 8 testes web, 22 verificações C#, 18 testes do atualizador e 3 testes de validação de assinatura passaram.
- Integração de assinatura: certificado esperado e timestamp verificados; assinatura de cópia adulterada corretamente rejeitada.
- `update.exe --help` e `update.exe --no-pause` executados diretamente com sucesso.
- `app/BrandGame.exe --smoke-test` executado diretamente com perfil isolado: arranque WinForms/WebView2, carregamento da interface, geração de nível e resposta nativa de carregamento do save confirmados.
- Os testes de arranque não substituem uma partida completa ou testes noutras máquinas.
- Assinaturas Authenticode SHA-256 válidas, com timestamp RFC 3161. Relatório em `artifacts/signing/signatures.json`; resultados dos processos em `artifacts/smoke-*/results.json`.

O arranque passou neste PC após a preparação da assinatura própria solicitada. Não foram desativadas proteções do Windows, nem criadas exceções no antivírus. A identidade autoassinada continua sem confiança pública; outros computadores podem avisar ou bloquear. As chaves não são enviadas para o GitHub, cujo CI executa os testes e publica artefactos de validação sem assinatura.

## Histórico: versão 3.1.0

- Testes web com Node.js: dados das cinco categorias, geração dos 500 níveis, regras partilhadas de pontuação, saves antigos, submissões repetidas, pistas, conclusão do nível 100 e ordem dos scripts.
- Verificações C#: comparação e pontuação, origem da ponte web, gravação atómica, backup de saves, recuperação de JSON danificado e escritas concorrentes.
- Testes PowerShell: caminhos, junctions, recursos em falta, manifesto, substituição completa, backups, falha real de renomeação e recuperação de interrupções.
- Compilação Release e publicação Windows x64 com runtime .NET incluído.
- Verificação no navegador: arranque, menu, categorias e abertura do primeiro nível. Não foi executada uma campanha completa de jogo.

O Windows bloqueou a execução local do `update.exe` gerado através de uma política de Controlo de Aplicações. Os scripts de compilação/publicação foram executados e testados diretamente. A execução completa do lançador e da interface nativa não está validada neste ambiente. O motor C++ opcional não foi compilado aqui; a distribuição usa o motor C#.

Os binários não têm assinatura digital. Recursos externos e logótipos continuam sujeitos à disponibilidade de rede. Consulte `ROADMAP.md` para as próximas melhorias.
