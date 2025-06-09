#!/bin/bash

echo "Starting full application stack..."

#Scripts
BACKEND_SCRIPT="./RAIN/backend/start-backend.sh"
FRONTEND_SCRIPT="./RAIN/frontend/start-frontend.sh"
BROKER_COMPOSE="./NPO/Broker/docker-compose.yml"
FA_COMPOSE="./ORV/server/docker-compose.yml"
FLASK_URL="http://localhost:5000"

#2FA
if [ -f "${FA_COMPOSE}" ]; then
    echo "Starting 2FA..."
    docker compose -f "${FA_COMPOSE}" up -d --wait
else
    echo "Missing docker-compose.yml for ORV at $FA_COMPOSE"
    exit 1
fi

#NPO - MQTT
if [ -f "${BROKER_COMPOSE}" ]; then
    echo "Starting Mosquitto broker..."
    docker compose -f "${BROKER_COMPOSE}" up -d --wait
else
    echo "Missing docker-compose.yml for MQTT at $BROKER_COMPOSE"
    exit 1
fi

#Wait for flask server
RETRIES=0
MAX_RETRIES=20
until curl --silent --fail "$FLASK_URL" > /dev/null; do
    RETRIES=$((RETRIES + 1))
    echo "Flask not ready yet. Retrying in $RETRY_DELAY seconds..."
    
    if [ "$RETRIES" -ge "$MAX_RETRIES" ]; then
        echo ""
        echo "Error: Flask backend not reachable!"
        exit 1
    fi

    sleep 5
done
echo "Flask is up!"

#Backend
if [ -f "$BACKEND_SCRIPT" ]; then
    echo "Found $BACKEND_SCRIPT"
    chmod +x "$BACKEND_SCRIPT"
    echo "Starting backend..."
    (cd ./RAIN/backend && ./start-backend.sh)
else
    echo "Missing backend start script at $BACKEND_SCRIPT"
    exit 1
fi

#Frontend
if [ -f "$FRONTEND_SCRIPT" ]; then
    echo "Found $FRONTEND_SCRIPT"
    chmod +x "$FRONTEND_SCRIPT"
    echo "Starting frontend..."
    (cd ./RAIN/frontend && ./start-frontend.sh)
else
    echo "Missing frontend start script at $FRONTEND_SCRIPT"
    exit 1
fi

echo ""
echo "All services started successfully."