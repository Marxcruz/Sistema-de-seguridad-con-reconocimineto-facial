-- Script para limpiar embeddings antiguos que no se pueden descifrar
-- Esto eliminará rostros de usuarios inactivos o con embeddings corruptos

-- Ver cuántos rostros hay actualmente
SELECT COUNT(*) as total_rostros FROM rostros;

-- Ver rostros por usuario
SELECT u.nombre, u.email, COUNT(r.id) as rostros_count
FROM usuarios u
LEFT JOIN rostros r ON u.id = r.usuario_id
GROUP BY u.id, u.nombre, u.email
ORDER BY rostros_count DESC;

-- OPCIONAL: Eliminar rostros de usuarios inactivos
-- DELETE FROM rostros WHERE usuario_id IN (
--     SELECT id FROM usuarios WHERE activo = false
-- );

-- OPCIONAL: Mantener solo los rostros más recientes (últimos 30 días)
-- DELETE FROM rostros WHERE created_at < NOW() - INTERVAL '30 days';
