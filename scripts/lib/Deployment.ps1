Set-StrictMode -Version Latest

function Get-WorkspacePath {
    param([string]$Root, [string]$RelativePath)
    $base = [IO.Path]::GetFullPath($Root).TrimEnd('\', '/')
    $target = [IO.Path]::GetFullPath((Join-Path $base $RelativePath))
    if (-not $target.StartsWith($base + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "O caminho sai da pasta do projeto: $target"
    }
    # Never follow an output junction outside the checked workspace.
    $current = $target
    while ($current -and $current.Length -gt $base.Length) {
        if (Test-Path -LiteralPath $current) {
            $item = Get-Item -LiteralPath $current -Force
            if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
                throw "Nao e permitido publicar atraves de uma ligacao: $current"
            }
        }
        $current = [IO.Path]::GetDirectoryName($current)
    }
    return $target
}

function Get-SourceFingerprint {
    param([string]$Root)
    $paths = @('src/csharp', 'src/cpp', 'src/web', 'scripts')
    $files = @(
        foreach ($path in $paths) {
            Get-ChildItem -LiteralPath (Join-Path $Root $path) -Recurse -File |
                Where-Object { $_.FullName -notmatch '[\\/](bin|obj)[\\/]' -and $_.Extension -notin @('.dll', '.pdb', '.exe', '.obj', '.lib', '.exp') }
        }
        foreach ($path in @('VERSION', 'Directory.Build.props', 'global.json', 'NuGet.Config')) {
            if (Test-Path -LiteralPath (Join-Path $Root $path)) { Get-Item -LiteralPath (Join-Path $Root $path) }
        }
        if (Test-Path -LiteralPath (Join-Path $Root 'src/csharp/BrandEngine.dll')) {
            Get-Item -LiteralPath (Join-Path $Root 'src/csharp/BrandEngine.dll')
        }
    )
    $entries = foreach ($file in ($files | Sort-Object FullName)) {
        $relative = $file.FullName.Substring($Root.TrimEnd('\', '/').Length).Replace('\', '/')
        $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
        "$relative=$hash"
    }
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        return ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes(($entries -join "`n"))))).Replace('-', '').ToLowerInvariant()
    } finally { $sha.Dispose() }
}

function Assert-AppPayload {
    param([string]$Path)
    foreach ($required in @('BrandGame.exe', 'web/index.html', 'build-info.json')) {
        if (-not (Test-Path -LiteralPath (Join-Path $Path $required) -PathType Leaf)) {
            throw "Publicacao incompleta: falta $required"
        }
    }
    $info = Get-Content -LiteralPath (Join-Path $Path 'build-info.json') -Raw | ConvertFrom-Json
    if ($info.sourceHash -cnotmatch '^[a-f0-9]{64}$' -or $info.version -notmatch '^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$') {
        throw 'Manifesto de publicacao invalido.'
    }
    $html = Get-Content -LiteralPath (Join-Path $Path 'web/index.html') -Raw
    foreach ($match in [regex]::Matches($html, '(?i)(?:src|href)\s*=\s*["'']([^"'']+)["'']')) {
        $asset = $match.Groups[1].Value
        if ($asset -match '^(https?:|data:|#|//)') { continue }
        $asset = ($asset -split '[?#]', 2)[0]
        if (-not $asset) { continue }
        $assetPath = Get-WorkspacePath -Root (Join-Path $Path 'web') -RelativePath $asset
        if (-not (Test-Path -LiteralPath $assetPath -PathType Leaf)) { throw "Recurso web em falta: $asset" }
    }
}

