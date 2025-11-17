@echo off
echo ========================================
echo  INSTALACION - APLICACION DE ESCRITORIO
echo  Sistema de Control de Acceso Facial
echo ========================================
echo.

echo [1/4] Verificando Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python no encontrado. Instala Python 3.11+ primero.
    pause
    exit /b 1
)

echo.
echo [2/4] Creando entorno virtual...
python -m venv desktop_env
if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear el entorno virtual.
    pause
    exit /b 1
)

echo.
echo [3/4] Activando entorno virtual...
call desktop_env\Scripts\activate.bat

echo.
echo [4/4] Instalando dependencias...
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo ========================================
echo  INSTALACION COMPLETADA
echo ========================================
echo.
echo Para ejecutar la aplicacion:
echo 1. Asegurate que la API Python este corriendo (puerto 8000)
echo 2. Asegurate que el dashboard web este corriendo (puerto 3000)
echo 3. Ejecuta: run.bat
echo.
pause
