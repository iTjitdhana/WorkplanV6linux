@echo off
chcp 65001 >nul
echo Starting Frontend Server
echo =======================

cd frontend
echo Starting Frontend on port 3011...
npm run dev

pause 