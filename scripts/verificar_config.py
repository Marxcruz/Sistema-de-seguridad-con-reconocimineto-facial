#!/usr/bin/env python3
"""Script para verificar configuración de cámaras en puntos de control"""

import psycopg2
from psycopg2.extras import RealDictCursor

# Conectar a BD
conn = psycopg2.connect(
    host="localhost",
    database="sistema_seguridad_facial",
    user="postgres",
    password="jc123"
)

cursor = conn.cursor(cursor_factory=RealDictCursor)

# Consultar puntos de control
cursor.execute("""
    SELECT 
        id, 
        nombre, 
        camera_url, 
        camera_user,
        stream_type,
        activo
    FROM puntos_control 
    ORDER BY id
""")

puntos = cursor.fetchall()

print("\n" + "="*80)
print("CONFIGURACIÓN DE PUNTOS DE CONTROL")
print("="*80 + "\n")

for punto in puntos:
    print(f"📍 Punto ID: {punto['id']}")
    print(f"   Nombre: {punto['nombre']}")
    print(f"   Activo: {'✅' if punto['activo'] else '❌'}")
    print(f"   Camera URL: {punto['camera_url'] or '(no configurada - usa USB)'}")
    print(f"   Stream Type: {punto['stream_type'] or 'USB'}")
    print(f"   Usuario: {punto['camera_user'] or '(sin usuario)'}")
    print("-" * 80)

cursor.close()
conn.close()

print("\n✅ Verificación completada\n")
