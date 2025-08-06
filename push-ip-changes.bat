@echo off
echo 🔄 Committing and pushing IP 192.168.0.94 changes...
echo ================================================

cd /d "C:\Frontend_workplanV3.4Deploy"

echo 📝 Adding all changes to git...
git add .

echo 📦 Committing changes...
git commit -m "Replace all localhost references with IP 192.168.0.94

- Update all API routes to use 192.168.0.94:3101 as fallback
- Update frontend package.json to bind to 192.168.0.94
- Update backend server.js console output
- Update ecosystem.config.js with correct IP
- Update Production_Planing.tsx hardcoded URLs
- Now system runs completely on 192.168.0.94 network"

echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ Changes pushed successfully!
echo.
echo 🌐 System is now configured for IP 192.168.0.94:
echo   - Backend: http://192.168.0.94:3101
echo   - Frontend: http://192.168.0.94:3011
echo.
pause