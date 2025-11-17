"""
Script para verificar el estado de la base de datos
Solo muestra información, NO hace cambios
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv
import numpy as np

# Cargar variables de entorno
load_dotenv(dotenv_path="../.env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")

async def check_database_status():
    """Verifica el estado de la base de datos sin hacer cambios"""
    
    print("🔍 VERIFICACIÓN DE ESTADO DE BASE DE DATOS")
    print("=" * 70)
    
    try:
        # Conectar a la base de datos
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Conectado a la base de datos\n")
        
        # 1. ESTADÍSTICAS GENERALES
        print("📊 ESTADÍSTICAS GENERALES:")
        print("-" * 70)
        
        total_usuarios = await conn.fetchval("SELECT COUNT(*) FROM usuarios")
        total_rostros = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        total_accesos = await conn.fetchval("SELECT COUNT(*) FROM accesos")
        total_alertas = await conn.fetchval("SELECT COUNT(*) FROM alertas")
        
        print(f"   👥 Usuarios totales: {total_usuarios}")
        print(f"   🎭 Rostros totales: {total_rostros}")
        print(f"   🚪 Accesos registrados: {total_accesos}")
        print(f"   🚨 Alertas generadas: {total_alertas}")
        
        # 2. USUARIOS Y SUS ROSTROS
        print("\n📋 USUARIOS Y ROSTROS:")
        print("-" * 70)
        
        query_usuarios = """
            SELECT u.id, u.nombre, u.apellido, u.email, u.documento, 
                   r.nombre as rol, u.activo,
                   COUNT(ros.id) as num_rostros
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            LEFT JOIN rostros ros ON u.id = ros.usuario_id
            GROUP BY u.id, u.nombre, u.apellido, u.email, u.documento, r.nombre, u.activo
            ORDER BY u.id
        """
        
        usuarios = await conn.fetch(query_usuarios)
        
        for usuario in usuarios:
            estado = "🟢 Activo" if usuario['activo'] else "🔴 Inactivo"
            rostros_info = f"🎭 {usuario['num_rostros']} rostros" if usuario['num_rostros'] > 0 else "⚠️  Sin rostros"
            
            print(f"\n   Usuario {usuario['id']}: {usuario['nombre']} {usuario['apellido']}")
            print(f"      Email: {usuario['email']}")
            print(f"      Documento: {usuario['documento']}")
            print(f"      Rol: {usuario['rol']}")
            print(f"      Estado: {estado}")
            print(f"      Rostros: {rostros_info}")
        
        # 3. ANÁLISIS DE EMBEDDINGS
        print("\n\n🧠 ANÁLISIS DE EMBEDDINGS:")
        print("-" * 70)
        
        query_rostros = """
            SELECT r.id, r.usuario_id, r.embedding, r.modelo,
                   u.nombre, u.apellido
            FROM rostros r
            JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.usuario_id, r.id
        """
        
        rostros = await conn.fetch(query_rostros)
        
        if not rostros:
            print("   ⚠️  NO HAY ROSTROS REGISTRADOS")
        else:
            embeddings_por_dimension = {}
            embeddings_corruptos = []
            
            for rostro in rostros:
                try:
                    embedding = rostro['embedding']
                    if embedding is None or len(embedding) == 0:
                        embeddings_corruptos.append(rostro)
                        continue
                    
                    # Contar dimensiones
                    dim = len(embedding)
                    if dim not in embeddings_por_dimension:
                        embeddings_por_dimension[dim] = []
                    embeddings_por_dimension[dim].append(rostro)
                    
                except Exception as e:
                    embeddings_corruptos.append(rostro)
            
            # Mostrar resumen por dimensión
            print(f"\n   📊 Embeddings por dimensión:")
            for dim, rostros_dim in sorted(embeddings_por_dimension.items()):
                tipo = "DeepFace ArcFace" if dim == 512 else "Personalizado" if dim == 3104 else "Desconocido"
                print(f"      {dim} dimensiones ({tipo}): {len(rostros_dim)} rostros")
                for rostro in rostros_dim:
                    print(f"         - Rostro ID {rostro['id']}: {rostro['nombre']} {rostro['apellido']}")
            
            # Mostrar embeddings corruptos
            if embeddings_corruptos:
                print(f"\n   ⚠️  Embeddings corruptos: {len(embeddings_corruptos)}")
                for rostro in embeddings_corruptos:
                    print(f"      - Rostro ID {rostro['id']}: {rostro['nombre']} {rostro['apellido']}")
            else:
                print(f"\n   ✅ Todos los embeddings están en buen estado")
        
        # 4. ÚLTIMOS ACCESOS
        print("\n\n🚪 ÚLTIMOS 10 ACCESOS:")
        print("-" * 70)
        
        query_accesos = """
            SELECT a.id, a.timestamp, a.decision, a.confianza,
                   u.nombre, u.apellido,
                   pc.nombre as punto_control
            FROM accesos a
            LEFT JOIN usuarios u ON a.usuario_id = u.id
            LEFT JOIN puntos_control pc ON a.punto_control_id = pc.id
            ORDER BY a.timestamp DESC
            LIMIT 10
        """
        
        accesos = await conn.fetch(query_accesos)
        
        if not accesos:
            print("   ℹ️  No hay accesos registrados")
        else:
            for acceso in accesos:
                usuario_info = f"{acceso['nombre']} {acceso['apellido']}" if acceso['nombre'] else "Desconocido"
                decision_icon = "✅" if acceso['decision'] == "PERMITIDO" else "❌"
                confianza_pct = f"{acceso['confianza']*100:.1f}%" if acceso['confianza'] else "N/A"
                
                print(f"   {decision_icon} {acceso['timestamp'].strftime('%Y-%m-%d %H:%M:%S')} - {usuario_info}")
                print(f"      Punto: {acceso['punto_control']} | Confianza: {confianza_pct}")
        
        # Cerrar conexión
        await conn.close()
        
        print("\n" + "=" * 70)
        print("✅ VERIFICACIÓN COMPLETADA")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_database_status())
