#!/bin/sh
set -eu

postgres_password="$(cat /run/secrets/postgres_password)"
blob_storage_connection="$(cat /run/secrets/blob_storage_connection)"

export ConnectionStrings__SessionContext="Host=postgres;Port=5432;Database=ti4companion;Username=ti4companion;Password=${postgres_password}"
export ConnectionStrings__BlobStorage="${blob_storage_connection}"

exec dotnet server.dll --urls http://+:8080
