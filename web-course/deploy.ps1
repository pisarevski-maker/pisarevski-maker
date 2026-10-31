param(
    [Parameter(Mandatory = $true)]
    [string]$WorkerName
)

# Publish the site and its feedback handler to the existing Worker.
Push-Location $PSScriptRoot
try {
    & npx --yes wrangler@4.156.0 deploy --config ./wrangler.jsonc --name $WorkerName
    if ($LASTEXITCODE -ne 0) { throw 'Cloudflare deployment did not complete successfully.' }
}
finally {
    Pop-Location
}
