# One-time, explicitly requested development identity setup. Never run during a build.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSEdition -eq 'Desktop') { $env:PSModulePath = Join-Path $PSHOME 'Modules' }
. (Join-Path $PSScriptRoot 'lib/Signing.ps1')
$null = Find-WindowsSignTool
$null = Get-Command New-SelfSignedCertificate -ErrorAction Stop
$certificate = Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert | Where-Object {
    $_.Subject -eq $script:BrandGameCertificateSubject -and $_.FriendlyName -eq $script:BrandGameCertificateName -and
    $_.HasPrivateKey -and $_.NotBefore -le (Get-Date) -and $_.NotAfter -gt (Get-Date).AddDays(30)
} | Sort-Object NotAfter -Descending | Select-Object -First 1
if (-not $certificate) {
    $certificate = New-SelfSignedCertificate -Type CodeSigningCert -Subject $script:BrandGameCertificateSubject `
        -FriendlyName $script:BrandGameCertificateName -CertStoreLocation Cert:\CurrentUser\My `
        -KeyAlgorithm RSA -KeyLength 3072 -HashAlgorithm SHA256 -KeyExportPolicy NonExportable `
        -NotAfter (Get-Date).AddYears(3)
}

# Trust only this project's public code-signing certificate in the current user profile.
# The private key stays non-exportable in CurrentUser/My; no machine-wide policy changes.
$publicCertificate = New-Object Security.Cryptography.X509Certificates.X509Certificate2 @(,$certificate.RawData)
try {
    foreach ($name in @('Root', 'TrustedPublisher')) {
        $store = New-Object Security.Cryptography.X509Certificates.X509Store($name, 'CurrentUser')
        $store.Open([Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
        try {
            if (-not ($store.Certificates | Where-Object Thumbprint -eq $certificate.Thumbprint)) { $store.Add($publicCertificate) }
        } finally { $store.Close(); $store.Dispose() }
    }
} finally { $publicCertificate.Dispose() }
Write-Host "Identidade de desenvolvimento: $($certificate.Subject)"
Write-Host "Impressao digital: $($certificate.Thumbprint)"
Write-Host "Valida ate: $($certificate.NotAfter.ToString('yyyy-MM-dd'))"
Write-Host 'Confianca apenas neste perfil Windows. Nao estabelece confianca publica no SmartScreen/Smart App Control.'
