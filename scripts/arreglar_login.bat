@echo off
echo ============================================
echo ARREGLAR PROBLEMA DE LOGIN
echo Sistema de Reconocimiento Facial
echo ============================================
echo.

cd /d "%~dp0"

echo [1/5] Verificando archivo .env...
if exist .env (
    echo    [OK] Archivo .env existe
) else (
    echo    [!] Archivo .env NO existe
    echo    [*] Copiando .env.example a .env...
    copy .env.example .env
    echo    [OK] Archivo .env creado
)
echo.

echo [2/5] Limpiando cache de Next.js...
if exist .next (
    rmdir /s /q .next
    echo    [OK] Cache eliminado
) else (
    echo    [OK] No hay cache para limpiar
)
echo.

echo [3/5] Regenerando cliente Prisma...
call npx prisma generate
echo.

echo [4/5] Verificando usuarios en base de datos...
echo.
echo    Ejecutando query de verificacion...
call npx prisma studio &
timeout /t 3 /nobreak >nul
echo.
echo    [!] Prisma Studio abierto en http://localhost:5555
echo    [!] Verifica que existan usuarios en la tabla 'usuarios'
echo    [!] Cierra Prisma Studio cuando termines
echo.
pause

echo.
echo [5/5] Instrucciones finales:
echo.
echo    1. Abre una NUEVA terminal
echo    2. Ejecuta: npm run dev
echo    3. Espera a que diga "Ready"
echo    4. Abre: http://localhost:3000/login
echo    5. Usa estas credenciales:
echo.
echo       ┌─────────────────────────────────────┐
echo       │  Email: admin@sistema.com           │
echo       │  Contraseña: admin123               │
echo       └─────────────────────────────────────┘
echo.
echo    6. Si sigue fallando:
echo       - Presiona F12 (DevTools)
echo       - Ve a Application → Local Storage
echo       - Elimina 'auth_token'
echo       - Recarga la pagina (F5)
echo.

echo ============================================
echo PROCESO COMPLETADO
echo ============================================
echo.
echo Si el problema persiste, ejecuta:
echo    npx prisma db seed
echo.
pause
