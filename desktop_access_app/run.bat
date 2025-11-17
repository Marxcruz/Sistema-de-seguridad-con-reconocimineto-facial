@echo off
echo ========================================
echo  SISTEMA DE CONTROL DE ACCESO FACIAL
echo  Aplicacion de Escritorio
echo ========================================
echo.

echo Activando entorno virtual...
call desktop_env\Scripts\activate.bat

echo.
echo Verificando servicios...
echo - API Python (puerto 8000): Verificando...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo   WARNING: API Python no responde en puerto 8000
    echo   Asegurate de ejecutar la API primero
)

echo - Dashboard Web (puerto 3000): Verificando...
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo   WARNING: Dashboard Web no responde en puerto 3000
    echo   Asegurate de ejecutar el dashboard primero
)

echo.
echo Iniciando aplicacion de escritorio...
echo.
python main.py

echo.
echo Aplicacion cerrada.
pause
