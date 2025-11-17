#!/usr/bin/env python3
import asyncpg
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")

async def cleanup():
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Estado antes
        usuarios_antes = await conn.fetchval("SELECT COUNT(*) FROM usuarios")
        rostros_antes = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        print(f"ANTES: {usuarios_antes} usuarios, {rostros_antes} rostros")
        
        # Limpieza (orden importante por claves foráneas)
        await conn.execute("DELETE FROM accesos WHERE usuario_id IN (SELECT id FROM usuarios WHERE email NOT LIKE '%@sistema.com')")
        await conn.execute("DELETE FROM rostros")
        await conn.execute("DELETE FROM usuarios WHERE email NOT LIKE '%@sistema.com'")
        await conn.execute("ALTER SEQUENCE rostros_id_seq RESTART WITH 1")
        await conn.execute("ALTER SEQUENCE usuarios_id_seq RESTART WITH 5")
        
        # Estado después
        usuarios_despues = await conn.fetchval("SELECT COUNT(*) FROM usuarios")
        rostros_despues = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        print(f"DESPUES: {usuarios_despues} usuarios, {rostros_despues} rostros")
        
        # Usuarios restantes
        usuarios = await conn.fetch("SELECT nombre, email FROM usuarios")
        print("USUARIOS RESTANTES:")
        for u in usuarios:
            print(f"  - {u['nombre']} ({u['email']})")
            
        print("LIMPIEZA COMPLETADA!")
        
    finally:
        await conn.close()

asyncio.run(cleanup())
