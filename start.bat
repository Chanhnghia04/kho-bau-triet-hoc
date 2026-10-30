@echo off
title Kho Bau Triet Hoc - Game Server
color 0b
echo ====================================================
echo        KHO BAU TRIET HOC - GAME SERVER
echo ====================================================
echo.
echo Dang kiem tra Node.js va khoi dong server...
echo.

node server.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LOI] Khong the khoi dong server. Vui long kiem tra Node.js da duoc cai dat chua.
    echo.
)

pause
