[CmdletBinding()]
param()

# Standalone regression suite; no Pester installation or application build required.
$ErrorActionPreference = 'Stop'
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
. (Join-Path $repositoryRoot 'scripts/lib/Deployment.ps1')
$fixtureRoot = Get-WorkspacePath -Root $repositoryRoot -RelativePath ('artifacts/test-updater-' + [Guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($fixtureRoot) | Out-Null
$script:passed = 0
$script:failed = 0

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

function Assert-Throws {
    param([scriptblock]$Action, [string]$Message)
    $threw = $false
    try { & $Action | Out-Null } catch { $threw = $true }
    Assert-True -Condition $threw -Message $Message
}

function Test-Case {
    param([string]$Name, [scriptblock]$Action)
    try {
        & $Action
        $script:passed++
        Write-Host "PASS $Name"
    } catch {
        $script:failed++
        Write-Host "FAIL $Name`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function New-TestWorkspace {
    $path = Join-Path $fixtureRoot ([Guid]::NewGuid().ToString('N'))
    foreach ($relative in @('src/csharp', 'src/cpp', 'src/web', 'src/updater', 'scripts', 'artifacts/staging')) {
        [IO.Directory]::CreateDirectory((Join-Path $path $relative)) | Out-Null
    }
    Set-Content -LiteralPath (Join-Path $path 'VERSION') -Value '3.1.0' -Encoding UTF8
    return $path
}

function New-TestPayload {
    param([string]$Path, [string]$Marker = 'current')
    [IO.Directory]::CreateDirectory((Join-Path $Path 'web/js')) | Out-Null
    Set-Content -LiteralPath (Join-Path $Path 'BrandGame.exe') -Value $Marker -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $Path 'web/index.html') -Value '<!doctype html><script src="js/main.js"></script>' -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $Path 'web/js/main.js') -Value '// fixture' -Encoding UTF8
    [ordered]@{
        version = '3.1.0'
        sourceHash = ('a' * 64)
        gitRevision = $null
        builtAtUtc = [DateTime]::UtcNow.ToString('o')
        runtime = 'win-x64'
        source = 'local-working-tree'
    } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $Path 'build-info.json') -Encoding UTF8
    return $Path
}

function New-PendingJournal {
    param([string]$Root, [string]$StageName, [string]$BackupName, [bool]$HadApp)
    [ordered]@{ stageName = $StageName; backupName = $BackupName; hadApp = $HadApp } |
        ConvertTo-Json | Set-Content -LiteralPath (Join-Path $Root 'artifacts/pending-update.json') -Encoding UTF8
}

function New-TestStagePath {
    param([string]$Root)
    return (Join-Path $Root ('artifacts/staging/app-' + [Guid]::NewGuid().ToString('N')))
}

