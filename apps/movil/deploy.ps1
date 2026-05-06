$env:EXPO_TOKEN = "K4P1gXD3q384-N91sXDSSZYblI4JFK8Nm4k33pm2"
$env:NODE_OPTIONS = "--max-old-space-size=8192"
$env:CI = "1"
$env:MAX_WORKERS = "1"
$env:Path += ";C:\Program Files\nodejs"

Write-Host "=> Ejecutando EAS Update para Android con pnpm..."
npx.cmd eas-cli update --auto --platform android --clear-cache

Write-Host "=> Ejecutando EAS Update para iOS con pnpm..."
npx.cmd eas-cli update --auto --platform ios --clear-cache
