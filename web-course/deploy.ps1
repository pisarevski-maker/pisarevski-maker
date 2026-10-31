param(
    [Parameter(Mandatory = $true)]
    [string]$WorkerName
)

# Publish static files to the existing Worker selected by the user.
Push-Location $PSScriptRoot
try {
    & npx --yes wrangler@latest deploy --assets ./public --name $WorkerName --compatibility-date 2026-10-30
    if ($LASTEXITCODE -ne 0) { throw 'Cloudflare deployment did not complete successfully.' }
}
finally {
    Pop-Location
}
