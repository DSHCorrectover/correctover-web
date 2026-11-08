#!/bin/bash
# Correctover SaaS Platform - Quick Start Script
# This script sets up and starts the development environment

set -e

echo "========================================="
echo "Correctover SaaS Platform - Setup & Start"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in project root (/data/.env)"
    echo "Please ensure the .env file exists with all required credentials."
    exit 1
fi

# Copy .env to project directory
echo "✓ Loading environment variables..."
cp /data/.env .env.local

# Install dependencies (if not already installed)
if [ ! -d "node_modules" ]; then
    echo "✓ Installing dependencies..."
    npm install
else
    echo "✓ Dependencies already installed"
fi

# Generate Prisma client
echo "✓ Generating Prisma client..."
npx prisma generate

# Check database connection
echo ""
echo "⚠️  Database Setup Required:"
echo "   Before running the application, ensure PostgreSQL is running and execute:"
echo "   $ npx prisma db push"
echo ""

# Start services
echo "========================================="
echo "Starting Development Servers"
echo "========================================="
echo ""
echo "Frontend (Next.js): http://localhost:3000"
echo "Backend API (Fastify): http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers in parallel
npm run dev &
FRONTEND_PID=$!

sleep 2

npx ts-node api-server/index.ts &
BACKEND_PID=$!

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID
