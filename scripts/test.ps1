$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Push-Location $projectRoot
try {
    & node scripts/build-web.cjs --check
    if ($LASTEXITCODE -ne 0) { throw 'Os recursos web precisam de npm run build:web.' }
    $webTests = @(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'tests') -Filter 'web*.test.js' -File | ForEach-Object { $_.FullName })
    if ($webTests.Count -eq 0) { throw 'Nao foram encontrados os testes web.' }
    & node --test @webTests
    if ($LASTEXITCODE -ne 0) { throw 'Falharam os testes web.' }
    & dotnet run --project tests/native/BrandGame.NativeTests.csproj -c Release
    if ($LASTEXITCODE -ne 0) { throw 'Falharam os testes nativos.' }
    & powershell -NoProfile -ExecutionPolicy Bypass -File tests/updater.Tests.ps1
    if ($LASTEXITCODE -ne 0) { throw 'Falharam os testes do atualizador.' }
    & powershell -NoProfile -ExecutionPolicy Bypass -File tests/signing.Tests.ps1
    if ($LASTEXITCODE -ne 0) { throw 'Falharam os testes de assinatura.' }
    Write-Host 'Todos os testes passaram.'
} finally { Pop-Location }
