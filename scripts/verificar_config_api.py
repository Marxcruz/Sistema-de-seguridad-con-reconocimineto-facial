#!/usr/bin/env python3
"""Script para verificar configuración de cámaras usando la API"""

import requests
import json

API_BASE = "http://localhost:3000/api"

print("\n" + "="*80)
print("VERIFICANDO CONFIGURACIÓN DE PUNTOS DE CONTROL")
print("="*80 + "\n")

# Obtener puntos de control
try:
    response = requests.get(f"{API_BASE}/puntos-control", timeout=5)
    
    if response.status_code == 200:
        data = response.json()
        
        if data.get('success') and data.get('data'):
            puntos = data['data']
            
            print(f"✅ Se encontraron {len(puntos)} puntos de control\n")
            
            for punto in puntos:
                punto_id = punto.get('id')
                nombre = punto.get('nombre')
                
                print(f"📍 Punto ID: {punto_id}")
                print(f"   Nombre: {nombre}")
                
                # Obtener configuración de cámara
                try:
                    cam_response = requests.get(
                        f"{API_BASE}/puntos-control/{punto_id}/camera",
                        timeout=5
                    )
                    
                    if cam_response.status_code == 200:
                        cam_data = cam_response.json()
                        
                        if cam_data.get('success') and cam_data.get('data'):
                            config = cam_data['data']
                            camera_url = config.get('cameraUrl')
                            stream_type = config.get('streamType')
                            camera_user = config.get('cameraUser')
                            
                            if camera_url:
                                print(f"   ✅ Cámara configurada:")
                                print(f"      URL: {camera_url}")
                                print(f"      Tipo: {stream_type or 'N/A'}")
                                print(f"      Usuario: {camera_user or '(sin usuario)'}")
                            else:
                                print(f"   ⚪ Sin cámara configurada (usará USB por defecto)")
                        else:
                            print(f"   ⚪ Sin configuración de cámara")
                    else:
                        print(f"   ⚠️ Error obteniendo config: HTTP {cam_response.status_code}")
                        
                except Exception as e:
                    print(f"   ❌ Error: {e}")
                
                print("-" * 80)
        else:
            print("❌ No se encontraron puntos de control")
    else:
        print(f"❌ Error: API respondió con código {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("❌ ERROR: No se pudo conectar a la API")
    print("   Asegúrate de que el Dashboard esté corriendo:")
    print("   → npm run dev")
    
except Exception as e:
    print(f"❌ Error inesperado: {e}")

print("\n" + "="*80)
print("VERIFICACIÓN COMPLETADA")
print("="*80 + "\n")
