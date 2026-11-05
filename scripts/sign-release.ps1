[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Package, [ValidateSet('preview', 'stable')][string]$Channel = 'preview')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/Signing.ps1')
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$identity = Get-BrandGameSigningIdentity
$version = (Get-Content -LiteralPath (Join-Path $root 'VERSION') -Raw).Trim()
$packageInfo = Get-Item -LiteralPath $Package
if ($packageInfo.Name -ne "BrandGame-$version-win-x64.zip") { throw 'Nome de pacote inesperado.' }
$manifest = [ordered]@{
    schema = 1; version = $version; channel = $Channel; file = $packageInfo.Name
    size = $packageInfo.Length; sha256 = (Get-FileHash -LiteralPath $packageInfo.FullName).Hash.ToLowerInvariant()
}
$json = [Text.UTF8Encoding]::new($false).GetBytes(($manifest | ConvertTo-Json -Compress))
$rsa = [Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($identity.Certificate)
$public = [Security.Cryptography.RSACryptoServiceProvider]::new()
try {
    $public.FromXmlString([IO.File]::ReadAllText((Join-Path $root 'src/updater/release-public-key.xml')))
    $signature = $rsa.SignData($json, [Security.Cryptography.HashAlgorithmName]::SHA256, [Security.Cryptography.RSASignaturePadding]::Pkcs1)
    if (-not $public.VerifyData($json, $signature, [Security.Cryptography.HashAlgorithmName]::SHA256, [Security.Cryptography.RSASignaturePadding]::Pkcs1)) {
        throw 'A chave de assinatura nao corresponde a chave publica fixada no atualizador.'
    }
    [IO.File]::WriteAllBytes((Join-Path $packageInfo.DirectoryName 'release-manifest.json'), $json)
    [IO.File]::WriteAllBytes((Join-Path $packageInfo.DirectoryName 'release-manifest.sig'), $signature)
} finally { $rsa.Dispose(); $public.Dispose() }
Write-Host 'Manifesto de atualizacao assinado e verificado; a chave privada nao foi exportada.'
