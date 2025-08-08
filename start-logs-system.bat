@echo off
echo ========================================
echo Start Logs System
echo ========================================

echo.
echo 1. Building frontend...
cd frontend
npm run build
cd ..

echo.
echo 2. Starting development server...
cd frontend
npm run dev 