# Assinatura Windows

A versão 3.1.1 segue a organização de Letters Game Ultimate e Path Forge: scripts dedicados, identidade de desenvolvimento no armazenamento de certificados do Windows, verificação dos binários finais, timestamp e testes de arranque independentes.

## Identidade deste projeto

- Nome: `CN=BrandGame Development, O=p-darksy-r`.
- Certificado: RSA 3072, exclusivo para assinatura de código, validade de três anos.
- Impressão digital atual: `99B9BAB066733AD6D266F88B3B0260D1E4D16841`.
- Chave privada: não exportável, em `CurrentUser/My`; nunca entra no projeto, Git ou releases.
- Confiança local: só o certificado público é adicionado a `CurrentUser/Root` e `CurrentUser/TrustedPublisher`, através da preparação explícita do programador.
- Assinatura: Authenticode SHA-256; timestamp RFC 3161 SHA-256 obtido em `http://timestamp.digicert.com`.

Não são criadas exceções no antivírus, nem alteradas políticas de Smart App Control ou SmartScreen. A confiança local num certificado não equivale à confiança pública numa entidade certificadora.

## Preparar, compilar e verificar

```powershell
# Uma vez por perfil Windows de desenvolvimento; não é um passo para jogadores.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-signing.ps1

# Assina em staging e verifica antes de substituir cada executável.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1

# Verifica os dois EXE, certificado esperado, timestamp e SHA-256.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-signatures.ps1

# Confirma que um ficheiro alterado deixa de passar a validação.
powershell -NoProfile -ExecutionPolicy Bypass -File tests/signing.Tests.ps1 -Integration

# Executa os binários assinados sem abrir o perfil do jogador.
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/smoke-windows.ps1
```

`setup-signing.ps1` reutiliza uma identidade válida do próprio BrandGame, sem alterar os certificados dos outros projetos. Os builds nunca criam ou instalam certificados automaticamente. Se faltar certificado, chave privada, ferramenta de assinatura, timestamp ou assinatura válida, a publicação termina com erro.

`app/build-info.json` contém os metadados e o hash do jogo assinado. `artifacts/signing/signatures.json` identifica os dois executáveis. Calculam-se hashes e pacotes depois de assinar; alterar o executável após a assinatura invalida-a. Renova a identidade antes de expirar; o timestamp não torna um certificado autoassinado publicamente confiável.

## Certificado público futuro

O mesmo processo aceita um certificado de assinatura de código instalado em `CurrentUser/My` ou `LocalMachine/My`, com acesso à respetiva chave/token:

```powershell
$env:BRANDGAME_SIGNING_THUMBPRINT = 'IMPRESSAO_DIGITAL_DO_CERTIFICADO_PUBLICO'
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1
```

O certificado público não é criado por este projeto: exige emissão e validação por um fornecedor reconhecido. Um certificado público novo pode continuar a mostrar avisos de SmartScreen enquanto ganha reputação. A distribuição MSIX pela Microsoft Store é outra possibilidade, sujeita a conta, preparação e certificação pela Microsoft.

Não exportar a chave privada para GitHub. O workflow de CI compila explicitamente sem assinatura e identifica os artefactos como `Unsigned-CI`. As releases de desenvolvimento são assinadas no PC do autor e indicam claramente os seus limites. Não pedir a jogadores que instalem o certificado de desenvolvimento.

Referências Microsoft: [assinatura para Smart App Control](https://learn.microsoft.com/en-us/windows/apps/develop/smart-app-control/code-signing-for-smart-app-control), [opções de assinatura](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options), [reputação no SmartScreen](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation).

## Manifestos de atualização (3.3.0)

Além de Authenticode, `scripts/sign-release.ps1` assina os bytes do manifesto de download com RSA/SHA-256 (PKCS#1). Usa a chave não exportável já existente e verifica a assinatura contra `src/updater/release-public-key.xml`; esse ficheiro contém **apenas a chave pública** e é embebido em `update.exe`. O manifest não instala certificados e não altera as decisões de execução do Windows.

Uma mudança de certificado Authenticode pode também mudar a chave RSA. Nesse caso, o empacotamento recusa assinar com uma chave incompatível. A rotação exige planear e distribuir um novo lançador com a chave pública adequada; não editar silenciosamente o pin nem descarregar chaves de confiança da mesma release que se quer verificar.
