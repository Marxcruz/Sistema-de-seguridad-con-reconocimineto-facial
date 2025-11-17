#!/usr/bin/env python3
"""Script para probar diferentes URLs de DroidCam"""

import cv2
import requests

DROIDCAM_IP = "192.168.1.40"
DROIDCAM_PORT = "4747"

# URLs a probar
urls_to_test = [
    f"http://{DROIDCAM_IP}:{DROIDCAM_PORT}/mjpegfeed",
    f"http://{DROIDCAM_IP}:{DROIDCAM_PORT}/video",
    f"http://{DROIDCAM_IP}:{DROIDCAM_PORT}/mjpeg",
    f"http://{DROIDCAM_IP}:{DROIDCAM_PORT}/stream",
    f"http://{DROIDCAM_IP}:{DROIDCAM_PORT}/cam",
]

print("\n" + "="*70)
print("PRUEBA DE CONEXIÓN A DROIDCAM")
print("="*70 + "\n")

# 1. Probar página principal
print("1️⃣ Probando acceso HTTP básico...")
try:
    response = requests.get(f"http://{DROIDCAM_IP}:{DROIDCAM_PORT}", timeout=5)
    if response.status_code == 200:
        print(f"   ✅ Página principal accesible (HTTP {response.status_code})")
    else:
        print(f"   ⚠️ Respuesta: HTTP {response.status_code}")
except requests.exceptions.Timeout:
    print(f"   ❌ Timeout - No responde en 5 segundos")
except requests.exceptions.ConnectionError:
    print(f"   ❌ Connection Error - No se puede conectar")
    print(f"   💡 Verifica:")
    print(f"      - Celular y laptop en mismo WiFi")
    print(f"      - DroidCam app abierta en celular")
    print(f"      - Firewall no bloqueando puerto 4747")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "-"*70 + "\n")

# 2. Probar cada URL con OpenCV
print("2️⃣ Probando URLs de video con OpenCV...\n")
for i, url in enumerate(urls_to_test, 1):
    print(f"   [{i}] Probando: {url}")
    try:
        cap = cv2.VideoCapture(url)
        
        if cap.isOpened():
            ret, frame = cap.read()
            if ret and frame is not None:
                print(f"       ✅ FUNCIONA - Frame recibido: {frame.shape}")
                print(f"       👉 USA ESTA URL EN TU CONFIGURACIÓN")
            else:
                print(f"       ⚠️ Abre pero no recibe frames")
        else:
            print(f"       ❌ No se puede abrir")
            
        cap.release()
    except Exception as e:
        print(f"       ❌ Error: {e}")
    
    print()

print("="*70)
print("PRUEBA COMPLETADA")
print("="*70 + "\n")
