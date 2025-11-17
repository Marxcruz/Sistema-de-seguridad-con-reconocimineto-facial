# Sistema de Notificaciones en Tiempo Real

## 📋 Descripción

Sistema completo de notificaciones que muestra alertas de seguridad en tiempo real basadas en eventos del sistema de reconocimiento facial.

## 🎯 Funcionalidades

### ✅ Implementadas

1. **Panel de Notificaciones Desplegable**
   - Diseño moderno con overlay
   - Animaciones suaves
   - Responsive y accesible

2. **Contador Dinámico**
   - Muestra número de notificaciones no leídas
   - Actualización automática cada 30 segundos
   - Badge rojo con número (máx 9+)

3. **Filtros de Notificaciones**
   - Ver todas las notificaciones
   - Ver solo no leídas
   - Cambio instantáneo entre filtros

4. **Gestión de Estado**
   - Marcar individual como leída (clic en notificación)
   - Marcar todas como leídas (botón)
   - Persistencia en base de datos

5. **Priorización Visual**
   - **Alta** (roja): Accesos no autorizados, suplantación
   - **Media** (naranja): Liveness fallido, accesos denegados
   - **Baja** (azul): Eventos informativos

6. **Timestamps Inteligentes**
   - "Ahora" (< 1 min)
   - "Hace X min" (< 1 hora)
   - "Hace Xh" (< 24 horas)
   - "Hace Xd" (< 7 días)
   - Fecha completa (> 7 días)

## 🗂️ Estructura de Archivos

```
src/
├── components/
│   └── notifications/
│       ├── NotificationPanel.tsx    # Componente principal
│       └── README.md                # Esta documentación
├── app/
│   └── api/
│       └── notifications/
│           ├── route.ts             # GET: Listar notificaciones
│           ├── [id]/
│           │   └── read/
│           │       └── route.ts     # POST: Marcar como leída
│           └── read-all/
│               └── route.ts         # POST: Marcar todas
└── types/
    └── notifications.ts             # Tipos TypeScript
```

## 🔌 API Endpoints

### GET `/api/notifications`

Obtiene lista de notificaciones.

**Query Parameters:**
- `filter`: `'todas'` | `'no_leidas'` (default: `'no_leidas'`)
- `limit`: Número máximo de resultados (default: `50`)

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "tipo": "acceso_denegado",
      "detalle": "Usuario no registrado intentó acceder",
      "creadoEn": "2025-10-16T10:30:00Z",
      "puntoNombre": "Entrada Principal",
      "leida": false,
      "prioridad": "alta"
    }
  ],
  "unreadCount": 3,
  "total": 15
}
```

### POST `/api/notifications/[id]/read`

Marca una notificación específica como leída.

**Response:**
```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

### POST `/api/notifications/read-all`

Marca todas las notificaciones como leídas.

**Response:**
```json
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas",
  "updated": 5
}
```

## 🎨 Componente NotificationPanel

### Props

```typescript
interface NotificationPanelProps {
  isOpen: boolean      // Controla visibilidad del panel
  onClose: () => void  // Callback al cerrar
}
```

### Uso

```tsx
import NotificationPanel from '@/components/notifications/NotificationPanel'

function Header() {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <>
      <button onClick={() => setShowNotifications(true)}>
        Notificaciones
      </button>
      
      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  )
}
```

## 🔄 Flujo de Datos

1. **Generación de Alertas**
   - Sistema de reconocimiento facial detecta evento
   - Se crea registro en tabla `alertas`
   - Opcionalmente se crea en tabla `notificaciones`

2. **Consulta de Notificaciones**
   - Frontend consulta `/api/notifications`
   - API consulta tabla `alertas` con relaciones
   - Transforma a formato de notificaciones
   - Determina prioridad y estado "leída"

3. **Marcado como Leída**
   - Usuario hace clic en notificación
   - Frontend llama `/api/notifications/[id]/read`
   - API actualiza/crea registro en `notificaciones`
   - Estado cambia a `'enviada'`

## 🗄️ Base de Datos

### Tabla `alertas`
```sql
- id (PK)
- uuid
- tipo_id (FK → tipo_alerta)
- detalle
- punto_id (FK → puntos_control)
- evidencia_id (FK → evidencias)
- creado_en
```

### Tabla `notificaciones`
```sql
- id (PK)
- alerta_id (FK → alertas)
- canal_id (FK → canal_notificacion)
- destino
- estado ('pendiente' | 'enviada' | 'fallida')
- creado_en
```

### Lógica de "Leída"
Una notificación se considera "leída" cuando:
- Existe registro en `notificaciones` con `estado = 'enviada'`
- Se crea automáticamente al marcar como leída

## 🎯 Tipos de Alertas Soportados

| Tipo | Prioridad | Descripción |
|------|-----------|-------------|
| `acceso_denegado` | Media | Usuario registrado sin permisos |
| `intento_no_autorizado` | Alta | Persona no registrada |
| `liveness_fallido` | Media | Falla en detección de vida |
| `suplantacion` | Alta | Intento con foto/video |
| `acceso_exitoso` | Baja | Acceso autorizado (informativo) |

## 🚀 Mejoras Futuras

- [ ] WebSocket para notificaciones en tiempo real
- [ ] Sonido de notificación configurable
- [ ] Filtros por tipo de alerta
- [ ] Búsqueda de notificaciones
- [ ] Exportar historial de notificaciones
- [ ] Notificaciones push del navegador
- [ ] Integración con Telegram/Email

## 🔒 Seguridad

- ✅ Validación de IDs en endpoints
- ✅ Manejo de errores robusto
- ✅ Sin exposición de datos sensibles
- ✅ Consultas optimizadas con límites
- ⚠️ TODO: Agregar autenticación JWT a endpoints
- ⚠️ TODO: Validar permisos por rol de usuario

## 📊 Performance

- Consultas limitadas a 50 notificaciones por defecto
- Índices en `alertas.creado_en` para ordenamiento rápido
- Actualización automática cada 30 segundos (configurable)
- Lazy loading del panel (solo carga al abrir)

## 🐛 Troubleshooting

### No aparecen notificaciones
1. Verificar que existan registros en tabla `alertas`
2. Revisar logs del servidor en consola
3. Verificar conexión a base de datos

### Contador no se actualiza
1. Verificar que el intervalo esté activo (30s)
2. Revisar errores en consola del navegador
3. Verificar endpoint `/api/notifications`

### Error al marcar como leída
1. Verificar que el ID de alerta exista
2. Revisar permisos de base de datos
3. Verificar logs del servidor
