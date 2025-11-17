@echo off
echo ============================================
echo Generador de Diagrama de Despliegue
echo Sistema de Reconocimiento Facial
echo ============================================
echo.

cd /d "%~dp0"

echo Verificando PlantUML...
echo.

REM Opción 1: Usar extensión de VS Code (recomendado)
echo OPCION 1: Usar Visual Studio Code
echo 1. Instalar extension "PlantUML" en VS Code
echo 2. Abrir diagrama_despliegue.puml
echo 3. Presionar Alt+D para preview
echo 4. Click derecho - Export Current Diagram
echo.

REM Opción 2: Usar PlantUML online
echo OPCION 2: Usar PlantUML Online
echo 1. Ir a: https://www.plantuml.com/plantuml/uml/
echo 2. Copiar contenido de diagrama_despliegue.puml
echo 3. Pegar en el editor online
echo 4. Descargar PNG/SVG/PDF
echo.

REM Opción 3: Usar Java (si está instalado)
echo OPCION 3: Usar Java + PlantUML.jar
echo.

where java >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Java detectado
    echo.
    
    if exist plantuml.jar (
        echo [OK] plantuml.jar encontrado
        echo Generando diagrama...
        java -jar plantuml.jar -tpng diagrama_despliegue.puml
        java -jar plantuml.jar -tsvg diagrama_despliegue.puml
        echo.
        echo [EXITO] Diagramas generados:
        echo - diagrama_despliegue.png
        echo - diagrama_despliegue.svg
        echo.
    ) else (
        echo [INFO] plantuml.jar no encontrado
        echo.
        echo Para descargar PlantUML:
        echo 1. Ir a: https://plantuml.com/download
        echo 2. Descargar plantuml.jar
        echo 3. Colocar en carpeta docs/
        echo 4. Ejecutar este script nuevamente
        echo.
    )
) else (
    echo [INFO] Java no detectado
    echo.
    echo Para instalar Java:
    echo 1. Ir a: https://www.java.com/download/
    echo 2. Descargar e instalar Java
    echo 3. Ejecutar este script nuevamente
    echo.
)

echo ============================================
echo RECOMENDACION:
echo ============================================
echo.
echo La forma mas facil es usar VS Code:
echo 1. Instalar extension "PlantUML"
echo 2. Abrir diagrama_despliegue.puml
echo 3. Presionar Alt+D
echo 4. Exportar como PNG
echo.

pause
