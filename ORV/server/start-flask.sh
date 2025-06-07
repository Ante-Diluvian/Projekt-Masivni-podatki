#!/bin/bash

echo "Checking for required files..."

# Check for .env file
if [ ! -f ".env" ]; then
  echo "Error: .env file not found in the current directory."
  exit 1
fi

# Check if at least one *.keras file exists in model/
if compgen -G "model/*.keras" > /dev/null; then
  echo "Model (*.keras) file found."
else
  echo "Error: No model (*.keras) file found in the model/ directory."
  exit 1
fi

echo "All required files are present. Starting Docker Compose build..."

docker-compose build

if [ $? -ne 0 ]; then
  echo "Error: docker-compose build failed."
  exit 1
fi

echo "Build completed successfully. Starting Docker Compose..."

docker-compose up -d

if [ $? -ne 0 ]; then
  echo "Error: docker-compose failed to start."
  exit 1
fi

echo "Docker Compose started successfully. Current container status:"
docker-compose ps
