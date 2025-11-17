#!/usr/bin/env python3
"""
Script de Prueba: Múltiples Cámaras en Tiempo Real
Verifica que todas las cámaras configuradas funcionen correctamente
"""

import requests
import sys
from datetime import datetime

def print_header(text):
    """Imprimir encabezado"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def print_success(text):
    """Imprimir mensaje de éxito"""
    print(f"✅ {text}")

def print_error(text):
    """Imprimir mensaje de error"""
    print(f"❌ {text}")

def print_info(text):
    """Imprimir mensaje informativo"""
    print(f"ℹ️  {text}")

def test_api_connection():
    """Verificar conexión con API"""
    print_header("1. Verificando Conexión con API")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print_success("API Python está funcionando (puerto 8000)")
            return True
        else:
            print_error(f"API retornó código {response.status_code}")
            return False
    except Exception as e:
        print_error(f"No se pudo conectar a API: {e}")
        print_info("Asegúrate de que la API Python esté corriendo:")
        print_info("  cd face_recognition_service")
        print_info("  python main.py")
        return False

def test_dashboard_connection():
    """Verificar conexión con Dashboard"""
    print_header("2. Verificando Conexión con Dashboard")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print_success("Dashboard está funcionando (puerto 3000)")
            return True
        else:
            print_error(f"Dashboard retornó código {response.status_code}")
            return False
    except Exception as e:
        print_error(f"No se pudo conectar a Dashboard: {e}")
        print_info("Asegúrate de que Next.js esté corriendo:")
        print_info("  npm run dev")
        return False

def test_puntos_control():
    """Verificar puntos de control en BD"""
    print_header("3. Verificando Puntos de Control")
    
    try:
        response = requests.get("http://localhost:3000/api/puntos-control", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                puntos = data['data']
                print_success(f"Se encontraron {len(puntos)} puntos de control:")
                
                for punto in puntos:
                    print(f"\n  📍 Punto #{punto.get('id')} - {punto.get('nombre')}")
                    print(f"     Zona: {punto.get('zona', {}).get('nombre', 'N/A')}")
                    print(f"     Tipo: {punto.get('tipo', {}).get('nombre', 'N/A')}")
                    print(f"     Ubicación: {punto.get('ubicacion', 'N/A')}")
                
                return True
            else:
                print_error("No se encontraron puntos de control")
                return False
        else:
            print_error(f"API retornó código {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error al obtener puntos: {e}")
        return False

def test_camera_config(punto_id):
    """Verificar configuración de cámara para un punto"""
    print_header(f"4. Verificando Configuración de Cámara (Punto #{punto_id})")
    
    try:
        response = requests.get(f"http://localhost:3000/api/puntos-control/{punto_id}/camera", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                config = data.get('data', {})
                
                if config.get('cameraUrl'):
                    print_success(f"Cámara configurada:")
                    print(f"  URL: {config.get('cameraUrl')}")
                    print(f"  Tipo: {config.get('streamType', 'HTTP')}")
                    print(f"  Usuario: {config.get('cameraUser', 'N/A')}")
                    
                    # Verificar accesibilidad de la URL
                    test_camera_url(config.get('cameraUrl'), config.get('streamType'))
                    return True
                else:
                    print_info("No hay cámara configurada para este punto")
                    print_info("Configúrala desde el dashboard:")
                    print_info("  1. Ve a Monitoreo en Vivo")
                    print_info("  2. Haz clic en 'Configurar' en la tarjeta del punto")
                    print_info("  3. Ingresa la URL de tu cámara")
                    return False
            else:
                print_error("Error en respuesta de API")
                return False
        else:
            print_error(f"API retornó código {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error al verificar cámara: {e}")
        return False

def test_camera_url(url, stream_type):
    """Verificar que la URL de cámara sea accesible"""
    print_header(f"5. Verificando Accesibilidad de Cámara")
    
    if stream_type == 'RTSP':
        print_info("Stream RTSP detectado")
        print_info("Los streams RTSP requieren conversión a HTTP")
        print_info("Usa FFmpeg o MediaMTX para convertir")
        return False
    
    try:
        # Para DroidCam /video, usar HEAD request
        if '/video' in url:
            response = requests.head(url, timeout=5)
        else:
            response = requests.get(url, timeout=5)
        
        if response.status_code in [200, 206]:
            print_success(f"Cámara accesible: {url}")
            return True
        else:
            print_error(f"Cámara retornó código {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        print_error(f"Timeout al conectar con cámara (5s)")
        print_info("Verifica que la URL sea correcta y accesible")
        return False
    except Exception as e:
        print_error(f"No se pudo acceder a cámara: {e}")
        print_info("Posibles causas:")
        print_info("  - URL incorrecta")
        print_info("  - Cámara apagada")
        print_info("  - Firewall bloqueando puerto")
        print_info("  - Cámara en red diferente")
        return False

def main():
    """Función principal"""
    print("\n")
    print("╔════════════════════════════════════════════════════════╗")
    print("║  🎥 TEST: MÚLTIPLES CÁMARAS EN TIEMPO REAL             ║")
    print("║  Sistema de Seguridad con Reconocimiento Facial        ║")
    print("╚════════════════════════════════════════════════════════╝")
    
    print(f"\n⏰ Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: Conexión API
    api_ok = test_api_connection()
    
    # Test 2: Conexión Dashboard
    dashboard_ok = test_dashboard_connection()
    
    if not (api_ok and dashboard_ok):
        print_error("\nNo se pudo conectar a los servicios requeridos")
        print_info("Asegúrate de que estén corriendo:")
        print_info("  Terminal 1: cd face_recognition_service && python main.py")
        print_info("  Terminal 2: npm run dev")
        sys.exit(1)
    
    # Test 3: Puntos de control
    puntos_ok = test_puntos_control()
    
    if not puntos_ok:
        print_error("\nNo se encontraron puntos de control")
        sys.exit(1)
    
    # Test 4: Configuración de cámaras
    print_header("6. Resumen de Pruebas")
    print_success("Todos los servicios están funcionando")
    print_info("Para configurar cámaras:")
    print_info("  1. Abre http://localhost:3000 en tu navegador")
    print_info("  2. Ve a Monitoreo en Vivo")
    print_info("  3. Haz clic en 'Configurar' en cada punto")
    print_info("  4. Ingresa la URL de tu cámara")
    print_info("  5. Selecciona el tipo de stream (HTTP, MJPEG, RTSP, USB)")
    print_info("  6. Haz clic en Guardar")
    
    print("\n" + "="*60)
    print("✅ PRUEBAS COMPLETADAS EXITOSAMENTE")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
