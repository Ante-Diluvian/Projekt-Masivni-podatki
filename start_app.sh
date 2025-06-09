#!/bin/bash

echo "Starting full application stack..."

#Scripts
BACKEND_SCRIPT="./RAIN/backend/start-backend.sh"
FRONTEND_SCRIPT="./RAIN/frontend/start-frontend.sh"
BROKER_COMPOSE="./NPO/Broker/docker-compose.yml"
FA_COMPOSE="./ORV/server/docker-compose.yml"

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

#NPO - MQTT
BROKER_COMPOSE="./NPO/compose.yml"
if [ -f "${BROKER_COMPOSE}" ]; then
  echo "Starting Mosquitto broker..."
  docker compose -f "${BROKER_COMPOSE}" up -d --wait
else
  echo "Missing docker-compose.yml for MQTT at $BROKER_COMPOSE"
  exit 1
fi

#2FA
if [ -f "${FA_COMPOSE}" ]; then
  echo "Starting 2FA..."
  docker compose -f "${FA_COMPOSE}" up -d --wait
else
  echo "Missing docker-compose.yml for ORV at $FA_COMPOSE"
  exit 1
fi

echo ""
echo "All services started successfully."