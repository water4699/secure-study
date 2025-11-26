#!/bin/bash

# Encrypted Study Tracker - Development Startup Script
# This script starts the complete development environment

set -e

echo "🚀 Starting Encrypted Study Tracker Development Environment"
echo "========================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 20"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js version: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm >= 7.0.0"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✓ npm version: $NPM_VERSION"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Compile contracts
echo ""
echo "🔨 Compiling smart contracts..."
npm run compile

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping development environment..."
    kill $HARDHAT_PID $FRONTEND_PID 2>/dev/null || true
    echo "✓ All services stopped"
    exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Start local Hardhat node in background
echo ""
echo "🌐 Starting local Hardhat node..."
npx hardhat node &
HARDHAT_PID=$!

# Wait for node to start
sleep 3

# Deploy contracts
echo ""
echo "📋 Deploying contracts to local network..."
npm run deploy-local

# Start frontend development server
echo ""
echo "🎨 Starting frontend development server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for services to start
sleep 5

echo ""
echo "🎉 Development environment started successfully!"
echo "========================================================"
echo "🌐 Frontend: http://localhost:3000"
echo "📋 Hardhat Node: http://localhost:8545"
echo "📊 Local Dashboard: http://localhost:8545"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait
