@echo off
setlocal enabledelayedexpansion

REM Sistema de Seguridad con Reconocimiento Facial - Setup Script para Windows
REM Este script automatiza la configuración inicial del sistema

echo 🚀 Iniciando configuración del Sistema de Seguridad con Reconocimiento Facial...

REM Verificar prerrequisitos
echo [INFO] Verificando prerrequisitos...

REM Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no está instalado. Por favor instala Node.js 18+
    pause
    exit /b 1
)

REM Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no está instalado. Por favor instala Python 3.8+
    pause
    exit /b 1
)

echo [INFO] ✅ Prerrequisitos verificados

REM Configurar variables de entorno
echo [INFO] Configurando variables de entorno...
if not exist .env (
    copy .env.example .env
    echo [INFO] Archivo .env creado desde .env.example
    echo [WARNING] Por favor edita el archivo .env con tus configuraciones
)

REM Instalar dependencias Node.js
echo [INFO] Instalando dependencias de Node.js...
call npm install
if errorlevel 1 (
    echo [ERROR] Error instalando dependencias de Node.js
    pause
    exit /b 1
)
echo [INFO] ✅ Dependencias de Node.js instaladas

REM Configurar Python
echo [INFO] Configurando entorno Python...
cd face_recognition_service

REM Crear entorno virtual si no existe
if not exist venv (
    python -m venv venv
    echo [INFO] Entorno virtual Python creado
)

REM Activar entorno virtual e instalar dependencias
call venv\Scripts\activate.bat
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Error instalando dependencias de Python
    pause
    exit /b 1
)

cd ..
echo [INFO] ✅ Entorno Python configurado

REM Crear directorios necesarios
echo [INFO] Creando directorios necesarios...
if not exist uploads mkdir uploads
if not exist evidencias mkdir evidencias
if not exist logs mkdir logs
if not exist temp mkdir temp
echo [INFO] ✅ Directorios creados

REM Configurar base de datos
echo [INFO] Configurando base de datos...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Error generando cliente Prisma
    pause
    exit /b 1
)

call npx prisma db push
if errorlevel 1 (
    echo [WARNING] Error aplicando migraciones. Verifica la conexión a la base de datos
)

call npx prisma db seed
if errorlevel 1 (
    echo [WARNING] Error ejecutando seed. Verifica la conexión a la base de datos
)

echo [INFO] ✅ Base de datos configurada

REM Verificar configuración
echo [INFO] Verificando configuración...
call npm run build
if errorlevel 1 (
    echo [ERROR] Error en la compilación de Next.js
    pause
    exit /b 1
)
echo [INFO] ✅ Configuración verificada

REM Mostrar instrucciones finales
echo.
echo 🎉 ¡Configuración completada exitosamente!
echo.
echo Para iniciar el sistema:
echo.
echo 1. Iniciar servicio de reconocimiento facial:
echo    cd face_recognition_service
echo    venv\Scripts\activate.bat
echo    python main.py
echo.
echo 2. En otra terminal, iniciar aplicación web:
echo    npm run dev
echo.
echo 3. Abrir navegador en: http://localhost:3000
echo.
echo Para producción con Docker:
echo    docker-compose up -d
echo.
echo 📚 Consulta README.md para más información
echo.
pause