function Recover-PendingDeployment {
    param([string]$Root)
    $journal = Get-WorkspacePath -Root $Root -RelativePath 'artifacts/pending-update.json'
    if (-not (Test-Path -LiteralPath $journal)) { return }
    $pending = Get-Content -LiteralPath $journal -Raw | ConvertFrom-Json
    if ($pending.stageName -notmatch '^app-[a-f0-9]{32}$' -or $pending.backupName -notmatch '^app-[a-f0-9]{32}$' -or $pending.hadApp -isnot [bool]) {
        throw 'Registo de atualizacao invalido. Verifique artifacts/pending-update.json.'
    }
    $app = Get-WorkspacePath -Root $Root -RelativePath 'app'
    $backup = Get-WorkspacePath -Root $Root -RelativePath ('artifacts/backups/' + $pending.backupName)
    $stage = Get-WorkspacePath -Root $Root -RelativePath ('artifacts/staging/' + $pending.stageName)
    if (-not (Test-Path -LiteralPath $app)) {
        if (Test-Path -LiteralPath $backup) {
            [IO.Directory]::Move($backup, $app)
            Write-Host 'A versao anterior foi recuperada apos uma atualizacao interrompida.'
        } elseif (-not $pending.hadApp -and (Test-Path -LiteralPath $stage)) {
            Assert-AppPayload -Path $stage
            [IO.Directory]::Move($stage, $app)
        } elseif ($pending.hadApp) { throw 'Nao foi encontrada a copia de seguranca da atualizacao interrompida.' }
    }
    if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
    Remove-Item -LiteralPath $journal -Force
}

function Test-AppRunning {
    param([string]$Root)
    $executable = Get-WorkspacePath -Root $Root -RelativePath 'app/BrandGame.exe'
    foreach ($process in @(Get-Process -Name BrandGame -ErrorAction SilentlyContinue)) {
        try { if ($process.Path -eq $executable) { return $true } }
        catch { throw 'Nao foi possivel confirmar se BrandGame esta aberta. Feche a app e tente novamente.' }
    }
    return $false
}

function Install-StagedApp {
    param([string]$Root, [string]$Stage)
    Recover-PendingDeployment -Root $Root
    $app = Get-WorkspacePath -Root $Root -RelativePath 'app'
    if ((Test-Path -LiteralPath $app) -and -not (Test-Path -LiteralPath $app -PathType Container)) {
        throw 'app deve ser uma pasta; foi encontrado um ficheiro com esse nome.'
    }
    $stageRelative = [IO.Path]::GetFullPath($Stage).Substring($Root.TrimEnd('\', '/').Length + 1)
    if ((Get-WorkspacePath -Root $Root -RelativePath $stageRelative) -ne [IO.Path]::GetFullPath($Stage)) {
        throw 'A publicacao temporaria deve estar dentro do projeto.'
    }
    if (-not $Stage.StartsWith((Get-WorkspacePath -Root $Root -RelativePath 'artifacts/staging') + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw 'A publicacao temporaria deve estar em artifacts/staging.'
    }
    if ([IO.Path]::GetFileName($Stage) -notmatch '^app-[a-f0-9]{32}$' -or
        [IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($Stage)) -ne (Get-WorkspacePath -Root $Root -RelativePath 'artifacts/staging')) {
        throw 'A pasta temporaria deve estar diretamente em artifacts/staging e usar o nome app- seguido de 32 caracteres hexadecimais.'
    }
    Assert-AppPayload -Path $Stage
    if (Test-AppRunning -Root $Root) { throw 'Feche app/BrandGame.exe para aplicar a atualizacao. A versao atual foi preservada.' }
    $backup = Get-WorkspacePath -Root $Root -RelativePath ('artifacts/backups/app-' + [Guid]::NewGuid().ToString('N'))
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($backup)) | Out-Null
    $hadApp = Test-Path -LiteralPath $app
    $journal = Get-WorkspacePath -Root $Root -RelativePath 'artifacts/pending-update.json'
    $journalTemp = Get-WorkspacePath -Root $Root -RelativePath 'artifacts/pending-update.tmp'
    @{ stageName = [IO.Path]::GetFileName($Stage); backupName = [IO.Path]::GetFileName($backup); hadApp = [bool]$hadApp } |
        ConvertTo-Json | Set-Content -LiteralPath $journalTemp -Encoding UTF8
    [IO.File]::Move($journalTemp, $journal)
    try {
        if ($hadApp) { [IO.Directory]::Move($app, $backup) }
        [IO.Directory]::Move($Stage, $app)
    } catch {
        if ($hadApp -and (Test-Path -LiteralPath $backup) -and -not (Test-Path -LiteralPath $app)) {
            [IO.Directory]::Move($backup, $app)
        }
        if (Test-Path -LiteralPath $app) { Remove-Item -LiteralPath $journal -Force }
        throw
    }
    Remove-Item -LiteralPath $journal -Force
    if ($hadApp) { Write-Host "Versao anterior guardada em: $backup" }
}
