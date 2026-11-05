# Atualizações Windows

Coloca `update.exe` ao lado da pasta `app`. O jogo é offline; o atualizador usa a rede quando é executado. A instalação online não requer código-fonte, SDK .NET, Node.js ou SignTool.

```powershell
.\update.exe --check                  # Consultar versão autenticada
.\update.exe --no-pause               # Instalar a versão mais recente elegível
.\update.exe --launch --no-pause      # Abrir o jogo depois
.\update.exe --channel stable        # Excluir releases de desenvolvimento
.\update.exe --repair --no-pause      # Reinstalar a mesma versão
.\update.exe --recover --no-pause     # Recuperar interrupção, sem rede
```

As releases são obtidas de **p-darksy-r/BrandGame_Releases**, um repositório público apenas de distribuição. O repositório de desenvolvimento BrandGame_V3 permanece privado. Não são usados tokens dos jogadores.

O canal predefinido `preview` inclui releases estáveis e de desenvolvimento. A seleção usa a maior versão numérica `X.Y.Z`, com tag `vX.Y.Z`, ZIP Windows e ambos os ficheiros de manifesto. Drafts e releases antigas sem manifesto são ignorados. Nunca se instala uma versão inferior à instalada, mesmo com `--repair`. Se não existir uma release elegível no canal, a app instalada permanece.

O download verifica `release-manifest.json` com `release-manifest.sig` usando a chave pública embebida no lançador. A assinatura cobre versão, canal, tamanho e SHA-256 do ZIP completo. Redirecionamentos ficam limitados aos servidores HTTPS do GitHub. O pacote tem limites de tamanho/entradas, e a extração recusa travessia de pastas, caminhos Windows especiais, ligações e nomes duplicados. O CI sem chave não gera estes manifestos assinados.

Os ficheiros são preparados em `.brandgame-updates/stage-*`. Antes da troca, o jogo tem de estar fechado; não são terminados processos. A app anterior fica em `.brandgame-updates/backup-*`. O registo `pending.json` permite restaurar uma troca interrompida. Os saves em AppData e o perfil WebView2 não fazem parte da pasta substituída. Mantém os backups de que precisares; não há limpeza automática nesta versão.

O lançador em execução não é substituído. Para atualizar o próprio `update.exe`, extrai a nova cópia da release com o lançador fechado. Isto também será necessário numa futura mudança de protocolo ou chave pública. A autenticação do pacote não instala certificados nem garante que o Windows aceite um executável com assinatura de desenvolvimento.

## Desenvolvimento e pacote local

`update.exe --local` compila as fontes locais; `--watch` mantém esse modo em observação. Requer o ambiente de desenvolvimento documentado no README. Ambos os modos partilham um bloqueio e recusam avançar sobre uma transação interrompida do outro modo.

Um pacote já descarregado pode ser instalado sem rede, mantendo a verificação:

```powershell
.\update.exe --install-package BrandGame-3.3.0-win-x64.zip --manifest release-manifest.json --signature release-manifest.sig --no-pause
```

Não há opção para aceitar um pacote sem assinatura, trocar a chave de confiança pela linha de comandos ou forçar um downgrade.
