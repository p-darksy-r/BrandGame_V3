[CmdletBinding()]
param([switch]$Watch, [switch]$Launch)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/Deployment.ps1')
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$lock = $null
$exitCode = 0
try {
    $artifacts = Get-WorkspacePath -Root $projectRoot -RelativePath 'artifacts'
    [IO.Directory]::CreateDirectory($artifacts) | Out-Null
    try {
        $lock = [IO.File]::Open((Join-Path $artifacts 'update.lock'), [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    } catch { throw 'Ja existe uma atualizacao ou observacao em curso para este projeto.' }
    Recover-PendingDeployment -Root $projectRoot
    if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) { throw 'Instale o .NET SDK 8 ou superior para compilar a app.' }
    if (-not ((& dotnet --list-sdks) -match '^(8|9|[1-9][0-9])\.')) { throw 'E necessario o .NET SDK 8 ou superior; o runtime sozinho nao compila a app.' }

    $lastNotice = ''
    do {
        $stage = $null
        try {
            $fingerprint = Get-SourceFingerprint -Root $projectRoot
            $manifestPath = Join-Path $projectRoot 'app/build-info.json'
            $installedHash = ''
            if (Test-Path -LiteralPath $manifestPath) {
                try { $installedHash = (Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json).sourceHash } catch { }
            }
            $validInstall = $false
            if ($installedHash -eq $fingerprint) {
                try { Assert-AppPayload -Path (Join-Path $projectRoot 'app'); $validInstall = $true } catch { }
            }
            if ($validInstall) {
                if ($lastNotice -ne $fingerprint) { Write-Host 'A app ja corresponde ao codigo local atual.'; $lastNotice = $fingerprint }
            } else {
                if (Test-AppRunning -Root $projectRoot) { throw 'Feche app/BrandGame.exe para atualizar. O modo --watch tenta novamente automaticamente.' }
                $stage = Get-WorkspacePath -Root $projectRoot -RelativePath ('artifacts/staging/app-' + [Guid]::NewGuid().ToString('N'))
                [IO.Directory]::CreateDirectory($stage) | Out-Null
                Write-Host 'A compilar a versao Windows e a preparar os recursos web...'
                & dotnet publish (Join-Path $projectRoot 'src/csharp/BrandGame.csproj') -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:DebugType=None -o $stage --nologo
                if ($LASTEXITCODE -ne 0) { throw "A compilacao falhou (codigo $LASTEXITCODE). A app anterior foi preservada." }
                if ((Get-SourceFingerprint -Root $projectRoot) -ne $fingerprint) { throw 'O codigo mudou durante a compilacao. Execute novamente, ou aguarde pelo modo --watch.' }
                $revision = $null
                if ((Test-Path -LiteralPath (Join-Path $projectRoot '.git')) -and (Get-Command git -ErrorAction SilentlyContinue)) {
                    $revision = & git -C $projectRoot rev-parse --short HEAD 2>$null
                    if ($LASTEXITCODE -ne 0) { $revision = $null }
                }
                $info = [ordered]@{
                    version = (Get-Content -LiteralPath (Join-Path $projectRoot 'VERSION') -Raw).Trim()
                    sourceHash = $fingerprint
                    gitRevision = $revision
                    builtAtUtc = [DateTime]::UtcNow.ToString('o')
                    runtime = 'win-x64'
                    source = 'local-working-tree'
                }
                $info | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $stage 'build-info.json') -Encoding UTF8
                Install-StagedApp -Root $projectRoot -Stage $stage
                $stage = $null
                $lastNotice = $fingerprint
                Write-Host "App atualizada: app/BrandGame.exe (versao $($info.version))."
            }
            if ($Launch -and -not (Test-AppRunning -Root $projectRoot)) {
                Start-Process -FilePath (Join-Path $projectRoot 'app/BrandGame.exe') -WorkingDirectory (Join-Path $projectRoot 'app')
                $Launch = $false
            }
            $exitCode = 0
        } catch {
            $exitCode = 1
            if (-not $Watch) { throw }
            if ($lastNotice -ne $_.Exception.Message) { Write-Warning $_.Exception.Message; $lastNotice = $_.Exception.Message }
        } finally {
            if ($stage -and (Test-Path -LiteralPath $stage)) {
                $checkedStage = Get-WorkspacePath -Root $projectRoot -RelativePath ('artifacts/staging/' + [IO.Path]::GetFileName($stage))
                Remove-Item -LiteralPath $checkedStage -Recurse -Force
            }
        }
        if ($Watch) { Start-Sleep -Seconds 3 }
    } while ($Watch)
} catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    $exitCode = 1
} finally {
    if ($lock) { $lock.Dispose() }
}
exit $exitCode
