#!/bin/bash

echo "Starting full application stack..."

#Scripts
BACKEND_SCRIPT="./RAIN/backend/start-backend.sh"
FRONTEND_SCRIPT="./RAIN/frontend/start-frontend.sh"
BROKER_SCRIPT="./NPO/Broker/start-broker.sh"
FA_COMPOSE="./ORV/server/docker-compose.yml"

#2FA
if [ -f "${FA_COMPOSE}" ]; then
    echo "Starting 2FA..."
    docker compose -f "${FA_COMPOSE}" up -d --wait
else
    echo "Missing docker-compose.yml for ORV at $FA_COMPOSE"
    exit 1
fi

#NPO - MQTT
if [ -f "${BROKER_SCRIPT}" ]; then
    chmod +x "$BROKER_SCRIPT"
    echo "Starting broker..."
    (cd ./NPO/Broker && ./start-broker.sh)
else
    echo "Missing broker start script at $BROKER_SCRIPT"
    exit 1
fi

#Wait for flask server
echo "Sleeping for 20 seconds to allow MQTT and Flask to start..."
sleep 20

#Backend
if [ -f "$BACKEND_SCRIPT" ]; then
    chmod +x "$BACKEND_SCRIPT"
    echo "Starting backend..."
    (cd ./RAIN/backend && ./start-backend.sh)
else
    echo "Missing backend start script at $BACKEND_SCRIPT"
    exit 1
fi

#Frontend
if [ -f "$FRONTEND_SCRIPT" ]; then
    chmod +x "$FRONTEND_SCRIPT"
    echo "Starting frontend..."
    (cd ./RAIN/frontend && ./start-frontend.sh)
else
    echo "Missing frontend start script at $FRONTEND_SCRIPT"
    exit 1
fi

echo ""
echo "All services started successfully."