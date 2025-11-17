"""
Script automático para eliminar usuarios sin rostros
Mantiene usuarios con rostros registrados
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv(dotenv_path="../.env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")

async def auto_clean():
    """Elimina automáticamente usuarios sin rostros"""
    
    print("🧹 LIMPIEZA AUTOMÁTICA DE USUARIOS SIN ROSTROS")
    print("=" * 70)
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Conectado a la base de datos\n")
        
        # Buscar usuarios sin rostros
        query_usuarios_sin_rostros = """
            SELECT u.id, u.nombre, u.apellido, u.email
            FROM usuarios u
            LEFT JOIN rostros r ON u.id = r.usuario_id
            GROUP BY u.id, u.nombre, u.apellido, u.email
            HAVING COUNT(r.id) = 0
        """
        
        usuarios_sin_rostros = await conn.fetch(query_usuarios_sin_rostros)
        
        if not usuarios_sin_rostros:
            print("✅ No hay usuarios sin rostros para eliminar")
            print("   Todos los usuarios tienen rostros registrados")
            await conn.close()
            return
        
        print(f"📊 Encontrados {len(usuarios_sin_rostros)} usuarios SIN rostros:\n")
        for usuario in usuarios_sin_rostros:
            print(f"   - ID {usuario['id']}: {usuario['nombre']} {usuario['apellido']} ({usuario['email']})")
        
        print(f"\n🗑️  Eliminando {len(usuarios_sin_rostros)} usuarios...")
        
        # Eliminar usuarios sin rostros
        eliminados = 0
        for usuario in usuarios_sin_rostros:
            try:
                await conn.execute(
                    "DELETE FROM usuarios WHERE id = $1",
                    usuario['id']
                )
                print(f"   ✅ Eliminado: Usuario {usuario['id']} - {usuario['nombre']} {usuario['apellido']}")
                eliminados += 1
            except Exception as e:
                print(f"   ❌ Error eliminando Usuario {usuario['id']}: {str(e)}")
        
        print(f"\n✅ {eliminados} usuarios eliminados exitosamente")
        
        # Mostrar estado final
        print("\n" + "=" * 70)
        print("📊 ESTADO FINAL:")
        print("=" * 70)
        
        total_usuarios = await conn.fetchval("SELECT COUNT(*) FROM usuarios")
        total_rostros = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        
        print(f"   👥 Usuarios totales: {total_usuarios}")
        print(f"   🎭 Rostros totales: {total_rostros}")
        
        # Mostrar usuarios restantes
        query_usuarios_restantes = """
            SELECT u.id, u.nombre, u.apellido, COUNT(r.id) as num_rostros
            FROM usuarios u
            LEFT JOIN rostros r ON u.id = r.usuario_id
            GROUP BY u.id, u.nombre, u.apellido
            ORDER BY u.id
        """
        
        usuarios_restantes = await conn.fetch(query_usuarios_restantes)
        
        if usuarios_restantes:
            print(f"\n📋 Usuarios restantes ({len(usuarios_restantes)}):")
            for usuario in usuarios_restantes:
                print(f"   - Usuario {usuario['id']}: {usuario['nombre']} {usuario['apellido']} ({usuario['num_rostros']} rostros)")
        
        # Cerrar conexión
        await conn.close()
        print("\n✅ LIMPIEZA COMPLETADA")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(auto_clean())
