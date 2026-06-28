@echo off
echo Starting Admin and Kiosk interfaces...

start "Admin Interface" cmd /k "npm run dev -w admin"
start "Kiosk Interface" cmd /k "npm run dev -w kiosk"

echo.
echo Both interfaces have been started in separate windows!
echo - Admin: http://localhost:3001
echo - Kiosk: http://localhost:3000
echo.
pause
