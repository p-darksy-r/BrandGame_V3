[CmdletBinding()]
param([switch]$AllowUnsigned, [ValidateSet('preview', 'stable')][string]$Channel = 'preview')
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/Deployment.ps1')
. (Join-Path $PSScriptRoot 'lib/Signing.ps1')
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Assert-AppPayload -Path (Join-Path $projectRoot 'app')
$info = Get-Content -LiteralPath (Join-Path $projectRoot 'app/build-info.json') -Raw | ConvertFrom-Json
if ($info.sourceHash -ne (Get-SourceFingerprint -Root $projectRoot)) { throw 'A distribuicao esta desatualizada. Execute scripts/build.ps1 primeiro.' }
if (-not $AllowUnsigned) {
    if (-not $info.signing) { throw 'A distribuicao nao tem manifesto de assinatura.' }
    $verified = Assert-SignedBinary -Path (Join-Path $projectRoot 'app/BrandGame.exe') -ExpectedThumbprint $info.signing.thumbprint
    if ($verified.sha256 -ne $info.signing.sha256) { throw 'O executavel mudou depois de criar o manifesto de assinatura.' }
    $null = Assert-SignedBinary -Path (Join-Path $projectRoot 'update.exe') -ExpectedThumbprint $info.signing.thumbprint
}
$output = Get-WorkspacePath -Root $projectRoot -RelativePath 'artifacts/packages'
[IO.Directory]::CreateDirectory($output) | Out-Null
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'VERSION') -Raw).Trim()
$archive = Get-WorkspacePath -Root $projectRoot -RelativePath "artifacts/packages/BrandGame-$version-win-x64.zip"
$instructions = Join-Path $projectRoot 'docs/PLAYTEST.md'
Compress-Archive -LiteralPath @((Join-Path $projectRoot 'app'), (Join-Path $projectRoot 'update.exe'), $instructions) -DestinationPath $archive -Force
$webArchive = Get-WorkspacePath -Root $projectRoot -RelativePath "artifacts/packages/BrandGame-$version-web.zip"
Compress-Archive -LiteralPath @((Join-Path $projectRoot 'app/web'), $instructions) -DestinationPath $webArchive -Force
foreach ($package in @($archive, $webArchive)) {
    Get-FileHash -LiteralPath $package -Algorithm SHA256 |
        ForEach-Object { "$($_.Hash.ToLowerInvariant())  $([IO.Path]::GetFileName($package))" } |
        Set-Content -LiteralPath ($package + '.sha256') -Encoding ASCII
}
Write-Host "Pacote Windows: $archive"
Write-Host "Pacote web: $webArchive"
if (-not $AllowUnsigned) {
    & (Join-Path $PSScriptRoot 'sign-release.ps1') -Package $archive -Channel $Channel
}
