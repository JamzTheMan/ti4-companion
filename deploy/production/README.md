# Portainer deployment

This stack serves the app through an existing Traefik `proxy` network and
`proxy-secured` entrypoint. The browser uses the same origin for the API,
SignalR hub, and protected map-image URLs. PostgreSQL and Azurite have no
published host ports; Azurite is routed only through Traefik's Basic Auth
middleware so browsers can load session maps.

## Keep deployment details local

Copy `deploy.local.example.ps1` to `deploy.local.ps1` and set your SSH host,
public domain, and private secrets directory in that local file. The local file
is ignored by Git. Do not force-add it or place credentials in the example
template.

```powershell
Copy-Item .\deploy\production\deploy.local.example.ps1 .\deploy\production\deploy.local.ps1
```

Use the `TI4_PUBLIC_DOMAIN` and `TI4_SECRETS_DIR` values from that file for the
matching Portainer stack environment variables. Set `TRAEFIK_BASIC_AUTH_USERS`
in Portainer as described below; keep it out of repository files.

## Prepare secrets on the Docker host

Create the private directory configured as `TI4_SECRETS_DIR` in your local
deployment file, then generate a PostgreSQL password and Azurite key:

```sh
sudo mkdir -p /path/to/private/docker/secrets
sudo chown "$USER":"$USER" /path/to/private/docker/secrets
chmod 700 /path/to/private/docker/secrets
cd /path/to/private/docker/secrets
umask 077
openssl rand -hex 32 > postgres_password
openssl rand -base64 32 > azurite_key
```

Create the connection string with the same key:

```sh
key="$(cat /path/to/private/docker/secrets/azurite_key)"
printf 'DefaultEndpointsProtocol=http;AccountName=ti4blob;AccountKey=%s;BlobEndpoint=http://storage:10000/ti4blob;' "$key" \
  > /path/to/private/docker/secrets/blob_storage_connection
chmod 600 /path/to/private/docker/secrets/*
```

In Portainer, deploy a stack from this repository and set its Compose path to
`deploy/production/docker-compose.yml`. Set `SECRETS_DIR` to the same private
secrets directory used in the local deployment file and `TI4_PUBLIC_DOMAIN` to
the public host name for this deployment.

Generate a shared Basic Auth credential for your group, escaping dollar signs
for Compose interpolation:

```sh
htpasswd -nbB 'your-username' 'your-long-password' | sed 's/\$/$$/g'
```

Set that output as `TRAEFIK_BASIC_AUTH_USERS` in Portainer. The doubled dollar
signs are required in the Portainer value so the resulting container label
contains the original bcrypt hash. A Portainer warning that a hash fragment is
an unset variable means the value was not escaped; correct it and redeploy.
The same auth middleware protects the website, API, and SignalR hub.

The frontend and API images are built locally and transferred to the Docker
host; the stack uses the local `ti4-companion-client:production` and
`ti4-companion-server:production` images without pulling or building them.
Ensure the `proxy` Docker network exists and Traefik has a TLS certificate
configured for the public host name on its `proxy-secured` entrypoint.
The storage router disables forwarding the public `Host` header because
Azurite needs the upstream storage host to resolve its path-style account URLs.

## Build and deploy from Windows

Run this from the repository root in PowerShell on a machine with Docker Desktop
and OpenSSH installed. Configure `TI4_SSH_HOST` in your local deployment file;
SSH key-based login to that host must work without an interactive password
prompt:

```powershell
.\deploy\production\deploy.ps1
```

The script builds both images for `linux/amd64`, transfers them to the server,
and loads them into Docker. For the first deployment, create/deploy the stack
in Portainer after the images are loaded. To make future runs trigger a
redeployment automatically, enable a webhook for the Git-based stack in
Portainer and set its URL in the local PowerShell environment (do not commit
the URL):

```powershell
$env:TI4_DEPLOY_WEBHOOK_URL = "https://portainer.example/api/stacks/webhooks/..."
.\deploy\production\deploy.ps1
```

Set the actual webhook URL only in the ignored local deployment file or the
current PowerShell environment. The deployment script can also be given a
different SSH target with `-SshHost`. After enabling the webhook, rerun the script for subsequent
deployments; it loads the newly built images before asking Portainer to
redeploy. Keep the webhook URL private because it grants permission to trigger
the stack deployment.

If the stack already exists from a failed deployment, run the script once
without setting the webhook URL, then redeploy the stack from Portainer. For a
new stack, create/configure it in Portainer but wait to deploy until after the
images have been loaded.

## Troubleshooting a failed deployment

If the frontend build repeatedly prints `There appears to be trouble with your
network connection` during `yarn install`, check outbound DNS, HTTPS access,
and any proxy or firewall rules on the machine running the build. With the
local-build workflow above, the build runs on your workstation rather than the
Docker host. Test package download access from a container with:

```sh
docker run --rm node:16.20.2-alpine \
  yarn info react-scripts version
```

If that command also times out or fails to resolve the registry, fix the
host's/Docker's network access and redeploy. If it succeeds, inspect the full
Portainer deployment log for the first `error` line after the retries; the
retries alone do not show whether the build ultimately failed.

PostgreSQL and Azurite use named Docker volumes (`postgres_data` and
`blob_data`). Back up both volumes along with the three secret files; restoring
the database without its blob volume can leave map images unavailable.

The API image currently targets .NET 6, which is out of support. This stack is
for a restricted friend-group deployment, not an Internet-facing public
service; plan a .NET runtime and dependency upgrade before expanding access.
