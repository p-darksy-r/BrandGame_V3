# Melhorias prioritárias

## Implementadas na versão 3.1.0

- Distribuição Windows em `app`, recursos em `app/web` e atualizador na raiz.
- Publicação temporária, bloqueio contra atualizações concorrentes, backups e recuperação de interrupções.
- Separação de interface, regras, dados, persistência e integração Windows.
- Um único catálogo e um único gerador de níveis; remoção da sobreposição que escondia a base de marcas maior.
- Proteções contra submissões repetidas e conteúdo HTML em nomes de salas.
- Gravações mais robustas e regras coerentes entre plataformas.
- Documentação de desenvolvimento e testes automatizados.

## Próximas prioridades

1. **Recursos locais e catálogo verificado.** Compilar o CSS Tailwind e incluir fontes e logótipos permitidos na distribuição. Auditar slugs inexistentes, marcas repetidas e pistas que revelam respostas. O catálogo preservado contém entradas que ainda precisam desta revisão.
2. **Distribuição assinada e atualização online.** Assinar os executáveis, definir um canal de releases e validar a origem/integridade de pacotes antes de instalar. O atualizador atual compila o código local; não é ainda um cliente de releases do GitHub.
3. **Definições com efeito verificável.** Rever FPS e VSync: o código anterior apresentava controlos sem limitar a renderização do WebView2. Priorizar opções cujo efeito possa ser medido e explicado ao jogador.
4. **Acessibilidade e ecrãs pequenos.** Melhorar navegação por teclado, foco, contraste, opções para movimento reduzido e adaptação a diferentes escalas do Windows.
5. **Cobertura de fluxos completos.** Automatizar sessões reais no WebView2, migrações de saves, erros de rede e retomada de partidas. Os testes atuais não substituem uma validação visual completa.

O trabalho deve continuar por funcionalidades pequenas e verificáveis. Uma reescrita completa não é necessária para estas melhorias.
