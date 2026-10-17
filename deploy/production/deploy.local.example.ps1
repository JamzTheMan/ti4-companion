# Copy this file to deploy.local.ps1 and replace the placeholders.
# deploy.local.ps1 is ignored by Git; do not force-add it.
$env:TI4_SSH_HOST = "replace-with-your-ssh-host"
$env:TI4_PUBLIC_DOMAIN = "replace-with-your-public-domain"
$env:TI4_SECRETS_DIR = "/path/to/private/docker/secrets"
$env:TI4_DEPLOY_WEBHOOK_URL = ""
