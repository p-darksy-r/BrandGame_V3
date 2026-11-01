[CmdletBinding()]
param([switch]$SkipApp)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/Deployment.ps1')
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$output = Get-WorkspacePath -Root $projectRoot -RelativePath ('artifacts/staging/updater-' + [Guid]::NewGuid().ToString('N'))
try {
    & dotnet publish (Join-Path $projectRoot 'src/updater/BrandGame.Updater.csproj') -c Release -r win-x64 --self-contained true -o $output --nologo
    if ($LASTEXITCODE -ne 0) { throw 'Falhou a compilacao do update.exe.' }
    $updater = Get-WorkspacePath -Root $projectRoot -RelativePath 'update.exe'
    $updaterTemp = Get-WorkspacePath -Root $projectRoot -RelativePath 'update.new.exe'
    Copy-Item -LiteralPath (Join-Path $output 'update.exe') -Destination $updaterTemp -Force
    $updaterBackup = Get-WorkspacePath -Root $projectRoot -RelativePath 'artifacts/update.previous.exe'
    if (Test-Path -LiteralPath $updater) { [IO.File]::Replace($updaterTemp, $updater, $updaterBackup) }
    else { [IO.File]::Move($updaterTemp, $updater) }
    Write-Host 'update.exe criado na raiz do projeto.'
} finally {
    if (Test-Path -LiteralPath $output) { Remove-Item -LiteralPath $output -Recurse -Force }
}
if (-not $SkipApp) {
    & (Join-Path $PSScriptRoot 'update.ps1')
    exit $LASTEXITCODE
}
