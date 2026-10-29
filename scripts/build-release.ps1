param(
    [Parameter(Mandatory=$true)][string]$JdkPath,
    [Parameter(Mandatory=$true)][string]$SdkPath,
    [Parameter(Mandatory=$true)][string]$GradlePath,
    [Parameter(Mandatory=$true)][string]$SigningDirectory
)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$signingRoot = [IO.Path]::GetFullPath($SigningDirectory)
if ($signingRoot.Equals($root, [StringComparison]::OrdinalIgnoreCase) -or $signingRoot.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Keep signing material outside the source checkout.' }
$keyPath = Join-Path $SigningDirectory 'dashain-upload.jks'
$passwordPath = Join-Path $SigningDirectory 'upload-password.txt'
if (-not (Test-Path -LiteralPath $keyPath) -or -not (Test-Path -LiteralPath $passwordPath)) { throw 'Provide an existing protected upload key and password file outside Git.' }
$env:JAVA_HOME = $JdkPath
$env:ANDROID_HOME = $SdkPath
$env:ANDROID_SDK_ROOT = $SdkPath
$env:DASHAIN_UPLOAD_KEYSTORE = $keyPath
$env:DASHAIN_UPLOAD_KEY_ALIAS = 'dashain-upload'
$env:DASHAIN_UPLOAD_STORE_PASSWORD = [IO.File]::ReadAllText($passwordPath).Trim()
$env:DASHAIN_UPLOAD_KEY_PASSWORD = $env:DASHAIN_UPLOAD_STORE_PASSWORD
Push-Location $root
try {
    & node scripts/build.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Asset build failed.' }
    & $GradlePath -p android --no-daemon --console=plain :app:lintRelease :app:bundleRelease :app:assembleRelease
    if ($LASTEXITCODE -ne 0) { throw 'Release build failed.' }
    New-Item -ItemType Directory -Path release -Force | Out-Null
    Copy-Item -LiteralPath android/app/build/outputs/bundle/release/app-release.aab -Destination release/DashainCards-release.aab -Force
    Copy-Item -LiteralPath android/app/build/outputs/apk/release/app-release.apk -Destination release/DashainCards-release.apk -Force
    & (Join-Path $JdkPath 'bin/jarsigner.exe') -verify release/DashainCards-release.aab
    if ($LASTEXITCODE -ne 0) { throw 'Bundle signature verification failed.' }
    & (Join-Path $SdkPath 'build-tools/36.0.0/apksigner.bat') verify release/DashainCards-release.apk
    if ($LASTEXITCODE -ne 0) { throw 'Release APK signature verification failed.' }
    Write-Output 'Signed release AAB and APK are in release/. Keep the upload key and its password outside Git.'
} finally {
    Remove-Item Env:DASHAIN_UPLOAD_STORE_PASSWORD,Env:DASHAIN_UPLOAD_KEY_PASSWORD,Env:DASHAIN_UPLOAD_KEYSTORE,Env:DASHAIN_UPLOAD_KEY_ALIAS -ErrorAction SilentlyContinue
    Pop-Location
}
