[CmdletBinding()]
param([string]$CertificateThumbprint = $env:BRANDGAME_SIGNING_THUMBPRINT)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/Deployment.ps1')
. (Join-Path $PSScriptRoot 'lib/Signing.ps1')
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$identity = Get-BrandGameSigningIdentity -Thumbprint $CertificateThumbprint
$report = @(
    Assert-SignedBinary -Path (Join-Path $projectRoot 'app/BrandGame.exe') -ExpectedThumbprint $identity.Certificate.Thumbprint
    Assert-SignedBinary -Path (Join-Path $projectRoot 'update.exe') -ExpectedThumbprint $identity.Certificate.Thumbprint
)
$output = Get-WorkspacePath -Root $projectRoot -RelativePath 'artifacts/signing'
[IO.Directory]::CreateDirectory($output) | Out-Null
$report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $output 'signatures.json') -Encoding UTF8
$report | ForEach-Object { Write-Host "$($_.file): $($_.status), SHA-256, timestamp presente, $($_.publisher)" }
