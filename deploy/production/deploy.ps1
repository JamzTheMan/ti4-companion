param(
    [string]$SshHost,
    [string]$DeployWebhookUrl
)

$ErrorActionPreference = "Stop"

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Command failed with exit code $LASTEXITCODE."
    }
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$localConfigPath = Join-Path $PSScriptRoot "deploy.local.ps1"
if (Test-Path $localConfigPath) {
    . $localConfigPath
}

if (-not $SshHost) {
    $SshHost = $env:TI4_SSH_HOST
}
if (-not $DeployWebhookUrl) {
    $DeployWebhookUrl = $env:TI4_DEPLOY_WEBHOOK_URL
}
if (-not $SshHost) {
    throw "Set TI4_SSH_HOST in deploy/production/deploy.local.ps1 or pass -SshHost."
}

$clientImage = "ti4-companion-client:production"
$serverImage = "ti4-companion-server:production"
$archiveName = "ti4-companion-$([guid]::NewGuid().ToString('N')).tar"
$remoteArchive = "/tmp/$archiveName"
$localArchive = Join-Path $env:TEMP $archiveName
$sshOptions = @("-o", "BatchMode=yes", "-o", "ConnectTimeout=15")
$remoteArchiveUploaded = $false

Push-Location $repositoryRoot
try {
    Write-Host "Building frontend image for linux/amd64..."
    Invoke-CheckedCommand docker @(
        "build", "--platform", "linux/amd64",
        "--tag", $clientImage,
        "--file", (Join-Path $repositoryRoot "client\Dockerfile.production"),
        (Join-Path $repositoryRoot "client")
    )

    Write-Host "Building API image for linux/amd64..."
    Invoke-CheckedCommand docker @(
        "build", "--platform", "linux/amd64",
        "--tag", $serverImage,
        "--file", (Join-Path $repositoryRoot "server\Dockerfile"),
        (Join-Path $repositoryRoot "server")
    )

    Write-Host "Saving images..."
    Invoke-CheckedCommand docker @(
        "save", "--output", $localArchive, $clientImage, $serverImage
    )

    Write-Host "Copying images to $SshHost..."
    Invoke-CheckedCommand scp ($sshOptions + @(
        $localArchive, "${SshHost}:$remoteArchive"
    ))
    $remoteArchiveUploaded = $true

    Write-Host "Loading images on $SshHost..."
    Invoke-CheckedCommand ssh ($sshOptions + @(
        $SshHost, "docker load --input $remoteArchive"
    ))
    Invoke-CheckedCommand ssh ($sshOptions + @(
        $SshHost, "rm -f $remoteArchive"
    ))
    $remoteArchiveUploaded = $false

    if ($DeployWebhookUrl) {
        Write-Host "Triggering Portainer stack redeployment..."
        $response = Invoke-WebRequest -Uri $DeployWebhookUrl -Method Post
        if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 300) {
            throw "Portainer webhook returned HTTP $($response.StatusCode)."
        }
        Write-Host "Portainer accepted the redeployment request."
    }
    else {
        Write-Host "Images are loaded. Redeploy the stack in Portainer to use them."
        Write-Host "Set TI4_DEPLOY_WEBHOOK_URL to automate redeployment on future runs."
    }
}
finally {
    Pop-Location
    if (Test-Path $localArchive) {
        Remove-Item -LiteralPath $localArchive -Force
    }
    if ($remoteArchiveUploaded) {
        & ssh @sshOptions $SshHost "rm -f $remoteArchive"
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Could not remove temporary image archive $remoteArchive from $SshHost."
        }
    }
}
