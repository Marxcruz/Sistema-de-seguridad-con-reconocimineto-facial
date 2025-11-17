#!/usr/bin/env python3
"""
Script: Descubrir Cámaras IP en tu Red
Prueba automáticamente URLs de streaming para todas tus cámaras
"""

import requests
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import json

# Configuración
CAMARAS_IP = [
    "192.168.1.102",  # Hikvision NVR
    "192.168.1.105",  # Hikvision IPCam
    "192.168.1.124",  # MiaoMing
    "192.168.1.101",  # Desconocida
    "192.168.1.103",  # Desconocida
    "192.168.1.107",  # Desconocida
    "192.168.1.109",  # Desconocida
    "192.168.1.114",  # Desconocida
    "192.168.1.116",  # Desconocida
]

# URLs a probar para cada cámara
URLS_STREAMING = {
    "Hikvision MJPEG Ch1": "/ISAPI/Streaming/channels/101/httppreview",
    "Hikvision MJPEG Ch2": "/ISAPI/Streaming/channels/102/httppreview",
    "Hikvision MJPEG Ch3": "/ISAPI/Streaming/channels/103/httppreview",
    "MiaoMing MJPEG": "/cgi-bin/mjpg/video.cgi",
    "Genérica Stream": "/stream",
    "Genérica MJPEG": "/mjpeg",
    "Genérica Video": "/video",
}

PUERTOS = [80, 8000, 8080]

CREDENCIALES = [
    ("admin", "12345"),      # Hikvision default
    ("admin", "admin"),      # Genérica
    ("admin", "admin123"),   # Alternativa
    ("root", "12345"),       # Alternativa
    ("", ""),                # Sin credenciales
]

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

def test_url(ip, puerto, ruta, usuario, contraseña):
    """Probar una URL de streaming"""
    url = f"http://{ip}:{puerto}{ruta}"
    
    try:
        auth = None
        if usuario or contraseña:
            auth = (usuario, contraseña)
        
        response = requests.head(
            url,
            auth=auth,
            timeout=2,
            verify=False
        )
        
        if response.status_code in [200, 206, 401]:
            return {
                "ip": ip,
                "puerto": puerto,
                "ruta": ruta,
                "url": url,
                "usuario": usuario,
                "contraseña": contraseña,
                "status": response.status_code,
                "tipo": "MJPEG" if "mjpeg" in ruta.lower() or "video" in ruta.lower() else "HTTP"
            }
    except:
        pass
    
    return None

def test_interfaz_web(ip, puerto):
    """Probar acceso a interfaz web"""
    url = f"http://{ip}:{puerto}/"
    
    try:
        response = requests.get(
            url,
            timeout=2,
            verify=False
        )
        
        if response.status_code in [200, 401]:
            return {
                "ip": ip,
                "puerto": puerto,
                "url": url,
                "status": response.status_code,
                "tipo": "Interfaz Web"
            }
    except:
        pass
    
    return None

def descubrir_camaras():
    """Descubrir todas las cámaras y sus URLs"""
    print_header("🔍 DESCUBRIMIENTO DE CÁMARAS IP")
    print(f"⏰ Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📍 Cámaras a escanear: {len(CAMARAS_IP)}")
    print(f"🔌 Puertos: {PUERTOS}")
    print(f"🔐 Credenciales a probar: {len(CREDENCIALES)}")
    
    resultados = {
        "interfaz_web": [],
        "streams_mjpeg": [],
        "no_accesibles": []
    }
    
    print_header("1️⃣ BUSCANDO INTERFACES WEB")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        
        for ip in CAMARAS_IP:
            for puerto in PUERTOS:
                futures.append(
                    executor.submit(test_interfaz_web, ip, puerto)
                )
        
        for future in as_completed(futures):
            resultado = future.result()
            if resultado:
                resultados["interfaz_web"].append(resultado)
                print_success(f"{resultado['ip']}:{resultado['puerto']} - Interfaz Web")
    
    print_header("2️⃣ BUSCANDO STREAMS MJPEG")
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = []
        
        for ip in CAMARAS_IP:
            for puerto in PUERTOS:
                for nombre_ruta, ruta in URLS_STREAMING.items():
                    for usuario, contraseña in CREDENCIALES:
                        futures.append(
                            executor.submit(
                                test_url,
                                ip, puerto, ruta, usuario, contraseña
                            )
                        )
        
        for future in as_completed(futures):
            resultado = future.result()
            if resultado:
                resultados["streams_mjpeg"].append(resultado)
                cred_str = f"{resultado['usuario']}:***" if resultado['usuario'] else "sin credenciales"
                print_success(
                    f"{resultado['ip']}:{resultado['puerto']}{resultado['ruta']} "
                    f"({cred_str})"
                )
    
    # Identificar cámaras no accesibles
    ips_encontradas = set()
    for r in resultados["interfaz_web"]:
        ips_encontradas.add(r["ip"])
    for r in resultados["streams_mjpeg"]:
        ips_encontradas.add(r["ip"])
    
    for ip in CAMARAS_IP:
        if ip not in ips_encontradas:
            resultados["no_accesibles"].append(ip)
    
    return resultados