try {
    Test-Case 'Workspace paths reject traversal, sibling-prefix paths and the workspace root' {
        $root = New-TestWorkspace
        Assert-Throws { Get-WorkspacePath -Root $root -RelativePath '../outside' } 'Traversal was accepted.'
        Assert-Throws { Get-WorkspacePath -Root $root -RelativePath ("../" + [IO.Path]::GetFileName($root) + '-other/file') } 'A sibling with the same prefix was accepted.'
        Assert-Throws { Get-WorkspacePath -Root $root -RelativePath '.' } 'Workspace root must not be a recursive output target.'
        Assert-True ((Get-WorkspacePath -Root $root -RelativePath 'artifacts/staging/item') -eq (Join-Path $root 'artifacts/staging/item')) 'Normal child paths should be accepted.'
    }

    Test-Case 'Workspace paths reject output junctions' {
        $root = New-TestWorkspace
        $target = Join-Path $fixtureRoot ('junction-target-' + [Guid]::NewGuid().ToString('N'))
        [IO.Directory]::CreateDirectory($target) | Out-Null
        $link = Join-Path $root 'linked-output'
        try {
            New-Item -ItemType Junction -Path $link -Target $target | Out-Null
            Assert-Throws { Get-WorkspacePath -Root $root -RelativePath 'linked-output/file' } 'An output junction was accepted.'
        } finally {
            # Delete only the junction itself; never recurse through its target.
            if (Test-Path -LiteralPath $link) { [IO.Directory]::Delete($link) }
        }
    }

    Test-Case 'Payload validation accepts a complete local payload' {
        $root = New-TestWorkspace
        $stage = New-TestPayload -Path (New-TestStagePath -Root $root)
        Assert-AppPayload -Path $stage
    }

    Test-Case 'Payload validation rejects a missing entry point or linked script' {
        $root = New-TestWorkspace
        $stage = New-TestPayload -Path (New-TestStagePath -Root $root)
        Remove-Item -LiteralPath (Join-Path $stage 'web/js/main.js')
        Assert-Throws { Assert-AppPayload -Path $stage } 'A referenced missing script was accepted.'
        Remove-Item -LiteralPath (Join-Path $stage 'BrandGame.exe')
        Assert-Throws { Assert-AppPayload -Path $stage } 'A missing executable was accepted.'
    }

    Test-Case 'Offline manifest rejects missing, modified or out-of-root assets' {
        $root = New-TestWorkspace
        $stage = New-TestPayload -Path (New-TestStagePath -Root $root)
        $infoPath = Join-Path $stage 'build-info.json'
        $info = Get-Content -LiteralPath $infoPath -Raw | ConvertFrom-Json
        $info.version = '3.2.0'
        $info | ConvertTo-Json | Set-Content -LiteralPath $infoPath -Encoding UTF8
        Assert-Throws { Assert-AppPayload -Path $stage } 'Missing offline manifest was accepted.'
        [IO.Directory]::CreateDirectory((Join-Path $stage 'web/assets')) | Out-Null
        $manifest = Join-Path $stage 'web/assets/manifest.json'
        $asset = Join-Path $stage 'web/js/main.js'
        @{ version = '3.2.0'; sha256 = @{ 'js/main.js' = (Get-FileHash -LiteralPath $asset).Hash.ToLowerInvariant() } } |
            ConvertTo-Json | Set-Content -LiteralPath $manifest -Encoding UTF8
        Assert-AppPayload -Path $stage
        Add-Content -LiteralPath $asset -Value '// changed'
        Assert-Throws { Assert-AppPayload -Path $stage } 'Modified offline resource was accepted.'
        @{ version = '3.2.0'; sha256 = @{ '../BrandGame.exe' = ('a' * 64) } } |
            ConvertTo-Json | Set-Content -LiteralPath $manifest -Encoding UTF8
        Assert-Throws { Assert-AppPayload -Path $stage } 'Asset outside web was accepted.'
    }

    Test-Case 'Payload validation checks query strings, fragments and HTML attribute spacing' {
        $root = New-TestWorkspace
        $stage = New-TestPayload -Path (New-TestStagePath -Root $root)
        foreach ($markup in @('<script src="missing.js?v=1"></script>', '<link href="missing.css#theme">', '<script SRC = "missing.js"></script>')) {
            Set-Content -LiteralPath (Join-Path $stage 'web/index.html') -Value $markup -Encoding UTF8
            Assert-Throws { Assert-AppPayload -Path $stage } "Missing asset was accepted: $markup"
        }
        Set-Content -LiteralPath (Join-Path $stage 'web/index.html') -Value '<script src="js/main.js?v=1#part"></script><a href="#section">Jump</a>' -Encoding UTF8
        Assert-AppPayload -Path $stage
    }

    Test-Case 'Payload validation rejects invalid manifests' {
        $root = New-TestWorkspace
        $stage = New-TestPayload -Path (New-TestStagePath -Root $root)
        foreach ($manifest in @('{broken-json', '{}', '{"version":"3.1.0","sourceHash":"invalid"}')) {
            Set-Content -LiteralPath (Join-Path $stage 'build-info.json') -Value $manifest -Encoding UTF8
            Assert-Throws { Assert-AppPayload -Path $stage } "Invalid manifest was accepted: $manifest"
        }
    }

    Test-Case 'Payload validation rejects assets escaping web' {
        $root = New-TestWorkspace
        $stage = New-TestPayload -Path (New-TestStagePath -Root $root)
        Set-Content -LiteralPath (Join-Path $stage 'web/index.html') -Value '<script src="../BrandGame.exe"></script>' -Encoding UTF8
        Assert-Throws { Assert-AppPayload -Path $stage } 'An asset outside web was accepted.'
    }

    Test-Case 'Deployment replaces stale files and retains a complete previous version' {
        $root = New-TestWorkspace
        $app = New-TestPayload -Path (Join-Path $root 'app') -Marker 'old-version'
        Set-Content -LiteralPath (Join-Path $app 'obsolete.txt') -Value 'old-only' -Encoding UTF8
        $stage = New-TestPayload -Path (New-TestStagePath -Root $root) -Marker 'new-version'
        Install-StagedApp -Root $root -Stage $stage
        Assert-True ((Get-Content -LiteralPath (Join-Path $app 'BrandGame.exe') -Raw).Trim() -eq 'new-version') 'The new executable was not installed.'
        Assert-True (-not (Test-Path -LiteralPath (Join-Path $app 'obsolete.txt'))) 'An obsolete file survived replacement.'
        Assert-True (-not (Test-Path -LiteralPath $stage)) 'The installed stage was not consumed.'
        $backups = @(Get-ChildItem -LiteralPath (Join-Path $root 'artifacts/backups') -Directory)
        Assert-True ($backups.Count -eq 1) 'Expected one previous-version backup.'
        Assert-True ((Get-Content -LiteralPath (Join-Path $backups[0].FullName 'BrandGame.exe') -Raw).Trim() -eq 'old-version') 'The previous executable was not retained.'
        Assert-True (Test-Path -LiteralPath (Join-Path $backups[0].FullName 'obsolete.txt')) 'The previous-version backup is incomplete.'
    }

    Test-Case 'Incomplete publication leaves the installed application intact' {
        $root = New-TestWorkspace
        $app = New-TestPayload -Path (Join-Path $root 'app') -Marker 'keep-me'
        $stage = New-TestPayload -Path (New-TestStagePath -Root $root)
        Remove-Item -LiteralPath (Join-Path $stage 'web/js/main.js')
        $before = (Get-FileHash -LiteralPath (Join-Path $app 'BrandGame.exe')).Hash
        Assert-Throws { Install-StagedApp -Root $root -Stage $stage } 'An incomplete stage was installed.'
        Assert-True ((Get-FileHash -LiteralPath (Join-Path $app 'BrandGame.exe')).Hash -eq $before) 'The installed executable changed after validation failure.'
        Assert-True (Test-Path -LiteralPath (Join-Path $app 'web/js/main.js')) 'Installed web assets were lost after failure.'
    }

    Test-Case 'Deployment rejects staging outside artifacts/staging' {
        $root = New-TestWorkspace
        $app = New-TestPayload -Path (Join-Path $root 'app') -Marker 'keep-me'
        $stage = New-TestPayload -Path (Join-Path $root 'other-stage')
        Assert-Throws { Install-StagedApp -Root $root -Stage $stage } 'Stage outside artifacts/staging was accepted.'
        Assert-True ((Get-Content -LiteralPath (Join-Path $app 'BrandGame.exe') -Raw).Trim() -eq 'keep-me') 'Invalid staging changed the installed app.'
        $invalidName = New-TestPayload -Path (Join-Path $root 'artifacts/staging/noncanonical')
        Assert-Throws { Install-StagedApp -Root $root -Stage $invalidName } 'A stage name incompatible with journal recovery was accepted.'
        $nested = New-TestPayload -Path (Join-Path $root ('artifacts/staging/nested/app-' + [Guid]::NewGuid().ToString('N')))
        Assert-Throws { Install-StagedApp -Root $root -Stage $nested } 'A nested stage incompatible with journal recovery was accepted.'
    }

    Test-Case 'A deployment move error leaves the existing destination intact' {
        $root = New-TestWorkspace
        $appPath = Join-Path $root 'app'
        Set-Content -LiteralPath $appPath -Value 'existing-file-do-not-delete' -Encoding UTF8
        $stage = New-TestPayload -Path (New-TestStagePath -Root $root)
        Assert-Throws { Install-StagedApp -Root $root -Stage $stage } 'Unexpectedly installed over a non-directory app path.'
        Assert-True ((Get-Content -LiteralPath $appPath -Raw).Trim() -eq 'existing-file-do-not-delete') 'The existing destination was lost.'
        Assert-True (Test-Path -LiteralPath (Join-Path $stage 'BrandGame.exe')) 'The valid staged payload was lost.'
    }

    Test-Case 'A locked stage rolls back after moving the previous application' {
        if (-not ('BrandGameUpdaterTest.NativeDirectoryLock' -as [type])) {
            Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
namespace BrandGameUpdaterTest {
    public static class NativeDirectoryLock {
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        public static extern SafeFileHandle CreateFile(string path, uint access, uint share,
            IntPtr security, uint creation, uint flags, IntPtr template);
    }
}
'@
        }
        $root = New-TestWorkspace
        $app = New-TestPayload -Path (Join-Path $root 'app') -Marker 'rollback-original'
        $stage = New-TestPayload -Path (Join-Path $root ('artifacts/staging/app-' + [Guid]::NewGuid().ToString('N'))) -Marker 'locked-new'
        # Open the directory without FILE_SHARE_DELETE to force its rename to fail.
        $handle = [BrandGameUpdaterTest.NativeDirectoryLock]::CreateFile($stage, [uint32]2147483648, 1, [IntPtr]::Zero, 3, 0x02000000, [IntPtr]::Zero)
        try {
            Assert-True (-not $handle.IsInvalid) 'Unable to create the filesystem lock used by this test.'
            Assert-Throws { Install-StagedApp -Root $root -Stage $stage } 'A locked stage unexpectedly replaced the application.'
            Assert-True ((Get-Content -LiteralPath (Join-Path $app 'BrandGame.exe') -Raw).Trim() -eq 'rollback-original') 'The previous app was not restored after the failed second move.'
            Assert-True (Test-Path -LiteralPath (Join-Path $app 'web/js/main.js')) 'Rollback lost the previous web assets.'
            Assert-True (Test-Path -LiteralPath (Join-Path $stage 'BrandGame.exe')) 'The failed stage was lost.'
            Assert-True (-not (Test-Path -LiteralPath (Join-Path $root 'artifacts/pending-update.json'))) 'A successful rollback left a pending journal.'
        } finally { $handle.Dispose() }
    }

    Test-Case 'Interrupted replacement restores the previous version from its journal' {
        $root = New-TestWorkspace
        $stageName = 'app-' + [Guid]::NewGuid().ToString('N')
        $backupName = 'app-' + [Guid]::NewGuid().ToString('N')
        $backup = New-TestPayload -Path (Join-Path $root ('artifacts/backups/' + $backupName)) -Marker 'restore-previous'
        $stage = New-TestPayload -Path (Join-Path $root ('artifacts/staging/' + $stageName)) -Marker 'unfinished-new'
        New-PendingJournal -Root $root -StageName $stageName -BackupName $backupName -HadApp $true
        Recover-PendingDeployment -Root $root
        Assert-True ((Get-Content -LiteralPath (Join-Path $root 'app/BrandGame.exe') -Raw).Trim() -eq 'restore-previous') 'Recovery failed to restore the previous executable.'
        Assert-True (Test-Path -LiteralPath (Join-Path $root 'app/web/js/main.js')) 'Recovery lost previous web assets.'
        Assert-True (-not (Test-Path -LiteralPath (Join-Path $root 'artifacts/pending-update.json'))) 'The handled journal was retained.'
    }

    Test-Case 'Interrupted first installation promotes its validated stage' {
        $root = New-TestWorkspace
        $stageName = 'app-' + [Guid]::NewGuid().ToString('N')
        $backupName = 'app-' + [Guid]::NewGuid().ToString('N')
        $stage = New-TestPayload -Path (Join-Path $root ('artifacts/staging/' + $stageName)) -Marker 'first-install'
        New-PendingJournal -Root $root -StageName $stageName -BackupName $backupName -HadApp $false
        Recover-PendingDeployment -Root $root
        Assert-True ((Get-Content -LiteralPath (Join-Path $root 'app/BrandGame.exe') -Raw).Trim() -eq 'first-install') 'The interrupted first install was not recovered.'
        Assert-True (-not (Test-Path -LiteralPath $stage)) 'Recovery did not consume the staged app.'
        Assert-True (-not (Test-Path -LiteralPath (Join-Path $root 'artifacts/pending-update.json'))) 'The handled first-install journal was retained.'
    }

    Test-Case 'Recovery accepts an already completed swap without losing its backup' {
        $root = New-TestWorkspace
        $stageName = 'app-' + [Guid]::NewGuid().ToString('N')
        $backupName = 'app-' + [Guid]::NewGuid().ToString('N')
        $app = New-TestPayload -Path (Join-Path $root 'app') -Marker 'completed-new'
        $backup = New-TestPayload -Path (Join-Path $root ('artifacts/backups/' + $backupName)) -Marker 'previous-backup'
        New-PendingJournal -Root $root -StageName $stageName -BackupName $backupName -HadApp $true
        Recover-PendingDeployment -Root $root
        Assert-True ((Get-Content -LiteralPath (Join-Path $app 'BrandGame.exe') -Raw).Trim() -eq 'completed-new') 'Recovery overwrote an already installed app.'
        Assert-True ((Get-Content -LiteralPath (Join-Path $backup 'BrandGame.exe') -Raw).Trim() -eq 'previous-backup') 'Recovery lost the retained previous version.'
        Assert-True (-not (Test-Path -LiteralPath (Join-Path $root 'artifacts/pending-update.json'))) 'The completed journal was retained.'
    }

    Test-Case 'Recovery rejects path traversal in journals without changing the app' {
        $root = New-TestWorkspace
        $app = New-TestPayload -Path (Join-Path $root 'app') -Marker 'preserve-installed'
        New-PendingJournal -Root $root -StageName '../../app' -BackupName ('app-' + [Guid]::NewGuid().ToString('N')) -HadApp $true
        Assert-Throws { Recover-PendingDeployment -Root $root } 'A journal with path traversal was accepted.'
        Assert-True ((Get-Content -LiteralPath (Join-Path $app 'BrandGame.exe') -Raw).Trim() -eq 'preserve-installed') 'A malformed journal changed the installed app.'
        Assert-True (Test-Path -LiteralPath (Join-Path $root 'artifacts/pending-update.json')) 'The rejected journal should remain available for diagnosis.'
    }

    Test-Case 'Recovery refuses an invalid first-install payload' {
        $root = New-TestWorkspace
        $stageName = 'app-' + [Guid]::NewGuid().ToString('N')
        $backupName = 'app-' + [Guid]::NewGuid().ToString('N')
        $stage = New-TestPayload -Path (Join-Path $root ('artifacts/staging/' + $stageName))
        Remove-Item -LiteralPath (Join-Path $stage 'web/js/main.js')
        New-PendingJournal -Root $root -StageName $stageName -BackupName $backupName -HadApp $false
        Assert-Throws { Recover-PendingDeployment -Root $root } 'Recovery installed an invalid payload.'
        Assert-True (-not (Test-Path -LiteralPath (Join-Path $root 'app'))) 'Invalid payload became the installed app.'
        Assert-True (Test-Path -LiteralPath (Join-Path $root 'artifacts/pending-update.json')) 'Failed recovery should retain its journal.'
    }

    Test-Case 'Source fingerprints detect additions, edits and deletions while ignoring build output' {
        $root = New-TestWorkspace
        $initial = Get-SourceFingerprint -Root $root
        $source = Join-Path $root 'src/web/index.html'
        Set-Content -LiteralPath $source -Value 'first' -Encoding UTF8
        $added = Get-SourceFingerprint -Root $root
        Assert-True ($added -ne $initial) 'Adding source did not change the fingerprint.'
        Set-Content -LiteralPath $source -Value 'changed' -Encoding UTF8
        $edited = Get-SourceFingerprint -Root $root
        Assert-True ($edited -ne $added) 'Editing source did not change the fingerprint.'
        [IO.Directory]::CreateDirectory((Join-Path $root 'src/csharp/obj')) | Out-Null
        Set-Content -LiteralPath (Join-Path $root 'src/csharp/obj/generated.cs') -Value 'ignored' -Encoding UTF8
        Assert-True ((Get-SourceFingerprint -Root $root) -eq $edited) 'Build output changed the source fingerprint.'
        Remove-Item -LiteralPath $source
        Assert-True ((Get-SourceFingerprint -Root $root) -eq $initial) 'Deleting source did not restore the fingerprint.'
    }
} finally {
    # Resolve and validate immediately before recursive deletion, within this repository only.
    $checkedFixture = Get-WorkspacePath -Root $repositoryRoot -RelativePath ('artifacts/' + [IO.Path]::GetFileName($fixtureRoot))
    if ($checkedFixture -ne $fixtureRoot) { throw 'Refusing to clean an unexpected fixture path.' }
    if (Test-Path -LiteralPath $checkedFixture) { Remove-Item -LiteralPath $checkedFixture -Recurse -Force }
}

Write-Host "Updater tests: $script:passed passed; $script:failed failed."
if ($script:failed -gt 0) { exit 1 }
exit 0
