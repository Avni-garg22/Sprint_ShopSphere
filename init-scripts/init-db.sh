#!/bin/bash
set -e

# Create additional databases if they don't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE IF NOT EXISTS payment_db;
    GRANT ALL PRIVILEGES ON DATABASE payment_db TO $POSTGRES_USER;
EOSQL

echo "Additional databases created successfully!"