def mostrar_resumen(resultados):
    """Mostrar resumen de resultados"""
    print_header("📊 RESUMEN DE RESULTADOS")
    
    print(f"✅ Interfaces Web encontradas: {len(resultados['interfaz_web'])}")
    for r in resultados["interfaz_web"]:
        print(f"   • {r['ip']}:{r['puerto']} → {r['url']}")
    
    print(f"\n✅ Streams MJPEG encontrados: {len(resultados['streams_mjpeg'])}")
    for r in resultados["streams_mjpeg"]:
        cred = f"{r['usuario']}:***" if r['usuario'] else "sin credenciales"
        print(f"   • {r['ip']}:{r['puerto']}{r['ruta']}")
        print(f"     Credenciales: {cred}")
        print(f"     URL completa: {r['url']}")
    
    if resultados["no_accesibles"]:
        print(f"\n❌ Cámaras no accesibles: {len(resultados['no_accesibles'])}")
        for ip in resultados["no_accesibles"]:
            print(f"   • {ip}")
    
    print()

def generar_configuracion(resultados):
    """Generar configuración para el dashboard"""
    print_header("⚙️ CONFIGURACIÓN PARA DASHBOARD")
    
    print("Copia y pega estas configuraciones en tu dashboard:\n")
    
    punto = 1
    for r in resultados["streams_mjpeg"]:
        print(f"PUNTO {punto}: {r['ip']}")
        print(f"  URL: {r['url']}")
        print(f"  Tipo: HTTP")
        if r['usuario']:
            print(f"  Usuario: {r['usuario']}")
            print(f"  Contraseña: {r['contraseña']}")
        print()
        punto += 1
    
    print()

def guardar_resultados(resultados):
    """Guardar resultados en archivo JSON"""
    filename = "camaras_descubiertas.json"
    
    # Convertir para JSON
    data = {
        "timestamp": datetime.now().isoformat(),
        "interfaz_web": resultados["interfaz_web"],
        "streams_mjpeg": resultados["streams_mjpeg"],
        "no_accesibles": resultados["no_accesibles"]
    }
    
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    
    print_success(f"Resultados guardados en: {filename}")

def main():
    """Función principal"""
    print("\n")
    print("╔════════════════════════════════════════════════════════╗")
    print("║  🎥 DESCUBRIDOR DE CÁMARAS IP                          ║")
    print("║  Sistema de Seguridad con Reconocimiento Facial        ║")
    print("╚════════════════════════════════════════════════════════╝")
    
    try:
        resultados = descubrir_camaras()
        mostrar_resumen(resultados)
        generar_configuracion(resultados)
        guardar_resultados(resultados)
        
        print_header("✅ DESCUBRIMIENTO COMPLETADO")
        print_info("Próximos pasos:")
        print_info("1. Abre http://localhost:3000 en tu navegador")
        print_info("2. Ve a 'Monitoreo en Vivo'")
        print_info("3. Configura cada punto con las URLs encontradas")
        print_info("4. Disfruta del monitoreo en tiempo real")
        
    except KeyboardInterrupt:
        print_error("\nDescubrimiento cancelado por el usuario")
        sys.exit(1)
    except Exception as e:
        print_error(f"Error durante descubrimiento: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
