param([string]$ApkPath = (Join-Path $PSScriptRoot '..\release\DashainCards-debug.apk'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead([IO.Path]::GetFullPath($ApkPath))
try {
    foreach ($entry in $archive.Entries) { if ($entry.FullName.Contains('\')) { throw "Android cannot resolve Windows APK entry: $($entry.FullName)" } }
    $webRoot = Join-Path $PSScriptRoot '..\web'
    foreach ($file in (Get-ChildItem -LiteralPath $webRoot -File)) {
        $entry = $archive.GetEntry('assets/public/' + $file.Name)
        if (-not $entry -or $entry.Length -eq 0) { throw "Missing or empty bundled asset: $($file.Name)" }
        $stream = $entry.Open()
        $hash = [Security.Cryptography.SHA256]::Create()
        try { $apkHash = [BitConverter]::ToString($hash.ComputeHash($stream)).Replace('-','') } finally { $stream.Dispose(); $hash.Dispose() }
        if ($apkHash -ne (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash) { throw "Stale bundled asset: $($file.Name)" }
    }
    Write-Output 'APK asset paths, startup files, and exact source hashes passed.'
} finally { $archive.Dispose() }
