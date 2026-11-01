[CmdletBinding()]
param([switch]$Integration)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot '../scripts/lib/Signing.ps1')
. (Join-Path $PSScriptRoot '../scripts/lib/Deployment.ps1')
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$fixture = Get-WorkspacePath -Root $root -RelativePath ('artifacts/test-signing-' + [Guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($fixture) | Out-Null
function Assert-Rejected([scriptblock]$Operation) {
    $rejected = $false
    try { & $Operation | Out-Null } catch { $rejected = $true }
    if (-not $rejected) { throw 'A operacao invalida foi aceite.' }
}
try {
    if ((ConvertTo-SigningThumbprint ('ab ' * 20)) -cne ('AB' * 20)) { throw 'Normalizacao incorreta.' }
    Assert-Rejected { ConvertTo-SigningThumbprint 'invalid' }
    Write-Host 'PASS signing thumbprint validation'
    $unsigned = Join-Path $fixture 'unsigned.exe'
    [IO.File]::WriteAllText($unsigned, 'unsigned fixture')
    Assert-Rejected { Assert-SignedBinary -Path $unsigned }
    Write-Host 'PASS unsigned files rejected'
    Assert-Rejected { Invoke-BinarySigning -Path $unsigned -Identity $null -TimestampServer 'file:///tmp' }
    Write-Host 'PASS invalid timestamp endpoint rejected'
    if ($Integration) {
        $identity = Get-BrandGameSigningIdentity
        $binary = Join-Path $root 'update.exe'
        $null = Assert-SignedBinary -Path $binary -ExpectedThumbprint $identity.Certificate.Thumbprint
        Assert-Rejected { Assert-SignedBinary -Path $binary -ExpectedThumbprint ('00' * 20) }
        Write-Host 'PASS final signature and expected publisher verified'
        $altered = Join-Path $fixture 'altered.exe'
        Copy-Item -LiteralPath $binary -Destination $altered
        $stream = [IO.File]::Open($altered, [IO.FileMode]::Open, [IO.FileAccess]::ReadWrite)
        try { $stream.Position = 1024; $original = $stream.ReadByte(); $stream.Position = 1024; $stream.WriteByte($original -bxor 1) }
        finally { $stream.Dispose() }
        Assert-Rejected { Assert-SignedBinary -Path $altered -ExpectedThumbprint $identity.Certificate.Thumbprint }
        Write-Host 'PASS tampered executable rejected'
    }
} finally {
    $checked = Get-WorkspacePath -Root $root -RelativePath ('artifacts/' + [IO.Path]::GetFileName($fixture))
    Remove-Item -LiteralPath $checked -Recurse -Force
}
