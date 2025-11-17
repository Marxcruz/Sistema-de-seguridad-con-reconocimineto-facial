#!/bin/bash

echo "🚀 Iniciando Sistema de Seguridad con Reconocimiento Facial..."
echo

# Verificar que existe el entorno virtual de Python
if [ ! -d "face_recognition_service/venv" ]; then
    echo "[ERROR] No se encontró el entorno virtual de Python"
    echo "Por favor ejecuta primero: ./scripts/setup.sh"
    exit 1
fi

# Función para limpiar procesos al salir
cleanup() {
    echo
    echo "🛑 Deteniendo servicios..."
    kill $PYTHON_PID 2>/dev/null
    kill $NODE_PID 2>/dev/null
    exit 0
}

# Capturar señales para limpiar al salir
trap cleanup SIGINT SIGTERM

# Iniciar servicio de reconocimiento facial en segundo plano
echo "[INFO] Iniciando servicio de reconocimiento facial..."
cd face_recognition_service
source venv/bin/activate
python main.py &
PYTHON_PID=$!
cd ..

# Esperar un momento para que el servicio Python se inicie
sleep 3

# Iniciar aplicación web
echo "[INFO] Iniciando aplicación web..."
npm run dev &
NODE_PID=$!

echo
echo "✅ Servicios iniciados exitosamente!"
echo
echo "📱 Aplicación web: http://localhost:3000"
echo "🤖 Servicio IA: http://localhost:8000"
echo
echo "Presiona Ctrl+C para detener todos los servicios"
echo

# Esperar indefinidamente hasta que se presione Ctrl+C
wait
