@echo off
echo ========================================
echo    WorkplanV6 Performance Mode
echo ========================================
echo.

echo Checking system requirements...
echo.

REM Check if Docker is available
docker --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] Docker not available, using npm performance mode...
    goto npm_mode
) else (
    echo [INFO] Docker available, using Docker performance mode...
    goto docker_mode
)

:npm_mode
echo.
echo ========================================
echo    NPM Performance Mode
echo ========================================
echo.

REM Install performance dependencies
echo Installing performance dependencies...
cd frontend
call npm install @next/bundle-analyzer cross-env image-webpack-loader --save-dev
cd ..

cd backend
call npm install compression --save
cd ..

echo.
echo Starting services with performance optimizations...
echo.

REM Start backend with performance settings
echo Starting Backend (Performance Mode)...
cd backend
start "Backend Performance" cmd /k "set NODE_ENV=production && set NODE_OPTIONS=--max-old-space-size=512 && npm start"
cd ..

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend with performance settings
echo Starting Frontend (Performance Mode)...
cd frontend
start "Frontend Performance" cmd /k "set NODE_ENV=production && set NODE_OPTIONS=--max-old-space-size=512 && npm run dev"
cd ..

echo.
echo ========================================
echo    Performance Mode Started!
echo ========================================
echo.
echo Frontend: http://localhost:3011
echo Backend:  http://localhost:3101
echo.
echo Performance optimizations enabled:
echo - Gzip compression
echo - Image optimization
echo - Bundle splitting
echo - Memory optimization
echo - Caching headers
echo.
echo Press any key to open the application...
pause >nul
start http://localhost:3011
goto end

:docker_mode
echo.
echo ========================================
echo    Docker Performance Mode
echo ========================================
echo.

echo Building and starting containers with performance optimizations...
echo This may take a few minutes on first run...
echo.

docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start containers!
    echo Falling back to npm mode...
    goto npm_mode
)

echo.
echo ========================================
echo    Docker Performance Mode Started!
echo ========================================
echo.
echo Services are starting up...
echo.
echo Frontend: http://localhost:3011
echo Backend:  http://localhost:3101
echo MySQL:    localhost:3306
echo Nginx:    http://localhost:80
echo.
echo Performance optimizations enabled:
echo - Nginx reverse proxy with caching
echo - Gzip compression
echo - Rate limiting
echo - Resource limits
echo - Health checks
echo - MySQL optimization
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop services:
echo   docker-compose down
echo.
echo Press any key to open the application...
pause >nul
start http://localhost:3011

:end
echo.
echo Performance mode setup complete!
