[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/Deployment.ps1')
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Assert-AppPayload -Path (Join-Path $projectRoot 'app')
$info = Get-Content -LiteralPath (Join-Path $projectRoot 'app/build-info.json') -Raw | ConvertFrom-Json
if ($info.sourceHash -ne (Get-SourceFingerprint -Root $projectRoot)) { throw 'A distribuicao esta desatualizada. Execute scripts/build.ps1 primeiro.' }
$output = Get-WorkspacePath -Root $projectRoot -RelativePath 'artifacts/packages'
[IO.Directory]::CreateDirectory($output) | Out-Null
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'VERSION') -Raw).Trim()
$archive = Get-WorkspacePath -Root $projectRoot -RelativePath "artifacts/packages/BrandGame-$version-win-x64.zip"
Compress-Archive -LiteralPath (Join-Path $projectRoot 'app') -DestinationPath $archive -Force
Get-FileHash -LiteralPath $archive -Algorithm SHA256 |
    ForEach-Object { "$($_.Hash.ToLowerInvariant())  $([IO.Path]::GetFileName($archive))" } |
    Set-Content -LiteralPath ($archive + '.sha256') -Encoding ASCII
Write-Host "Pacote Windows: $archive"
