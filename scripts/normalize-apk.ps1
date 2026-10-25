param([Parameter(Mandatory=$true)][string]$InputApk,[Parameter(Mandatory=$true)][string]$OutputApk)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$sourceArchive = [IO.Compression.ZipFile]::OpenRead([IO.Path]::GetFullPath($InputApk))
$targetStream = [IO.File]::Open([IO.Path]::GetFullPath($OutputApk),[IO.FileMode]::Create)
$targetArchive = New-Object IO.Compression.ZipArchive($targetStream,[IO.Compression.ZipArchiveMode]::Create,$false)
try {
    $entryNames = New-Object 'System.Collections.Generic.HashSet[string]'
    foreach ($sourceEntry in $sourceArchive.Entries) {
        $entryName = $sourceEntry.FullName.Replace('\','/')
        if (-not $entryNames.Add($entryName)) { throw "Duplicate APK entry after normalization: $entryName" }
        $compression = if ($entryName -eq 'resources.arsc') { [IO.Compression.CompressionLevel]::NoCompression } else { [IO.Compression.CompressionLevel]::Optimal }
        $targetEntry = $targetArchive.CreateEntry($entryName,$compression)
        $readStream = $sourceEntry.Open()
        $writeStream = $targetEntry.Open()
        try { $readStream.CopyTo($writeStream) } finally { $writeStream.Dispose(); $readStream.Dispose() }
    }
    foreach ($asset in @('index.html','startup.js','app.js','core.js','games.js','marriage.js','dahar.js','faras.js','style.css','table.js','table.css','i18n.js','online.js','gestures.js','court.js','court-detailed.js','room-service.js','hand-sort.js','club.css')) {
        if (-not $entryNames.Contains("assets/public/$asset")) { throw "Required app asset is missing: $asset" }
    }
} finally { $targetArchive.Dispose(); $targetStream.Dispose(); $sourceArchive.Dispose() }
Write-Output 'APK paths normalized; required startup assets verified.'


