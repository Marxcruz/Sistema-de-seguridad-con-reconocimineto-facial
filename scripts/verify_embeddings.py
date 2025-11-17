#!/usr/bin/env python3
"""
Script para verificar embeddings en la base de datos
"""
import asyncpg
import asyncio
import os
import numpy as np
from dotenv import load_dotenv
from cryptography.fernet import Fernet

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

if ENCRYPTION_KEY:
    cipher_suite = Fernet(ENCRYPTION_KEY.encode())
else:
    print("❌ No se encontró ENCRYPTION_KEY en .env")
    exit(1)

def decrypt_embedding(encrypted_embedding: bytes) -> np.ndarray:
    """Descifra un embedding facial"""
    decrypted_bytes = cipher_suite.decrypt(encrypted_embedding)
    embedding = np.frombuffer(decrypted_bytes, dtype=np.float64)
    return embedding

async def verify_embeddings():
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Obtener todos los rostros
        query = """
        SELECT r.id, r.usuario_id, r.embedding, u.nombre, u.email
        FROM rostros r
        JOIN usuarios u ON r.usuario_id = u.id
        WHERE u.activo = true
        ORDER BY r.usuario_id, r.id
        """
        rows = await conn.fetch(query)
        
        print(f"📊 VERIFICACIÓN DE EMBEDDINGS EN BASE DE DATOS")
        print(f"=" * 60)
        print(f"Total de rostros encontrados: {len(rows)}")
        print()
        
        for row in rows:
            try:
                embedding = decrypt_embedding(row['embedding'])
                print(f"👤 Usuario: {row['nombre']} ({row['email']})")
                print(f"   ID Rostro: {row['id']}")
                print(f"   Dimensiones: {len(embedding)}")
                print(f"   Tipo: {'DeepFace (512)' if len(embedding) == 512 else 'Personalizado (3104)' if len(embedding) == 3104 else 'Desconocido'}")
                print(f"   Sample: [{embedding[0]:.4f}, {embedding[1]:.4f}, {embedding[2]:.4f}...]")
                print(f"   Rango: [{embedding.min():.4f}, {embedding.max():.4f}]")
                print()
                
            except Exception as e:
                print(f"❌ Error descifrando embedding {row['id']}: {str(e)}")
                print()
        
        # Verificar si hay mezcla de tipos
        dimensions = []
        for row in rows:
            try:
                embedding = decrypt_embedding(row['embedding'])
                dimensions.append(len(embedding))
            except:
                pass
        
        unique_dims = set(dimensions)
        if len(unique_dims) > 1:
            print("🚨 PROBLEMA DETECTADO: Mezcla de tipos de embeddings")
            print(f"   Dimensiones encontradas: {unique_dims}")
            print("   Esto puede causar errores de comparación!")
        else:
            print("✅ Todos los embeddings tienen las mismas dimensiones")
            
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(verify_embeddings())
