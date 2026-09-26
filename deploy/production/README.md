# Portainer deployment

This stack serves the app at `https://ti4.nerps.net` through the existing Traefik
`proxy` network and `proxy` entrypoint. The browser uses the same origin for the
API, SignalR hub, and protected map-image URLs. PostgreSQL and Azurite have no
published host ports; Azurite is routed only through Traefik's Basic Auth
middleware so browsers can load session maps.

## Prepare secrets on the Docker host

Create a private directory and generate a PostgreSQL password and Azurite key:

```sh
sudo mkdir -p /home/jamz/docker/ti4-companion/secrets
sudo chown jamz:jamz /home/jamz/docker/ti4-companion/secrets
chmod 700 /home/jamz/docker/ti4-companion/secrets
cd /home/jamz/docker/ti4-companion/secrets
umask 077
openssl rand -hex 32 > postgres_password
openssl rand -base64 32 > azurite_key
```

Create the connection string with the same key:

```sh
key="$(cat /home/jamz/docker/ti4-companion/secrets/azurite_key)"
printf 'DefaultEndpointsProtocol=http;AccountName=ti4blob;AccountKey=%s;BlobEndpoint=http://storage:10000/ti4blob;' "$key" \
  > /home/jamz/docker/ti4-companion/secrets/blob_storage_connection
chmod 600 /home/jamz/docker/ti4-companion/secrets/*
```

In Portainer, deploy a stack from this repository and set its Compose path to
`deploy/production/docker-compose.yml`. Set `SECRETS_DIR` to
`/home/jamz/docker/ti4-companion/secrets`.

Generate a shared Basic Auth credential for your group with
`htpasswd -nbB 'your-username' 'your-long-password'` and set its output,
unchanged, as `TRAEFIK_BASIC_AUTH_USERS` in Portainer. The same auth middleware
protects the website, API, and SignalR hub.

The compose file builds the frontend and API from the checked-out repository.
Ensure the `proxy` Docker network exists and Traefik has a TLS certificate
configured for `ti4.nerps.net` on its `proxy` entrypoint.

PostgreSQL and Azurite use named Docker volumes (`postgres_data` and
`blob_data`). Back up both volumes along with the three secret files; restoring
the database without its blob volume can leave map images unavailable.

The API image currently targets .NET 6, which is out of support. This stack is
for a restricted friend-group deployment, not an Internet-facing public
service; plan a .NET runtime and dependency upgrade before expanding access.
