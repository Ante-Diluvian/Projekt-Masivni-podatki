#!/bin/bash


echo "🔧 Checking for backend..."
echo "🔧 Checking for required files..."

echo ""
echo "🔍 Searchin for package.json..."
if [ -f "package.json" ]; then
  echo "✅ Found package.json"
else
  echo "❌ Required file not found: package.json"
  exit 1
fi

echo ""
echo "🔍 Searchin for app.js..."
if [ -f "app.js" ]; then
  echo "✅ Found app.js"
  echo "🔧 Starting Backend with Docker Compose..."
else
  echo "❌ Required file not found: app.js"
  exit 1
fi

echo ""
echo "🔍 Searchin for .env..."
if [ -f ".env" ]; then
  echo "✅ Found .env"
else
  echo "❌ Required file not found: .env"
fi

echo ""
echo "🚀 Starting Backend with Docker Compose..."
docker-compose up -d