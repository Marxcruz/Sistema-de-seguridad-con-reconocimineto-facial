-- Script de verificación para el sistema de alertas
-- Ejecutar para verificar que todo esté configurado correctamente

-- 1. Verificar tipos de alerta
SELECT '=== TIPOS DE ALERTA ===' as seccion;
SELECT id, nombre FROM tipo_alerta ORDER BY id;

-- 2. Verificar tipos de decisión
SELECT '=== TIPOS DE DECISIÓN ===' as seccion;
SELECT id, nombre FROM tipo_decision ORDER BY id;

-- 3. Verificar canales de notificación
SELECT '=== CANALES DE NOTIFICACIÓN ===' as seccion;
SELECT id, nombre FROM canal_notificacion ORDER BY id;

-- 4. Verificar puntos de control
SELECT '=== PUNTOS DE CONTROL ===' as seccion;
SELECT id, nombre, ubicacion, activo FROM puntos_control ORDER BY id;

-- 5. Verificar alertas recientes (últimas 10)
SELECT '=== ALERTAS RECIENTES ===' as seccion;
SELECT 
    a.id,
    ta.nombre as tipo,
    a.detalle,
    pc.nombre as punto,
    a.creado_en
FROM alertas a
LEFT JOIN tipo_alerta ta ON a.tipo_id = ta.id
LEFT JOIN puntos_control pc ON a.punto_id = pc.id
ORDER BY a.creado_en DESC
LIMIT 10;

-- 6. Verificar notificaciones recientes (últimas 10)
SELECT '=== NOTIFICACIONES RECIENTES ===' as seccion;
SELECT 
    n.id,
    n.alerta_id,
    cn.nombre as canal,
    n.destino,
    n.estado,
    n.creado_en
FROM notificaciones n
LEFT JOIN canal_notificacion cn ON n.canal_id = cn.id
ORDER BY n.creado_en DESC
LIMIT 10;

-- 7. Verificar accesos recientes (últimos 10)
SELECT '=== ACCESOS RECIENTES ===' as seccion;
SELECT 
    a.id,
    u.nombre || ' ' || COALESCE(u.apellido, '') as usuario,
    td.nombre as decision,
    pc.nombre as punto,
    a.fecha_hora
FROM accesos a
LEFT JOIN usuarios u ON a.usuario_id = u.id
LEFT JOIN tipo_decision td ON a.tipo_decision_id = td.id
LEFT JOIN puntos_control pc ON a.punto_id = pc.id
ORDER BY a.fecha_hora DESC
LIMIT 10;

-- 8. Resumen de estadísticas
SELECT '=== ESTADÍSTICAS GENERALES ===' as seccion;
SELECT 
    (SELECT COUNT(*) FROM alertas) as total_alertas,
    (SELECT COUNT(*) FROM notificaciones) as total_notificaciones,
    (SELECT COUNT(*) FROM accesos) as total_accesos,
    (SELECT COUNT(*) FROM accesos WHERE tipo_decision_id = 1) as accesos_permitidos,
    (SELECT COUNT(*) FROM accesos WHERE tipo_decision_id = 2) as accesos_denegados;
