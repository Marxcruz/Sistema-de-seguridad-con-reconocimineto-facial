"""
Script para limpiar la base de datos del sistema de reconocimiento facial
Elimina usuarios sin rostros y rostros con embeddings corruptos
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv(dotenv_path="../.env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")

async def clean_database():
    """Limpia la base de datos eliminando datos inconsistentes"""
    
    print("🧹 INICIANDO LIMPIEZA DE BASE DE DATOS")
    print("=" * 70)
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Conectado a la base de datos\n")
        
        # 1. VERIFICAR USUARIOS SIN ROSTROS
        print("📊 PASO 1: Verificando usuarios sin rostros...")
        query_usuarios_sin_rostros = """
            SELECT u.id, u.nombre, u.apellido, u.email, 
                   COUNT(r.id) as num_rostros
            FROM usuarios u
            LEFT JOIN rostros r ON u.id = r.usuario_id
            GROUP BY u.id, u.nombre, u.apellido, u.email
            HAVING COUNT(r.id) = 0
        """
        
        usuarios_sin_rostros = await conn.fetch(query_usuarios_sin_rostros)
        
        if usuarios_sin_rostros:
            print(f"\n⚠️ Encontrados {len(usuarios_sin_rostros)} usuarios SIN rostros registrados:")
            for usuario in usuarios_sin_rostros:
                print(f"   - ID {usuario['id']}: {usuario['nombre']} {usuario['apellido']} ({usuario['email']})")
            
            # Preguntar si desea eliminar
            print("\n¿Deseas eliminar estos usuarios? (s/n): ", end="")
            respuesta = input().lower()
            
            if respuesta == 's':
                for usuario in usuarios_sin_rostros:
                    # Eliminar usuario
                    await conn.execute(
                        "DELETE FROM usuarios WHERE id = $1",
                        usuario['id']
                    )
                    print(f"   ✅ Eliminado: {usuario['nombre']} {usuario['apellido']}")
                
                print(f"\n✅ {len(usuarios_sin_rostros)} usuarios eliminados")
            else:
                print("   ⏭️ Usuarios sin rostros NO eliminados")
        else:
            print("   ✅ Todos los usuarios tienen rostros registrados")
        
        # 2. VERIFICAR ROSTROS CON EMBEDDINGS CORRUPTOS
        print("\n📊 PASO 2: Verificando integridad de embeddings...")
        query_rostros = """
            SELECT r.id, r.usuario_id, r.embedding, r.modelo,
                   u.nombre, u.apellido
            FROM rostros r
            JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.usuario_id
        """
        
        rostros = await conn.fetch(query_rostros)
        rostros_corruptos = []
        
        for rostro in rostros:
            try:
                embedding = rostro['embedding']
                if embedding is None or len(embedding) == 0:
                    rostros_corruptos.append(rostro)
                    print(f"   ⚠️ Rostro corrupto ID {rostro['id']} - Usuario: {rostro['nombre']} {rostro['apellido']}")
            except Exception as e:
                rostros_corruptos.append(rostro)
                print(f"   ❌ Error en rostro ID {rostro['id']}: {str(e)}")
        
        if rostros_corruptos:
            print(f"\n⚠️ Encontrados {len(rostros_corruptos)} rostros corruptos")
            print("¿Deseas eliminar estos rostros? (s/n): ", end="")
            respuesta = input().lower()
            
            if respuesta == 's':
                for rostro in rostros_corruptos:
                    await conn.execute(
                        "DELETE FROM rostros WHERE id = $1",
                        rostro['id']
                    )
                    print(f"   ✅ Eliminado rostro ID {rostro['id']}")
                
                print(f"\n✅ {len(rostros_corruptos)} rostros corruptos eliminados")
            else:
                print("   ⏭️ Rostros corruptos NO eliminados")
        else:
            print("   ✅ Todos los embeddings están en buen estado")
        
        # 3. RESUMEN FINAL
        print("\n" + "=" * 70)
        print("📊 RESUMEN FINAL:")
        print("=" * 70)
        
        # Contar usuarios activos
        total_usuarios = await conn.fetchval("SELECT COUNT(*) FROM usuarios")
        print(f"✅ Usuarios totales: {total_usuarios}")
        
        # Contar rostros por usuario
        query_resumen = """
            SELECT u.id, u.nombre, u.apellido, COUNT(r.id) as num_rostros
            FROM usuarios u
            LEFT JOIN rostros r ON u.id = r.usuario_id
            GROUP BY u.id, u.nombre, u.apellido
            ORDER BY u.id
        """
        
        resumen = await conn.fetch(query_resumen)
        print(f"\n📋 Rostros por usuario:")
        for usuario in resumen:
            print(f"   - Usuario {usuario['id']} ({usuario['nombre']} {usuario['apellido']}): {usuario['num_rostros']} rostros")
        
        # Cerrar conexión
        await conn.close()
        print("\n✅ LIMPIEZA COMPLETADA")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(clean_database())
