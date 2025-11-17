-- Verificar configuración de puntos de control
SELECT 
    id, 
    nombre, 
    camera_url, 
    camera_user,
    stream_type,
    activo
FROM puntos_control 
ORDER BY id;
