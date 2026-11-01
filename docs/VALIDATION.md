# Validação da versão 3.1.0

- Testes web com Node.js: dados das cinco categorias, geração dos 500 níveis, regras partilhadas de pontuação, saves antigos, submissões repetidas, pistas, conclusão do nível 100 e ordem dos scripts.
- Verificações C#: comparação e pontuação, origem da ponte web, gravação atómica, backup de saves, recuperação de JSON danificado e escritas concorrentes.
- Testes PowerShell: caminhos, junctions, recursos em falta, manifesto, substituição completa, backups, falha real de renomeação e recuperação de interrupções.
- Compilação Release e publicação Windows x64 com runtime .NET incluído.
- Verificação no navegador: arranque, menu, categorias e abertura do primeiro nível. Não foi executada uma campanha completa de jogo.

O Windows bloqueou a execução local do `update.exe` gerado através de uma política de Controlo de Aplicações. Os scripts de compilação/publicação foram executados e testados diretamente. A execução completa do lançador e da interface nativa não está validada neste ambiente. O motor C++ opcional não foi compilado aqui; a distribuição usa o motor C#.

Os binários não têm assinatura digital. Recursos externos e logótipos continuam sujeitos à disponibilidade de rede. Consulte `ROADMAP.md` para as próximas melhorias.
