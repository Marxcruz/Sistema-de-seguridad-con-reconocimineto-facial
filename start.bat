@echo off
echo 🚀 Iniciando Sistema de Seguridad con Reconocimiento Facial...
echo.

REM Verificar que existe el entorno virtual de Python
if not exist "face_env" (
    echo [ERROR] No se encontro el entorno virtual de Python
    echo Por favor ejecuta primero: scripts\setup.bat
    pause
    exit /b 1
)

REM Iniciar servicio de reconocimiento facial en una nueva ventana
echo [INFO] Iniciando servicio de reconocimiento facial...
start "Facial Recognition Service" cmd /k "cd face_recognition_service && ..\face_env\Scripts\activate && echo Servicio Python iniciado en http://localhost:8000 && python main.py"

REM Esperar un momento para que el servicio Python se inicie
timeout /t 3 /nobreak >nul

REM Iniciar aplicación web en una nueva ventana
echo [INFO] Iniciando aplicación web...
start "Web Application" cmd /k "echo Aplicacion web iniciada en http://localhost:3000 && npm run dev"

echo.
echo ✅ Servicios iniciados exitosamente!
echo.
echo 📱 Aplicación web: http://localhost:3000
echo 🤖 Servicio IA: http://localhost:8000
echo.
echo Para detener los servicios, cierra las ventanas de terminal.
echo.
pause
