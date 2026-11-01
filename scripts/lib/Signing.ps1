Set-StrictMode -Version Latest

$script:BrandGameCertificateSubject = 'CN=BrandGame Development, O=p-darksy-r'
$script:BrandGameCertificateName = 'BrandGame Development Code Signing'

function ConvertTo-SigningThumbprint {
    param([string]$Value)
    $normalized = ($Value -replace '\s', '').ToUpperInvariant()
    if ($normalized -notmatch '^[0-9A-F]{40}$') { throw 'A impressao digital do certificado deve ter 40 caracteres hexadecimais.' }
    return $normalized
}

function Get-BrandGameSigningIdentity {
    param([string]$Thumbprint = $env:BRANDGAME_SIGNING_THUMBPRINT)
    $null = Get-Command Get-AuthenticodeSignature -ErrorAction Stop
    $requested = if ($Thumbprint) { ConvertTo-SigningThumbprint $Thumbprint } else { $null }
    foreach ($location in @('CurrentUser', 'LocalMachine')) {
        $candidates = @(Get-ChildItem -Path "Cert:\$location\My" -CodeSigningCert -ErrorAction SilentlyContinue | Where-Object {
            if ($requested) { $_.Thumbprint -eq $requested }
            else { $location -eq 'CurrentUser' -and $_.Subject -eq $script:BrandGameCertificateSubject -and $_.FriendlyName -eq $script:BrandGameCertificateName }
        } | Sort-Object NotAfter -Descending)
        foreach ($certificate in $candidates) {
            if ($certificate.HasPrivateKey -and $certificate.NotBefore -le (Get-Date) -and $certificate.NotAfter -gt (Get-Date).AddDays(1)) {
                return [PSCustomObject]@{ Certificate = $certificate; Location = $location }
            }
        }
    }
    throw 'Nao existe um certificado de assinatura valido com chave privada. Execute scripts/setup-signing.ps1 para desenvolvimento, ou configure BRANDGAME_SIGNING_THUMBPRINT com um certificado publico.'
}

function Find-WindowsSignTool {
    $command = Get-Command signtool.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }
    $kits = 'C:\Program Files (x86)\Windows Kits\10\bin'
    if (Test-Path -LiteralPath $kits) {
        $candidate = Get-ChildItem -LiteralPath $kits -Directory | Where-Object { $_.Name -match '^\d+\.\d+\.\d+\.\d+$' } |
            Sort-Object { [Version]$_.Name } -Descending | ForEach-Object { Join-Path $_.FullName 'x64/signtool.exe' } |
            Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
        if ($candidate) { return $candidate }
    }
    throw 'Instale as ferramentas de assinatura do Windows SDK (signtool.exe).'
}

function Assert-SignedBinary {
    param([string]$Path, [string]$ExpectedThumbprint)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { throw "Executavel em falta: $Path" }
    $signature = Get-AuthenticodeSignature -LiteralPath $Path
    if ($signature.Status -ne 'Valid' -or -not $signature.SignerCertificate) {
        throw "Assinatura Authenticode invalida: $Path ($($signature.Status))."
    }
    if ($ExpectedThumbprint -and $signature.SignerCertificate.Thumbprint -ne (ConvertTo-SigningThumbprint $ExpectedThumbprint)) {
        throw "O executavel nao foi assinado pelo certificado esperado: $Path"
    }
    if (-not $signature.TimeStamperCertificate) { throw "Falta o timestamp da assinatura: $Path" }
    $certificate = $signature.SignerCertificate
    return [ordered]@{
        file = [IO.Path]::GetFileName($Path)
        status = $signature.Status.ToString()
        publisher = $certificate.Subject
        thumbprint = $certificate.Thumbprint
        certificateExpiresUtc = $certificate.NotAfter.ToUniversalTime().ToString('o')
        selfSigned = ($certificate.Subject -eq $certificate.Issuer)
        timestamped = $true
        timestampAuthority = $signature.TimeStamperCertificate.Subject
        sha256 = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
    }
}

function Invoke-BinarySigning {
    param([string]$Path, $Identity, [string]$TimestampServer = 'http://timestamp.digicert.com')
    $uri = $null
    if (-not [Uri]::TryCreate($TimestampServer, [UriKind]::Absolute, [ref]$uri) -or $uri.Scheme -notin @('http', 'https') -or $uri.UserInfo) {
        throw 'O servidor de timestamp deve ser um URL HTTP/HTTPS sem credenciais.'
    }
    $signTool = Find-WindowsSignTool
    $resolved = (Resolve-Path -LiteralPath $Path).Path
    if ([IO.Path]::GetExtension($resolved) -notin @('.exe', '.dll')) { throw 'So e permitida a assinatura de ficheiros EXE/DLL.' }
    $arguments = @('sign', '/fd', 'SHA256', '/sha1', $Identity.Certificate.Thumbprint, '/s', 'My', '/tr', $TimestampServer, '/td', 'SHA256', '/d', 'BrandGame')
    if ($Identity.Location -eq 'LocalMachine') { $arguments += '/sm' }
    & $signTool @arguments $resolved | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Falhou a assinatura ou o timestamp: $resolved" }
    & $signTool verify /pa $resolved | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Falhou a verificacao SignTool: $resolved" }
    return Assert-SignedBinary -Path $resolved -ExpectedThumbprint $Identity.Certificate.Thumbprint
}
