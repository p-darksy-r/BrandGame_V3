# Histórico de versões

## 3.1.1 — 2026-11-01

- Assinatura Authenticode SHA-256 nos dois executáveis com identidade própria do BrandGame e timestamp RFC 3161.
- Chave privada não exportável no Windows; preparação explícita de confiança apenas no perfil do programador.
- Compilação e empacotamento exigem assinaturas válidas; CI sem chave fica explicitamente identificado como não assinado.
- Verificação de assinatura, certificado esperado e integridade; teste de rejeição de um executável adulterado.
- Testes de arranque reais do atualizador e do jogo com perfil isolado passaram neste PC, incluindo WebView2 e comunicação nativa de saves.
- Pacote web para jogar no navegador; documentação das limitações da assinatura de desenvolvimento e da futura assinatura pública.

Esta é uma release de desenvolvimento assinada. Não garante aceitação automática por Windows noutros computadores.

## 3.1.0 — 2026-11-01

- Reorganização em fontes, distribuição, scripts, documentação e testes.
- Aplicação Windows publicada em `app/BrandGame.exe`, com recursos em `app/web`.
- `update.exe` local com atualização pontual, modo de observação e lançamento opcional.
- Compilação antes da substituição, backups, bloqueio de concorrência e recuperação de interrupções.
- Frontend dividido por responsabilidade e catálogo separado por categoria.
- Correções no gerador de níveis, submissões repetidas, custo de pistas e nomes de salas.
- Contraste dos logótipos sobre o fundo escuro e registo de conclusão do nível 100.
- Serviços nativos separados, persistência mais segura e validação da origem das mensagens.
- README atualizado para o repositório `p-darksy-r/BrandGame_V3`.

Limitações conhecidas: recursos visuais externos; algumas marcas sem logótipos; binários sem assinatura digital que podem ser bloqueados por políticas do Windows; atualização baseada no código local.
