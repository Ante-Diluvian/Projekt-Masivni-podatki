#!/bin/bash

set -e

CONFIG_DIR="./config"
PASSWD_FILE="$CONFIG_DIR/passwd"
ACL_FILE="$CONFIG_DIR/acl"
USERNAME="app_guest"

echo "🔧 Starting Mosquitto broker with Docker Compose..."
docker-compose up -d

sleep 2

# 1. Ustvari passwd datoteko, če še ne obstaja
if [ ! -f "$PASSWD_FILE" ]; then
  echo "🆕 Creating new password file..."
  docker run --rm -v "$(pwd)/config:/mosquitto/config" eclipse-mosquitto \
    mosquitto_passwd -c /mosquitto/config/passwd "$USERNAME"
else
  if grep -q "^$USERNAME:" "$PASSWD_FILE"; then
    echo "✅ User '$USERNAME' already exists."
  else
    echo "➕ Adding user '$USERNAME'..."
    docker run --rm -v "$(pwd)/config:/mosquitto/config" eclipse-mosquitto \
      mosquitto_passwd /mosquitto/config/passwd "$USERNAME"
  fi
fi

# 2. Ustvari acl datoteko, če še ne obstaja
if [ ! -f "$ACL_FILE" ]; then
  echo "🆕 Creating new ACL file..."
  cat <<EOF > "$ACL_FILE"
# ACL for user $USERNAME
user $USERNAME
topic write app/register
topic write app/login
topic read  app/response/$USERNAME
EOF
else
  echo "✅ ACL file already exists."
fi

# 3. Pridobi javni IP naslov
PUBLIC_IP=$(curl -s ifconfig.me || echo "unknown")

# 4. Izpiši podatke
echo ""
echo "📡 Mosquitto broker is running."
echo "📍 Local container IP address:"
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mosquitto

echo ""
echo "📢 Listening ports:"
echo " - MQTT:      tcp://localhost:1883"
echo " - WebSocket: ws://localhost:9001"

echo ""
echo "🌐 Public access (if firewall and ports allow):"
echo " - WebSocket URI: ws://$PUBLIC_IP:9001"

echo ""
echo "🔐 Test user credentials:"
echo " - Username: $USERNAME"
echo " - Password: (entered manually during creation)"
