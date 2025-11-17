#!/usr/bin/env python3
"""
Script para ejecutar la limpieza de base de datos para migración a DeepFace
"""
import asyncpg
import asyncio
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")

async def execute_cleanup():
    """Ejecuta la limpieza completa de la base de datos"""
    conn = None
    try:
        print("🔌 Conectando a la base de datos...")
        conn = await asyncpg.connect(DATABASE_URL)
        
        print("\n📊 ESTADO ANTES DE LA LIMPIEZA:")
        
        # Ver estado actual
        usuarios_count = await conn.fetchval("SELECT COUNT(*) FROM usuarios")
        rostros_count = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        print(f"   Usuarios totales: {usuarios_count}")
        print(f"   Rostros totales: {rostros_count}")
        
        # Mostrar usuarios existentes
        usuarios = await conn.fetch("""
            SELECT nombre, email, activo 
            FROM usuarios 
            ORDER BY id DESC
        """)
        print("\n👥 Usuarios existentes:")
        for user in usuarios:
            print(f"   - {user['nombre']} ({user['email']}) - {'Activo' if user['activo'] else 'Inactivo'}")
        
        print("\n🗑️ EJECUTANDO LIMPIEZA...")
        
        # PASO 1: Eliminar todos los rostros
        rostros_deleted = await conn.execute("DELETE FROM rostros")
        print(f"   ✅ Rostros eliminados: {rostros_deleted.split()[-1] if rostros_deleted else '0'}")
        
        # PASO 2: Eliminar usuarios de prueba (mantener usuarios del sistema)
        usuarios_deleted = await conn.execute("DELETE FROM usuarios WHERE email NOT LIKE '%@sistema.com'")
        print(f"   ✅ Usuarios de prueba eliminados: {usuarios_deleted.split()[-1] if usuarios_deleted else '0'}")
        
        # PASO 3: Reiniciar secuencias
        await conn.execute("ALTER SEQUENCE rostros_id_seq RESTART WITH 1")
        await conn.execute("ALTER SEQUENCE usuarios_id_seq RESTART WITH 5")
        print("   ✅ Secuencias reiniciadas")
        
        print("\n📊 ESTADO DESPUÉS DE LA LIMPIEZA:")
        
        # Verificar limpieza
        usuarios_restantes = await conn.fetchval("SELECT COUNT(*) FROM usuarios")
        rostros_restantes = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        print(f"   Usuarios restantes: {usuarios_restantes}")
        print(f"   Rostros restantes: {rostros_restantes}")
        
        # Mostrar usuarios que quedaron
        usuarios_finales = await conn.fetch("""
            SELECT nombre, email, activo 
            FROM usuarios 
            ORDER BY id DESC
        """)
        print("\n👥 Usuarios que se mantuvieron:")
        for user in usuarios_finales:
            print(f"   - {user['nombre']} ({user['email']}) - {'Activo' if user['activo'] else 'Inactivo'}")
        
        print("\n🎉 LIMPIEZA COMPLETADA EXITOSAMENTE!")
        print("📋 Próximos pasos:")
        print("   1. Iniciar aplicación de escritorio")
        print("   2. Registrar nuevos usuarios con DeepFace")
        print("   3. Probar reconocimiento sin falsos positivos")
        
    except Exception as e:
        print(f"❌ Error durante la limpieza: {str(e)}")
        return False
    finally:
        if conn:
            await conn.close()
            print("🔌 Conexión cerrada")
    
    return True

if __name__ == "__main__":
    print("🚀 INICIANDO LIMPIEZA DE BASE DE DATOS PARA DEEPFACE")
    print("=" * 60)
    
    success = asyncio.run(execute_cleanup())
    
    if success:
        print("\n✅ Base de datos lista para DeepFace!")
    else:
        print("\n❌ Error en la limpieza. Revisa los logs.")
