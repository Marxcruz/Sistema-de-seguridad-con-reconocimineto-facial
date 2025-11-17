#!/usr/bin/env python3
"""
Script para debuggear los embeddings en la base de datos
"""
import asyncpg
import asyncio
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")

async def debug_embeddings():
    """Debug de embeddings en la base de datos"""
    conn = None
    try:
        print("🔌 Conectando a la base de datos...")
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Ver usuarios activos
        print("\n👥 Usuarios activos:")
        usuarios = await conn.fetch("""
            SELECT id, nombre, email, activo 
            FROM usuarios 
            WHERE activo = true
            ORDER BY id DESC
        """)
        
        for user in usuarios:
            print(f"   ID: {user['id']} - {user['nombre']} ({user['email']})")
        
        # Ver rostros por usuario
        print("\n🎭 Rostros registrados:")
        rostros = await conn.fetch("""
            SELECT r.id, r.usuario_id, u.nombre, u.email, 
                   LENGTH(r.embedding) as embedding_size,
                   r.creado_en
            FROM rostros r
            JOIN usuarios u ON r.usuario_id = u.id
            WHERE u.activo = true
            ORDER BY r.creado_en DESC
        """)
        
        if rostros:
            for rostro in rostros:
                print(f"   Rostro ID: {rostro['id']} - Usuario: {rostro['nombre']} - Tamaño: {rostro['embedding_size']} bytes")
        else:
            print("   ❌ No hay rostros registrados")
        
        # Verificar último usuario registrado
        if usuarios:
            ultimo_usuario = usuarios[0]
            print(f"\n🔍 Verificando último usuario: {ultimo_usuario['nombre']} (ID: {ultimo_usuario['id']})")
            
            rostros_usuario = await conn.fetch("""
                SELECT id, LENGTH(embedding) as size, creado_en
                FROM rostros 
                WHERE usuario_id = $1
                ORDER BY creado_en DESC
            """, ultimo_usuario['id'])
            
            print(f"   Rostros encontrados: {len(rostros_usuario)}")
            for i, rostro in enumerate(rostros_usuario, 1):
                print(f"   Rostro {i}: ID {rostro['id']}, Tamaño: {rostro['size']} bytes")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        if conn:
            await conn.close()
            print("\n🔌 Conexión cerrada")

if __name__ == "__main__":
    asyncio.run(debug_embeddings())
