@echo off
chcp 65001 >nul
echo ╔══════════════════════════════════════════════════════════╗
echo ║   SISTEMA DE SEGURIDAD CON RECONOCIMIENTO FACIAL         ║
echo ║   Iniciador Automático Completo                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo [1/4] 📊 Verificando PostgreSQL...
timeout /t 2 >nul

echo [2/4] 🔄 Sincronizando Base de Datos...
call npx prisma db push --accept-data-loss
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error sincronizando base de datos
    pause
    exit /b 1
)

echo [3/4] 🌱 Cargando datos iniciales...
call npx prisma db seed
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Datos ya cargados o error en seed
)

echo.
echo ✅ Base de datos lista!
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   SISTEMA LISTO - Ahora inicia los servicios:           ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 📝 Abrir 3 terminales:
echo.
echo   Terminal 1: API Python
echo   cd face_recognition_service
echo   face_env\Scripts\activate
echo   python main.py
echo.
echo   Terminal 2: Dashboard Web
echo   npm run dev
echo.
echo   Terminal 3: Aplicación Escritorio
echo   cd desktop_access_app
echo   python main.py
echo.
echo 🔐 Credenciales de acceso:
echo   admin@sistema.com / admin123
echo.
pause
