-- Verificar alertas en la base de datos
SELECT 
  a.id,
  a.tipo_id,
  ta.nombre as tipo_nombre,
  a.detalle,
  a.creado_en,
  a.creado_en AT TIME ZONE 'UTC' as creado_en_utc,
  a.creado_en AT TIME ZONE 'America/Bogota' as creado_en_local
FROM alertas a
JOIN tipo_alerta ta ON a.tipo_id = ta.id
WHERE a.creado_en >= DATE_TRUNC('month', CURRENT_DATE)
ORDER BY a.creado_en DESC
LIMIT 20;

-- Verificar rango de fechas
SELECT 
  DATE_TRUNC('month', CURRENT_DATE) as inicio_mes,
  CURRENT_DATE as hoy,
  NOW() as ahora,
  NOW() AT TIME ZONE 'America/Bogota' as ahora_local;

-- Contar alertas por tipo (este mes)
SELECT 
  ta.nombre,
  COUNT(a.id) as cantidad
FROM alertas a
JOIN tipo_alerta ta ON a.tipo_id = ta.id
WHERE a.creado_en >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY ta.nombre
ORDER BY cantidad DESC;
