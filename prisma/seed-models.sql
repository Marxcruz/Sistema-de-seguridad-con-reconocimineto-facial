-- Script para insertar modelos faciales en la base de datos
-- Ejecutar este script en PostgreSQL para resolver el problema de modelo_id NULL

-- Insertar modelo DeepFace ArcFace (el que estás usando actualmente)
INSERT INTO modelos_faciales (nombre, version, descripcion, activo, creado_en, actualizado_en)
VALUES (
    'ArcFace',
    '1.0',
    'DeepFace ArcFace - Modelo pre-entrenado de alta precisión con 512 dimensiones. Entrenado con MS-Celeb-1M dataset.',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (nombre, version) DO NOTHING;

-- Opcional: Otros modelos de DeepFace que podrías usar en el futuro
INSERT INTO modelos_faciales (nombre, version, descripcion, activo, creado_en, actualizado_en)
VALUES 
(
    'VGG-Face',
    '1.0',
    'DeepFace VGG-Face - Modelo alternativo con 2622 dimensiones',
    false,
    NOW(),
    NOW()
),
(
    'Facenet',
    '1.0',
    'DeepFace Facenet - Modelo de Google con 128 dimensiones',
    false,
    NOW(),
    NOW()
),
(
    'OpenFace',
    '1.0',
    'DeepFace OpenFace - Modelo ligero con 128 dimensiones',
    false,
    NOW(),
    NOW()
)
ON CONFLICT (nombre, version) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT id, nombre, version, descripcion, activo 
FROM modelos_faciales 
ORDER BY activo DESC, nombre;
