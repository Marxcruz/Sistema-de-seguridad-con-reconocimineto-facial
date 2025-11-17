-- ============================================================================
-- SCRIPT DE MIGRACIÓN A DEEPFACE
-- ============================================================================
-- Este script limpia completamente los datos de rostros y usuarios
-- para comenzar fresh con embeddings de DeepFace ArcFace
-- ============================================================================

-- 1. MOSTRAR ESTADO ACTUAL
SELECT 'ESTADO ACTUAL DE LA BASE DE DATOS' as info;

SELECT 
    'Usuarios totales' as tipo,
    COUNT(*) as cantidad
FROM usuarios
UNION ALL
SELECT 
    'Rostros totales' as tipo,
    COUNT(*) as cantidad
FROM rostros
UNION ALL
SELECT 
    'Accesos registrados' as tipo,
    COUNT(*) as cantidad
FROM accesos
UNION ALL
SELECT 
    'Alertas generadas' as tipo,
    COUNT(*) as cantidad
FROM alertas;

-- 2. MOSTRAR USUARIOS EXISTENTES
SELECT 'USUARIOS EXISTENTES' as info;
SELECT 
    id,
    nombre,
    email,
    rol_id,
    activo,
    created_at
FROM usuarios
ORDER BY created_at DESC;

-- 3. MOSTRAR ROSTROS POR USUARIO
SELECT 'ROSTROS POR USUARIO' as info;
SELECT 
    u.nombre,
    u.email,
    COUNT(r.id) as rostros_count,
    MAX(r.created_at) as ultimo_rostro
FROM usuarios u
LEFT JOIN rostros r ON u.id = r.usuario_id
GROUP BY u.id, u.nombre, u.email
ORDER BY rostros_count DESC;

-- ============================================================================
-- LIMPIEZA COMPLETA (DESCOMENTA PARA EJECUTAR)
-- ============================================================================

-- PASO 1: Eliminar todos los rostros (embeddings incompatibles con DeepFace)
DELETE FROM rostros;

-- PASO 2: Eliminar usuarios de prueba (mantener solo usuarios del sistema)
DELETE FROM usuarios WHERE email NOT LIKE '%@sistema.com';

-- PASO 3: OPCIONAL - Limpiar historial de accesos (para empezar fresh)
-- DELETE FROM accesos;

-- PASO 4: OPCIONAL - Limpiar alertas
-- DELETE FROM alertas;

-- PASO 5: Reiniciar secuencias
ALTER SEQUENCE rostros_id_seq RESTART WITH 1;
ALTER SEQUENCE usuarios_id_seq RESTART WITH 5; -- Empezar después de usuarios del sistema
-- ALTER SEQUENCE accesos_id_seq RESTART WITH 1;   -- Solo si eliminaste accesos
-- ALTER SEQUENCE alertas_id_seq RESTART WITH 1;   -- Solo si eliminaste alertas

-- ============================================================================
-- VERIFICACIÓN POST-LIMPIEZA
-- ============================================================================

-- Verificar que la limpieza fue exitosa
SELECT 'POST-LIMPIEZA - VERIFICACIÓN' as info;

SELECT 
    'Usuarios restantes' as tipo,
    COUNT(*) as cantidad
FROM usuarios
UNION ALL
SELECT 
    'Rostros restantes' as tipo,
    COUNT(*) as cantidad
FROM rostros;

-- ============================================================================
-- INSTRUCCIONES DE USO:
-- ============================================================================
-- 1. Ejecuta primero las consultas SELECT para ver el estado actual
-- 2. Si quieres limpiar, descomenta las líneas DELETE
-- 3. Ejecuta las verificaciones al final
-- 4. Después registra nuevos usuarios con DeepFace
-- ============================================================================
