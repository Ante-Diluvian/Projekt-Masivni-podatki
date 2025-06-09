#!/bin/bash

echo "🔍 Checking for Frontend..."
echo "🔧 Checking for required files..."

echo ""
echo "🔍 Searchin for package.json..."
if [ -f "package.json" ]; then
  echo "✅ Found package.json"
else
  echo "❌ Required files not found: package.json"
  exit 1
fi

echo ""
echo "🔍 Searchin for App.js..."
if [ -f "src/App.js" ]; then
  echo "✅ Found App.js"
else
  echo "❌ Required files not found: App.js"
  exit 1
fi

echo ""
echo "🔍 Searchin for Index.html..."
if [ -f "public/index.html" ]; then
  echo "✅ Found index.html"
else
  echo "❌ Required files not found: index.html"
  exit 1
fi

echo ""
echo "🔍 Searchin for App.css..."
if [ -f "src/App.css" ]; then
  echo "✅ Found App.css"
else
  echo "❌ Required files not found: App.css"
  exit 1
fi

echo ""
echo "🚀 Starting Frontend with Docker Compose..."
docker-compose up -d