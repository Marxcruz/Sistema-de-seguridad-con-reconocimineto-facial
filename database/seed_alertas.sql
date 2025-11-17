-- Script para asegurar que los tipos de alerta y otros catálogos existan
-- Ejecutar este script si las alertas no se están creando

-- Tipos de Alerta
INSERT INTO tipo_alerta (id, nombre) VALUES 
(1, 'acceso_denegado'),
(2, 'intento_no_autorizado'),
(3, 'liveness_fallido'),
(4, 'suplantacion'),
(5, 'acceso_exitoso')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Tipos de Decisión
INSERT INTO tipo_decision (id, nombre) VALUES 
(1, 'PERMITIDO'),
(2, 'DENEGADO')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Canales de Notificación
INSERT INTO canal_notificacion (id, nombre) VALUES 
(1, 'Sistema'),
(2, 'Email'),
(3, 'Telegram'),
(4, 'SMS')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Tipos de Punto de Control
INSERT INTO tipo_punto (id, nombre) VALUES 
(1, 'Entrada'),
(2, 'Salida'),
(3, 'Acceso Restringido')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Punto de Control por defecto (si no existe)
INSERT INTO puntos_control (id, nombre, ubicacion, tipo_id, activo)
VALUES (1, 'Entrada Principal', 'Recepción', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Verificar datos insertados
SELECT 'Tipos de Alerta:' as tabla, COUNT(*) as registros FROM tipo_alerta
UNION ALL
SELECT 'Tipos de Decisión:', COUNT(*) FROM tipo_decision
UNION ALL
SELECT 'Canales de Notificación:', COUNT(*) FROM canal_notificacion
UNION ALL
SELECT 'Tipos de Punto:', COUNT(*) FROM tipo_punto
UNION ALL
SELECT 'Puntos de Control:', COUNT(*) FROM puntos_control;
