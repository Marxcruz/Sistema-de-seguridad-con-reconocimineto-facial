#!/usr/bin/env python3
"""Script para actualizar URL de DroidCam en Punto 1"""

import requests

API_BASE = "http://localhost:3000/api"
PUNTO_ID = 1
NUEVA_URL = "http://192.168.1.40:4747/video"

print("\n" + "="*70)
print("ACTUALIZANDO URL DE DROIDCAM")
print("="*70 + "\n")

try:
    response = requests.put(
        f"{API_BASE}/puntos-control/{PUNTO_ID}/camera",
        json={
            "cameraUrl": NUEVA_URL,
            "streamType": "HTTP"
        },
        timeout=5
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ URL actualizada exitosamente")
        print(f"   Punto: {data.get('data', {}).get('nombre')}")
        print(f"   Nueva URL: {NUEVA_URL}")
        print(f"   Tipo: HTTP")
    else:
        print(f"❌ Error: HTTP {response.status_code}")
        print(f"   {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ ERROR: Dashboard no está corriendo")
    print("   Ejecuta: npm run dev")
    
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "="*70 + "\n")
