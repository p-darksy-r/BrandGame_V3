# Melhorias prioritárias

## Implementadas na versão 3.1.0

- Distribuição Windows em `app`, recursos em `app/web` e atualizador na raiz.
- Publicação temporária, bloqueio contra atualizações concorrentes, backups e recuperação de interrupções.
- Separação de interface, regras, dados, persistência e integração Windows.
- Um único catálogo e um único gerador de níveis; remoção da sobreposição que escondia a base de marcas maior.
- Proteções contra submissões repetidas e conteúdo HTML em nomes de salas.
- Gravações mais robustas e regras coerentes entre plataformas.
- Documentação de desenvolvimento e testes automatizados.

## Implementadas na versão 3.2.0

- CSS, fontes e logótipos locais; partida completa em `file://` com a rede desligada.
- Catálogo auditado: 496 entradas ativas, identificadores corrigidos e 1438 entradas preservadas fora das rondas para revisão.
- Remoção dos controlos de FPS/VSync sem efeito; movimento reduzido com preferência do sistema.
- Carregamento de logótipos antes do cronómetro, erros recuperáveis, pausa e tempo monotónico.
- Testes de partida completa, derrota, persistência, cancelamento e falhas de imagem.

## Implementadas na versão 3.3.0

- Atualizador online com verificação de manifesto assinado, canais, reparação e recuperação; sem SDK no PC do jogador.
- Estrelas realmente conquistadas e recordes de pontuação/tempo por nível e dificuldade, com migração dos saves antigos.

## Próximas prioridades

1. **Evolução do atualizador.** Atualização automática do próprio lançador, interface gráfica de progresso, rotação planeada de chaves e política de retenção de backups.
2. **Distribuição pública.** Preparar certificado publicamente confiável ou distribuição pela Microsoft Store. A identidade atual continua a ser de desenvolvimento.
3. **Mais marcas verificadas e dificuldade por marca.** Ampliar sobretudo moda e alimentação com recursos adequados e rever repetições entre níveis próximos. O catálogo original permanece disponível para esta revisão.
4. **Acessibilidade e localização.** Português de Portugal, textos maiores, foco de teclado completo e testes de escalas 125%/150% do Windows. A janela continua WinForms/WebView2.
5. **Gestão de progresso.** Exportar/importar saves, permitir corrigir salas antigas e indicar falhas de gravação no navegador.
6. **Evolução dos módulos.** Dependências explícitas, mantendo o arranque offline e o modo de abertura direta no navegador.
