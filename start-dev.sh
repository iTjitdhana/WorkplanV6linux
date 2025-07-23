#!/bin/bash

echo "Starting Production Planning System on IP 192.168.0.94"
echo "Backend will run on port 3101"
echo "Frontend will run on port 3011"
echo ""

echo "Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "Waiting 5 seconds for backend to start..."
sleep 5

echo "Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers are starting..."
echo "Backend: http://192.168.0.94:3101"
echo "Frontend: http://192.168.0.94:3011"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for background processes
wait 