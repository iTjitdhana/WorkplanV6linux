@echo off
echo Testing Sync System...

REM Test Backend API
echo Testing Backend API...
curl -X POST http://localhost:3101/api/work-plans/sync-drafts-to-plans -H "Content-Type: application/json" -d "{\"targetDate\": \"2025-08-06\"}"

echo.
echo Test completed.
pause 