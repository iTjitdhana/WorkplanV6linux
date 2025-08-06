@echo off
echo Starting Frontend and Backend in DEVELOPMENT mode...
echo.

REM Set environment variables for development
set NODE_ENV=development

REM Start Backend in background
start "Backend Server (Dev)" cmd /k "cd backend && set NODE_ENV=development && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend in background
start "Frontend Server (Dev)" cmd /k "cd frontend && npm run dev"

echo Both servers are starting in DEVELOPMENT mode...
echo.
echo 🔧 Backend API: http://localhost:3101 (Local)
echo 🌐 Frontend: http://localhost:3011 (Local)
echo.
echo ✅ Development mode - using localhost
echo.
echo Press any key to exit this window...
pause > nul 