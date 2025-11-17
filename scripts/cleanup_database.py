#!/usr/bin/env python3
"""
Script para limpiar embeddings antiguos de la base de datos
"""
import asyncpg
import asyncio
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")

async def cleanup_database():
    """Limpia los embeddings antiguos de la base de datos"""
    conn = None
    try:
        print("🔌 Conectando a la base de datos...")
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Ver estado actual
        print("\n📊 Estado actual de la base de datos:")
        
        # Contar rostros totales
        total_rostros = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        print(f"   Total de rostros: {total_rostros}")
        
        # Ver rostros por usuario
        usuarios_rostros = await conn.fetch("""
            SELECT u.nombre, u.email, COUNT(r.id) as rostros_count, u.activo
            FROM usuarios u
            LEFT JOIN rostros r ON u.id = r.usuario_id
            GROUP BY u.id, u.nombre, u.email, u.activo
            ORDER BY rostros_count DESC
        """)
        
        print("\n👥 Rostros por usuario:")
        for row in usuarios_rostros:
            status = "✅ Activo" if row['activo'] else "❌ Inactivo"
            print(f"   {row['nombre']} ({row['email']}): {row['rostros_count']} rostros - {status}")
        
        # Limpiar todos los rostros
        print(f"\n🧹 Eliminando {total_rostros} rostros antiguos...")
        deleted_count = await conn.execute("DELETE FROM rostros")
        print(f"✅ Eliminados {total_rostros} rostros exitosamente")
        
        # Verificar limpieza
        remaining_rostros = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        print(f"📊 Rostros restantes: {remaining_rostros}")
        
        print("\n🎉 ¡Base de datos limpiada exitosamente!")
        print("💡 Ahora puedes re-registrar tu rostro sin problemas de encriptación")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        if conn:
            await conn.close()
            print("🔌 Conexión cerrada")

if __name__ == "__main__":
    asyncio.run(cleanup_database())
