[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/Deployment.ps1')
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
& (Join-Path $PSScriptRoot 'verify-signatures.ps1')
$profile = Get-WorkspacePath -Root $projectRoot -RelativePath ('artifacts/smoke-' + [Guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($profile) | Out-Null
$results = @()
foreach ($test in @(
    @{ File = 'update.exe'; Arguments = '--help'; Name = 'updater-help' },
    @{ File = 'update.exe'; Arguments = '--local --no-pause'; Name = 'updater-current-source' },
    @{ File = 'app/BrandGame.exe'; Arguments = '--smoke-test'; Name = 'game-complete-level-and-persist-native-save' }
)) {
    $start = New-Object Diagnostics.ProcessStartInfo
    $start.FileName = Join-Path $projectRoot $test.File
    $start.Arguments = $test.Arguments
    $start.WorkingDirectory = $projectRoot
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardOutput = $true
    $start.RedirectStandardError = $true
    $start.EnvironmentVariables['BRANDGAME_PROFILE_ROOT'] = $profile
    $process = New-Object Diagnostics.Process
    $process.StartInfo = $start
    try {
        if (-not $process.Start()) { throw 'O processo nao iniciou.' }
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        if (-not $process.WaitForExit(90000)) { $process.Kill(); throw 'O teste excedeu 90 segundos.' }
        $stdout.Result | Set-Content -LiteralPath (Join-Path $profile ($test.Name + '.stdout.log')) -Encoding UTF8
        $stderr.Result | Set-Content -LiteralPath (Join-Path $profile ($test.Name + '.stderr.log')) -Encoding UTF8
        if ($process.ExitCode -ne 0) { throw "O processo terminou com codigo $($process.ExitCode). Consulte $profile" }
        $results += @{ test = $test.Name; result = 'passed'; sha256 = (Get-FileHash -LiteralPath $start.FileName).Hash.ToLowerInvariant() }
        Write-Host "PASS $($test.Name)"
    } catch {
        $results += @{ test = $test.Name; result = 'failed-or-blocked'; error = $_.Exception.Message }
        $results | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $profile 'results.json') -Encoding UTF8
        throw
    } finally { $process.Dispose() }
}
$results | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $profile 'results.json') -Encoding UTF8
Write-Host "Testes nativos concluidos com perfil isolado: $profile"
