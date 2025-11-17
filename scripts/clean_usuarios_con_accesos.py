"""
Script para eliminar usuarios sin rostros que tienen accesos registrados
Primero elimina los accesos, luego elimina los usuarios
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv(dotenv_path="../.env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")

async def clean_usuarios_con_accesos():
    """Elimina usuarios sin rostros incluyendo sus accesos"""
    
    print("🧹 LIMPIEZA DE USUARIOS SIN ROSTROS (CON ACCESOS)")
    print("=" * 70)
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Conectado a la base de datos\n")
        
        # Buscar usuarios sin rostros
        query_usuarios_sin_rostros = """
            SELECT u.id, u.nombre, u.apellido, u.email,
                   COUNT(DISTINCT r.id) as num_rostros,
                   COUNT(DISTINCT a.id) as num_accesos
            FROM usuarios u
            LEFT JOIN rostros r ON u.id = r.usuario_id
            LEFT JOIN accesos a ON u.id = a.usuario_id
            GROUP BY u.id, u.nombre, u.apellido, u.email
            HAVING COUNT(DISTINCT r.id) = 0
        """
        
        usuarios_sin_rostros = await conn.fetch(query_usuarios_sin_rostros)
        
        if not usuarios_sin_rostros:
            print("✅ No hay usuarios sin rostros para eliminar")
            await conn.close()
            return
        
        print(f"📊 Encontrados {len(usuarios_sin_rostros)} usuarios SIN rostros:\n")
        for usuario in usuarios_sin_rostros:
            accesos_info = f"({usuario['num_accesos']} accesos)" if usuario['num_accesos'] > 0 else "(sin accesos)"
            print(f"   - ID {usuario['id']}: {usuario['nombre']} {usuario['apellido']} {accesos_info}")
        
        print(f"\n🗑️  Eliminando usuarios y sus accesos...\n")
        
        # Eliminar usuarios con sus accesos
        eliminados = 0
        for usuario in usuarios_sin_rostros:
            try:
                # Primero eliminar accesos relacionados
                if usuario['num_accesos'] > 0:
                    accesos_eliminados = await conn.execute(
                        "DELETE FROM accesos WHERE usuario_id = $1",
                        usuario['id']
                    )
                    print(f"   🗑️  Usuario {usuario['id']}: Eliminados {usuario['num_accesos']} accesos")
                
                # Luego eliminar el usuario
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
        total_accesos = await conn.fetchval("SELECT COUNT(*) FROM accesos")
        
        print(f"   👥 Usuarios totales: {total_usuarios}")
        print(f"   🎭 Rostros totales: {total_rostros}")
        print(f"   🚪 Accesos totales: {total_accesos}")
        
        # Mostrar usuarios restantes
        query_usuarios_restantes = """
            SELECT u.id, u.nombre, u.apellido, 
                   COUNT(DISTINCT r.id) as num_rostros,
                   COUNT(DISTINCT a.id) as num_accesos
            FROM usuarios u
            LEFT JOIN rostros r ON u.id = r.usuario_id
            LEFT JOIN accesos a ON u.id = a.usuario_id
            GROUP BY u.id, u.nombre, u.apellido
            ORDER BY u.id
        """
        
        usuarios_restantes = await conn.fetch(query_usuarios_restantes)
        
        if usuarios_restantes:
            print(f"\n📋 Usuarios restantes ({len(usuarios_restantes)}):")
            for usuario in usuarios_restantes:
                print(f"   - Usuario {usuario['id']}: {usuario['nombre']} {usuario['apellido']}")
                print(f"      🎭 Rostros: {usuario['num_rostros']} | 🚪 Accesos: {usuario['num_accesos']}")
        
        # Cerrar conexión
        await conn.close()
        print("\n✅ LIMPIEZA COMPLETADA")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(clean_usuarios_con_accesos())
