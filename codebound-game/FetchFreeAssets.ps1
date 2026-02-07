# FetchFreeAssets.ps1 - Run from codebound-game folder: .\FetchFreeAssets.ps1
# Creates folders for free assets (OpenGameArt, GitHub, Kenney, itch, Bfxr).
# Optional: clone a GitHub asset repo. OpenGameArt/Kenney/itch: download manually (see ASSET_SOURCES.md).

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$assets = Join-Path $root "Assets"
$sprites = Join-Path $assets "Sprites"
$audio = Join-Path $assets "Audio"

$folders = @(
    (Join-Path $sprites "Imported"),
    (Join-Path $sprites "Imported\OpenGameArt"),
    (Join-Path $sprites "Imported\GitHub"),
    (Join-Path $sprites "Imported\Kenney"),
    (Join-Path $sprites "Imported\Itch"),
    (Join-Path $audio "SFX"),
    (Join-Path $audio "Music")
)

foreach ($dir in $folders) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created: $dir"
    } else {
        Write-Host "Exists:  $dir"
    }
}

# Optional: clone a free asset repo (uncomment if you have git and want LPC assets)
# $cloneTarget = Join-Path $sprites "Imported\GitHub\LiberatedPixelCup"
# if (-not (Test-Path $cloneTarget)) {
#     Write-Host "Cloning LiberatedPixelCup..."
#     git clone --depth 1 "https://github.com/OpenGameArt/LiberatedPixelCup.git" $cloneTarget
#     Write-Host "Cloned into: $cloneTarget"
# }

Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Open ASSET_SOURCES.md"
Write-Host "  2. Download from OpenGameArt / Kenney / itch into the Imported folders above"
Write-Host "  3. Use Bfxr (bfxr.net) -> Export WAV -> save to Assets/Audio/SFX"
