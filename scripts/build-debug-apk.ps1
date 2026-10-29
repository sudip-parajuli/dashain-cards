param([Parameter(Mandatory=$true)][string]$JdkPath,[Parameter(Mandatory=$true)][string]$SdkPath,[string]$BuildDir)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
if (-not $BuildDir) { $BuildDir = Join-Path $projectRoot 'work\apk-build' }
$BuildDir = [IO.Path]::GetFullPath($BuildDir)
$toolsPath = Join-Path $SdkPath 'build-tools\35.0.0'
$androidJar = Join-Path $SdkPath 'platforms\android-35\android.jar'
$env:JAVA_HOME = $JdkPath
$env:PATH = (Join-Path $JdkPath 'bin') + ';' + $env:PATH
function Run-Tool { param([string]$Path,[string[]]$ToolArgs) & $Path @ToolArgs; if ($LASTEXITCODE -ne 0) { throw "Build tool failed: $Path (exit $LASTEXITCODE)" } }
New-Item -ItemType Directory -Path $BuildDir,(Join-Path $BuildDir 'classes'),(Join-Path $BuildDir 'dex') -Force | Out-Null
Push-Location $projectRoot
try {
    Run-Tool 'node' @('scripts/build.mjs')
    $manifest = Get-Content 'android\app\src\main\AndroidManifest.xml' -Raw
    $manifest = $manifest.Replace('<manifest xmlns:android=', '<manifest package="com.dashaincards.app" android:versionCode="35" android:versionName="1.7.2" xmlns:android=')
    $manifest = $manifest.Replace('<application ', '<uses-sdk android:minSdkVersion="26" android:targetSdkVersion="36"/><application android:debuggable="true" ')
    $manifest = $manifest.Replace('android:usesCleartextTraffic="false"', 'android:usesCleartextTraffic="true"')
    $manifestPath = Join-Path $BuildDir 'AndroidManifest.xml'
    Set-Content -LiteralPath $manifestPath -Value $manifest -Encoding utf8
    Run-Tool (Join-Path $toolsPath 'aapt2.exe') @('compile','--dir','android\app\src\main\res','-o',(Join-Path $BuildDir 'resources.zip'))
    Run-Tool (Join-Path $toolsPath 'aapt2.exe') @('link','-o',(Join-Path $BuildDir 'unsigned.apk'),'--manifest',$manifestPath,'-I',$androidJar,'-A','android\app\src\main\assets',(Join-Path $BuildDir 'resources.zip'))
    Run-Tool (Join-Path $JdkPath 'bin\javac.exe') @('--release','8','-classpath',$androidJar,'-d',(Join-Path $BuildDir 'classes'),'android\app\src\main\java\com\dashaincards\app\MainActivity.java')
    $classFiles = @(Get-ChildItem (Join-Path $BuildDir 'classes') -Filter '*.class' -Recurse | ForEach-Object FullName)
    Run-Tool (Join-Path $toolsPath 'd8.bat') (@('--lib',$androidJar,'--min-api','26','--output',(Join-Path $BuildDir 'dex')) + $classFiles)
    Run-Tool (Join-Path $JdkPath 'bin\jar.exe') @('uf',(Join-Path $BuildDir 'unsigned.apk'),'-C',(Join-Path $BuildDir 'dex'),'classes.dex')
    & (Join-Path $PSScriptRoot 'normalize-apk.ps1') -InputApk (Join-Path $BuildDir 'unsigned.apk') -OutputApk (Join-Path $BuildDir 'normalized.apk')
    Run-Tool (Join-Path $toolsPath 'zipalign.exe') @('-f','-p','4',(Join-Path $BuildDir 'normalized.apk'),(Join-Path $BuildDir 'aligned.apk'))
    $keyPath = Join-Path $BuildDir 'debug.keystore'
    if (-not (Test-Path $keyPath)) { Run-Tool (Join-Path $JdkPath 'bin\keytool.exe') @('-genkeypair','-keystore',$keyPath,'-storepass','android','-keypass','android','-alias','androiddebugkey','-dname','CN=Android Debug,O=Android,C=US','-keyalg','RSA','-validity','10000') }
    $apkPath = Join-Path $projectRoot 'release\DashainCards-debug.apk'
    Run-Tool (Join-Path $toolsPath 'apksigner.bat') @('sign','--ks',$keyPath,'--ks-pass','pass:android','--key-pass','pass:android','--out',$apkPath,(Join-Path $BuildDir 'aligned.apk'))
    Run-Tool (Join-Path $toolsPath 'apksigner.bat') @('verify','--verbose',$apkPath)
    Write-Output "Test APK: $apkPath"
} finally { Pop-Location }






