@echo off
chcp 65001 >nul
echo Starting Backend Server
echo ======================

cd backend
echo Starting Backend on port 3101...
npm start

pause 