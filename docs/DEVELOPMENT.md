# Desenvolvimento e versões

## Trabalhar no projeto

1. Altera as fontes em `src`.
2. Usa `scripts/test.ps1` para verificar o comportamento.
3. Executa `scripts/build.ps1` para criar o atualizador e a distribuição, ou `update.exe --watch` durante o desenvolvimento.
4. Abre `app/BrandGame.exe` e verifica os fluxos alterados.

O VS Code tem tarefas separadas para compilar em Debug, publicar e testar. O motor C++ não é obrigatório para o arranque. Se o compilares com o toolchain C++ do Visual Studio, coloca a DLL x64 atual em `src/csharp/BrandEngine.dll` antes de publicar. Uma DLL antiga pode ter regras incompatíveis; não a reutilizes depois de alterar o motor.

## Dividir código à medida que cresce

- Um ficheiro deve ter uma responsabilidade clara. Se começar a reunir persistência, apresentação e regras, separa-o antes de acrescentar funcionalidades.
- Usa cerca de 300 linhas como sinal para rever ficheiros de lógica, não como limite arbitrário. Catálogos de dados podem ser maiores.
- Extrai funções com nomes claros e dependências explícitas. Evita copiar regras entre funcionalidades.
- Para scripts clássicos, atualiza a ordem em `index.html` e verifica que todos os recursos existem na distribuição.
- Acrescenta testes para regras ou falhas reais; não é necessário testar alterações puramente cosméticas.

## Concluir uma versão

O proprietário pediu que as versões concluídas sejam enviadas para **https://github.com/p-darksy-r/BrandGame_V3**.

1. Atualiza `VERSION`, a identificação do frontend e `docs/CHANGELOG.md`.
2. Atualiza `README.md`; este mesmo ficheiro é o README mostrado pelo GitHub.
3. Executa testes e publicação. Regista limitações de validação, como um bloqueio de execução pelo Windows.
4. Revê `git diff` e preserva alterações locais existentes.
5. Faz commit e push para o repositório indicado, sem force-push. Se a branch estiver protegida, usa uma branch `codex/` e um pull request.
6. Para distribuir binários, executa `scripts/package.ps1` e anexa o ZIP à release correspondente. Não adiciona binários pesados ao histórico Git.

## Recuperação

Em caso de falha de compilação, a instalação existente permanece. Se uma troca foi interrompida, executa novamente o atualizador para recuperar. Para regressar manualmente a uma versão anterior, fecha a app e copia uma pasta de `artifacts/backups` para `app`, preservando antes qualquer conteúdo de que precises.

`docs/legacy/make_game.py.txt` conserva o antigo gerador de projeto como referência histórica. Era um ficheiro incompleto que continha cópias antigas das fontes; não faz parte da compilação e não deve ser usado para regenerar o projeto.
