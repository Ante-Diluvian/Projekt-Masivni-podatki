#!/bin/bash

set -e

CONFIG_DIR="./config"
PASSWD_FILE="$CONFIG_DIR/passwd"
ACL_FILE="$CONFIG_DIR/acl"
USERNAME="app_guest"
PASSWORD="fentanyl"

# 0. Fix permissions on the config directory
echo "🔐 Fixing permissions... part 1"
sudo chown root:root ./config/acl
sudo chmod 0600 ./config/acl
sudo chown root:root ./config/passwd
sudo chmod 0600 ./config/passwd

echo "🔧 Starting Mosquitto broker with Docker Compose..."
docker-compose up -d

sleep 2
# 1a. Fix permissions on the passwd file (again)
echo "🔐 Fixing permissions... part 2"
docker exec mosquitto chown root:root /mosquitto/config/passwd || true
docker exec mosquitto chmod 0600 /mosquitto/config/passwd || true
docker exec mosquitto chown root:root /mosquitto/config/acl || true
docker exec mosquitto chmod 0600 /mosquitto/config/acl || true

# 1c. Create the password file
if [ ! -f "$PASSWD_FILE" ]; then
  echo "🆕 Creating password file and adding user '$USERNAME'..."
  docker run --rm -v "$(pwd)/config:/mosquitto/config" eclipse-mosquitto \
    mosquitto_passwd -b -c /mosquitto/config/passwd "$USERNAME" "$PASSWORD"
else
  if grep -q "^$USERNAME:" "$PASSWD_FILE"; then
    echo "✅ User '$USERNAME' already exists in passwd file."
  else
    echo "➕ Adding user '$USERNAME' to existing passwd file..."
    docker run --rm -v "$(pwd)/config:/mosquitto/config" eclipse-mosquitto \
      mosquitto_passwd -b /mosquitto/config/passwd "$USERNAME" "$PASSWORD"
  fi
fi



# 2. Create the ACL file
if [ ! -f "$ACL_FILE" ]; then
  echo "🆕 Creating new ACL file..."
  cat <<EOF > "$ACL_FILE"
# ACL for user $USERNAME
user $USERNAME
topic write app/workout
topic read app/workout
topic write status/online
topic read status/online
topic write status/offline
topic read status/offline
topic write app/response/#
topic read app/response/#
topic write app/twofactor/send/#
topic read app/twofactor/send/#
topic write app/twofactor/verify/#
topic read app/twofactor/verify/#
EOF
else
  echo "✅ ACL file already exists."
fi

# 3. Get the public IP address
PUBLIC_IP=$(curl -s ifconfig.me || echo "unknown")

# 4. Display information
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
echo " - Password: $PASSWORD"
