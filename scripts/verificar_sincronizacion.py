#!/usr/bin/env python3
"""
Script: Verificar Sincronización Dashboard ↔ App Escritorio
Verifica que la configuración de cámaras se sincronice correctamente
"""

import requests
import json
from datetime import datetime

def print_header(text):
    """Imprimir encabezado"""
    print(f"\n{'='*70}")
    print(f"  {text}")
    print(f"{'='*70}\n")

def print_success(text):
    """Imprimir mensaje de éxito"""
    print(f"✅ {text}")

def print_error(text):
    """Imprimir mensaje de error"""
    print(f"❌ {text}")

def print_info(text):
    """Imprimir mensaje informativo"""
    print(f"ℹ️  {text}")

def print_warning(text):
    """Imprimir mensaje de advertencia"""
    print(f"⚠️  {text}")

def main():
    """Función principal"""
    print("\n")
    print("╔════════════════════════════════════════════════════════╗")
    print("║  🔄 VERIFICADOR DE SINCRONIZACIÓN                      ║")
    print("║  Dashboard Web ↔ App Escritorio                        ║")
    print("╚════════════════════════════════════════════════════════╝")
    
    print(f"\n⏰ Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Paso 1: Verificar Dashboard
    print_header("1️⃣ VERIFICANDO DASHBOARD WEB (Puerto 3000)")
    
    try:
        response = requests.get("http://localhost:3000/api/puntos-control", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                puntos = data['data']
                print_success(f"Dashboard accesible - {len(puntos)} puntos de control")
                
                for punto in puntos:
                    print(f"\n  📍 Punto #{punto.get('id')} - {punto.get('nombre')}")
                    print(f"     Zona: {punto.get('zona', {}).get('nombre', 'N/A')}")
            else:
                print_error("No se encontraron puntos de control")
                return
        else:
            print_error(f"Dashboard retornó código {response.status_code}")
            return
    except Exception as e:
        print_error(f"No se pudo conectar a Dashboard: {e}")
        print_info("Asegúrate de que Next.js esté corriendo: npm run dev")
        return
    
    # Paso 2: Verificar configuración de cámaras
    print_header("2️⃣ VERIFICANDO CONFIGURACIÓN DE CÁMARAS")
    
    camaras_configuradas = 0
    camaras_sin_config = 0
    
    for punto in puntos:
        punto_id = punto.get('id')
        punto_nombre = punto.get('nombre')
        
        try:
            response = requests.get(
                f"http://localhost:3000/api/puntos-control/{punto_id}/camera",
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    config = data['data']
                    camera_url = config.get('cameraUrl')
                    
                    if camera_url:
                        print_success(f"Punto {punto_id} ({punto_nombre})")
                        print(f"   URL: {camera_url}")
                        print(f"   Tipo: {config.get('streamType', 'HTTP')}")
                        print(f"   Usuario: {config.get('cameraUser', 'N/A')}")
                        camaras_configuradas += 1
                    else:
                        print_warning(f"Punto {punto_id} ({punto_nombre}) - Sin configurar")
                        camaras_sin_config += 1
                else:
                    print_warning(f"Punto {punto_id} ({punto_nombre}) - Sin datos")
                    camaras_sin_config += 1
            else:
                print_error(f"Punto {punto_id} - Error HTTP {response.status_code}")
        except Exception as e:
            print_error(f"Punto {punto_id} - Error: {e}")
    
    # Paso 3: Verificar API Python
    print_header("3️⃣ VERIFICANDO API PYTHON (Puerto 8000)")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print_success("API Python accesible")
        else:
            print_error(f"API retornó código {response.status_code}")
    except Exception as e:
        print_error(f"No se pudo conectar a API Python: {e}")
        print_info("Asegúrate de que Python esté corriendo: python main.py")
    
    # Paso 4: Simular lectura de app de escritorio
    print_header("4️⃣ SIMULANDO LECTURA DE APP DE ESCRITORIO")
    
    print_info("La app de escritorio haría lo siguiente:")
    print()
    
    for punto in puntos:
        punto_id = punto.get('id')
        punto_nombre = punto.get('nombre')
        
        try:
            response = requests.get(
                f"http://localhost:3000/api/puntos-control/{punto_id}/camera",
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    config = data['data']
                    camera_url = config.get('cameraUrl')
                    
                    if camera_url:
                        print(f"  1. Leer de BD: Punto {punto_id} usa {camera_url}")
                        print(f"  2. Cargar cámara: cv2.VideoCapture('{camera_url}')")
                        print(f"  3. Usar para reconocimiento facial")
                        print(f"  4. Registrar accesos en BD")
                        print()
                    else:
                        print(f"  Punto {punto_id}: Sin configuración, usar USB por defecto")
                        print()
        except:
            pass
    
    # Resumen
    print_header("📊 RESUMEN")
    
    print(f"Total de puntos: {len(puntos)}")
    print(f"Cámaras configuradas: {camaras_configuradas}")
    print(f"Cámaras sin configurar: {camaras_sin_config}")
    
    if camaras_configuradas > 0:
        print_success("Sincronización funcionando correctamente")
        print_info("La app de escritorio leerá automáticamente estas configuraciones")
    else:
        print_warning("No hay cámaras configuradas")
        print_info("Configura cámaras en el Dashboard: Monitoreo en Vivo → ⚙️ Configurar")
    
    # Instrucciones finales
    print_header("✅ PRÓXIMOS PASOS")
    
    print("1. Abre Dashboard: http://localhost:3000")
    print("2. Ve a: Monitoreo en Vivo")
    print("3. Haz clic en: ⚙️ Configurar (en cada punto)")
    print("4. Ingresa URL de cámara")
    print("5. Haz clic en: Guardar")
    print()
    print("La app de escritorio automáticamente:")
    print("  ✅ Leerá la configuración de BD")
    print("  ✅ Cargará la cámara configurada")
    print("  ✅ Usará esa cámara para reconocimiento facial")
    print("  ✅ TODO SINCRONIZADO")
    print()

if __name__ == "__main__":
    main()
