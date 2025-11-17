"""
Script para RESETEAR todos los rostros de la base de datos
ADVERTENCIA: Esto eliminará TODOS los rostros registrados
Los usuarios se mantendrán pero sin rostros
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv(dotenv_path="../.env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")

async def reset_rostros():
    """Elimina TODOS los rostros de la base de datos"""
    
    print("⚠️  ADVERTENCIA: RESETEO COMPLETO DE ROSTROS")
    print("=" * 70)
    print("Este script eliminará TODOS los rostros registrados.")
    print("Los usuarios se mantendrán pero sin rostros asociados.")
    print("=" * 70)
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Conectado a la base de datos\n")
        
        # Contar rostros actuales
        total_rostros = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        print(f"📊 Rostros actuales en la base de datos: {total_rostros}")
        
        if total_rostros == 0:
            print("\n✅ No hay rostros para eliminar")
            await conn.close()
            return
        
        # Mostrar usuarios con rostros
        query_usuarios = """
            SELECT u.id, u.nombre, u.apellido, COUNT(r.id) as num_rostros
            FROM usuarios u
            LEFT JOIN rostros r ON u.id = r.usuario_id
            GROUP BY u.id, u.nombre, u.apellido
            HAVING COUNT(r.id) > 0
            ORDER BY u.id
        """
        
        usuarios_con_rostros = await conn.fetch(query_usuarios)
        print(f"\n📋 Usuarios con rostros ({len(usuarios_con_rostros)}):")
        for usuario in usuarios_con_rostros:
            print(f"   - Usuario {usuario['id']}: {usuario['nombre']} {usuario['apellido']} ({usuario['num_rostros']} rostros)")
        
        # Confirmación
        print("\n" + "=" * 70)
        print("⚠️  ¿ESTÁS SEGURO de que deseas eliminar TODOS los rostros?")
        print("   Esta acción NO se puede deshacer.")
        print("=" * 70)
        print("\nEscribe 'CONFIRMAR' para continuar o cualquier otra cosa para cancelar: ", end="")
        confirmacion = input()
        
        if confirmacion != "CONFIRMAR":
            print("\n❌ Operación cancelada")
            await conn.close()
            return
        
        # Eliminar todos los rostros
        print("\n🗑️  Eliminando rostros...")
        await conn.execute("DELETE FROM rostros")
        
        # Verificar eliminación
        rostros_restantes = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        
        if rostros_restantes == 0:
            print(f"✅ {total_rostros} rostros eliminados exitosamente")
            print("\n📊 Estado final:")
            print(f"   - Rostros: 0")
            
            # Contar usuarios
            total_usuarios = await conn.fetchval("SELECT COUNT(*) FROM usuarios")
            print(f"   - Usuarios: {total_usuarios} (sin rostros)")
            
            print("\n💡 Ahora puedes registrar nuevos rostros desde la aplicación")
        else:
            print(f"⚠️  Aún quedan {rostros_restantes} rostros en la base de datos")
        
        # Cerrar conexión
        await conn.close()
        print("\n✅ PROCESO COMPLETADO")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(reset_rostros())
