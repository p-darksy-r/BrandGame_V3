# Validação

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
