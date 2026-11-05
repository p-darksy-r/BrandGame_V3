# Histórico de versões

## 3.3.0 — 2026-11-05

- Atualizador online independente, com canais preview/stable, consulta, reparação da mesma versão e recuperação sem rede.
- Manifestos RSA/SHA-256 e chave pública fixada; verificação do ZIP, limites de download/extração e rejeição de caminhos inseguros.
- Substituição de app com backup, bloqueio partilhado e recuperação; compilação local mantida com --local/--watch.
- Lançador incluído no pacote Windows; substituição do próprio update.exe feita com ele fechado.
- Estrelas e recordes por nível e dificuldade, sem duplicação de estrelas em repetições ou criação de salas.
- Saves anteriores preservam pontos, níveis e salas; resultados históricos desconhecidos identificados na interface.
- Testes de assinatura do pacote, downgrade, falhas de rede, ZIP inseguro, rollback e migração do progresso.

## 3.2.0 — 2026-11-02

- Jogo offline com CSS compilado, fontes e logótipos locais; licenças e origens incluídas.
- Catálogo ativo de 496 entradas, correções de identificadores e pistas, exclusão de logótipos errados e preservação das fontes originais.
- Manifesto SHA-256 dos recursos, validado antes de substituir a app, e geração reproduzível verificada no CI.
- Cronómetro monotónico iniciado após a imagem, pausa explícita/automática e falhas de carregamento sem perda de vidas.
- Movimento reduzido; removidos os controlos de FPS/VSync sem efeito e corrigidos os nomes das definições.
- Criação de salas limitada aos logótipos locais disponíveis; salas antigas preservadas.
- Testes completos no navegador offline, falhas de imagem, derrota, persistência e migração de definições.
- Smoke test Windows ampliado para uma partida completa e confirmação do save no disco.
- Versão frontend gerada a partir de VERSION e documentação atualizada.

Mantém assinatura autoassinada de desenvolvimento; a atualização online fica para a próxima etapa.

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
