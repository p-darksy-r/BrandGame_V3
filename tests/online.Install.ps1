[CmdletBinding()]
param([switch]$Online, [ValidatePattern('^[a-fA-F0-9]{64}$')][string]$ExpectedAppSha256)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
. (Join-Path $root 'scripts/lib/Deployment.ps1')
$version = (Get-Content -LiteralPath (Join-Path $root 'VERSION') -Raw).Trim()
$fixture = Get-WorkspacePath -Root $root -RelativePath ('artifacts/install-test-' + [Guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($fixture) | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'update.exe') -Destination (Join-Path $fixture 'update.exe')

function Invoke-Isolated {
    param([string]$File, [string[]]$Arguments, [string]$Name, [int]$ExpectedCode = 0)
    $info = New-Object Diagnostics.ProcessStartInfo
    $info.FileName = Join-Path $fixture $File
    $info.Arguments = ($Arguments | ForEach-Object { '"' + $_ + '"' }) -join ' '
    $info.WorkingDirectory = $fixture
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $info.EnvironmentVariables['PATH'] = "$env:SystemRoot\System32;$env:SystemRoot"
    $info.EnvironmentVariables['BRANDGAME_PROFILE_ROOT'] = Join-Path $fixture 'test-profile'
    [IO.Directory]::CreateDirectory($info.EnvironmentVariables['BRANDGAME_PROFILE_ROOT']) | Out-Null
    $process = New-Object Diagnostics.Process
    $process.StartInfo = $info
    try {
        if (-not $process.Start()) { throw "Nao iniciou $Name" }
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        if (-not $process.WaitForExit(300000)) { $process.Kill(); throw "Timeout: $Name" }
        $stdout.Result | Set-Content -LiteralPath (Join-Path $fixture "$Name.stdout.log") -Encoding UTF8
        $stderr.Result | Set-Content -LiteralPath (Join-Path $fixture "$Name.stderr.log") -Encoding UTF8
        if ($process.ExitCode -ne $ExpectedCode) { throw "Falhou $Name (codigo $($process.ExitCode)); consulte $fixture" }
        Write-Host "PASS $Name"
    } finally { $process.Dispose() }
}

if ($Online) {
    Invoke-Isolated -File 'update.exe' -Arguments @('--no-pause') -Name 'github-install'
} else {
    $package = Join-Path $root "artifacts/packages/BrandGame-$version-win-x64.zip"
    $manifest = Join-Path $root 'artifacts/packages/release-manifest.json'
    $signature = Join-Path $root 'artifacts/packages/release-manifest.sig'
    $badManifest = Join-Path $fixture 'modified-manifest.json'
    [IO.File]::WriteAllText($badManifest, ([IO.File]::ReadAllText($manifest) + ' '))
    Invoke-Isolated -File 'update.exe' -Arguments @('--install-package', $package, '--manifest', $badManifest, '--signature', $signature, '--no-pause') -Name 'reject-modified-manifest' -ExpectedCode 1
    if (Test-Path -LiteralPath (Join-Path $fixture 'app')) { throw 'O pacote adulterado alterou a instalacao.' }
    Invoke-Isolated -File 'update.exe' -Arguments @('--install-package', $package, '--manifest', $manifest, '--signature', $signature, '--no-pause') -Name 'signed-package-install'
}
$installed = Get-Content -LiteralPath (Join-Path $fixture 'app/build-info.json') -Raw | ConvertFrom-Json
if ($installed.version -ne $version) { throw 'Versao instalada inesperada.' }
if (-not $ExpectedAppSha256) { $ExpectedAppSha256 = (Get-FileHash -LiteralPath (Join-Path $root 'app/BrandGame.exe')).Hash }
if ((Get-FileHash -LiteralPath (Join-Path $fixture 'app/BrandGame.exe')).Hash -ne $ExpectedAppSha256) { throw 'O executavel instalado difere da distribuicao validada.' }
Invoke-Isolated -File 'app/BrandGame.exe' -Arguments @('--smoke-test') -Name 'installed-game-full-level'
@{ version = $version; online = [bool]$Online; result = 'passed'; noDevelopmentToolsOnPath = $true } |
    ConvertTo-Json | Set-Content -LiteralPath (Join-Path $fixture 'results.json') -Encoding UTF8
Write-Host "Instalacao e partida validadas sem ferramentas de desenvolvimento no PATH: $fixture"
