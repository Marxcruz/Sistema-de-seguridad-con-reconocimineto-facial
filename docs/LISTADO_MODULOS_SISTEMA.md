# 📋 LISTADO COMPLETO DE MÓDULOS DEL SISTEMA
## Sistema de Seguridad con Reconocimiento Facial

**Versión:** 1.0.0  
**Fecha:** Octubre 2025  
**Proyecto:** Tesina - Sistema de Reconocimiento Facial

---

## 🏗️ ARQUITECTURA DEL SISTEMA

El sistema está compuesto por **3 aplicaciones principales**:

1. **Dashboard Web (Next.js)** - Puerto 3000
2. **API de Reconocimiento Facial (Python/FastAPI)** - Puerto 8000
3. **Aplicación de Escritorio (Python/Tkinter)** - Puntos de acceso

---

## 🖥️ MÓDULOS DEL DASHBOARD WEB (Frontend)

### **1. 🏠 Inicio / Home**
- **Ruta:** `/`
- **Archivo:** `src/app/page.tsx`
- **Descripción:** Página de bienvenida con información del sistema
- **Funcionalidades:**
  - Resumen del sistema
  - Navegación rápida a módulos
  - Estadísticas generales

### **2. 📊 Dashboard**
- **Ruta:** `/dashboard`
- **Archivo:** `src/app/dashboard/page.tsx`
- **Descripción:** Panel principal de control y estadísticas
- **Funcionalidades:**
  - Accesos hoy
  - Alertas hoy
  - Usuarios activos
  - Puntos de control activos
  - Gráfico de accesos por hora
  - Gráfico de alertas por tipo
  - Top 5 usuarios del mes
  - Accesos por decisión (Permitido/Denegado)
  - Resumen general del sistema

### **3. 👥 Gestión de Usuarios**
- **Ruta:** `/usuarios`
- **Archivo:** `src/app/usuarios/page.tsx`
- **Descripción:** Módulo principal de administración de usuarios del sistema

#### **3.1. 📋 Listado de Usuarios**
- **Componente:** Tabla principal en `page.tsx`
- **Descripción:** Visualización de todos los usuarios registrados
- **Funcionalidades:**
  - ✅ Tabla con paginación automática
  - ✅ Búsqueda por nombre, email o documento
  - ✅ Filtro por rol (Admin, Empleado, Visitante)
  - ✅ Filtro por estado (Activo/Inactivo)
  - ✅ Ordenamiento por columnas
  - ✅ Indicadores visuales de estado
- **Columnas mostradas:**
  - Foto de perfil
  - Nombre completo
  - Email
  - Documento de identidad
  - Rol asignado
  - Estado (Activo/Inactivo)
  - Número de rostros registrados
  - Fecha de registro
  - Acciones disponibles

#### **3.2. ➕ Crear Usuario**
- **Componente:** `CreateUserModal.tsx`
- **Descripción:** Formulario de registro de nuevos usuarios
- **Funcionalidades:**
  - ✅ Formulario modal con validación
  - ✅ Campos obligatorios y opcionales
  - ✅ Validación de email único
  - ✅ Validación de documento único
  - ✅ Generación automática de contraseña segura
  - ✅ Asignación de rol inicial
  - ✅ Estado inicial (Activo por defecto)
- **Campos del formulario:**
  - Nombre completo *
  - Email *
  - Documento de identidad *
  - Teléfono
  - Dirección
  - Rol * (Administrador, Empleado, Visitante)
  - Contraseña * (generada o manual)
  - Estado (Activo/Inactivo)
- **API:** `POST /api/usuarios`

#### **3.3. ✏️ Editar Usuario**
- **Componente:** `EditUserModal.tsx`
- **Descripción:** Modificación de datos de usuarios existentes
- **Funcionalidades:**
  - ✅ Carga automática de datos actuales
  - ✅ Edición de información personal
  - ✅ Cambio de rol
  - ✅ Actualización de contraseña (opcional)
  - ✅ Modificación de estado
  - ✅ Validación de unicidad (email, documento)
- **Campos editables:**
  - Nombre completo
  - Email
  - Documento de identidad
  - Teléfono
  - Dirección
  - Rol
  - Contraseña (solo si se desea cambiar)
  - Estado
- **API:** `PUT /api/usuarios/:id`

#### **3.4. 🗑️ Eliminar Usuario**
- **Componente:** `DeleteUserModal.tsx`
- **Descripción:** Eliminación segura de usuarios del sistema
- **Funcionalidades:**
  - ✅ Modal de confirmación con advertencia
  - ✅ Muestra información del usuario a eliminar
  - ✅ Validación de permisos
  - ✅ Eliminación en cascada de datos relacionados:
    - Rostros registrados
    - Reglas de acceso
    - Evidencias asociadas
  - ✅ Preservación de historial de accesos (auditoría)
  - ✅ Confirmación con doble clic o checkbox
- **Advertencias:**
  - No se puede eliminar el propio usuario
  - Se eliminan todos los rostros registrados
  - Se eliminan todas las reglas de acceso
  - El historial de accesos se mantiene para auditoría
- **API:** `DELETE /api/usuarios/:id`

#### **3.5. 🔄 Activar/Desactivar Usuario**
- **Componente:** Toggle switch en tabla principal
- **Descripción:** Control rápido del estado del usuario
- **Funcionalidades:**
  - ✅ Switch visual en la tabla
  - ✅ Cambio inmediato de estado
  - ✅ Confirmación visual del cambio
  - ✅ Actualización en tiempo real
- **Efectos de desactivación:**
  - Usuario no puede iniciar sesión
  - No puede ser reconocido en puntos de acceso
  - Reglas de acceso se mantienen pero inactivas
  - Rostros se mantienen pero no se usan
- **API:** `PUT /api/usuarios/:id` (campo activo)

#### **3.6. 👤 Asignar Roles**
- **Componente:** Selector en `CreateUserModal.tsx` y `EditUserModal.tsx`
- **Descripción:** Gestión de roles y permisos de usuario
- **Roles disponibles:**
  - **Administrador:**
    - Acceso completo al dashboard
    - Gestión de usuarios, zonas, puntos de control
    - Configuración del sistema
    - Visualización de todas las alertas
    - Gestión de reglas de acceso
  - **Supervisor:**
    - Acceso al dashboard de monitoreo
    - Visualización de alertas
    - Gestión de alertas (cambiar estado)
    - Reportes y estadísticas
  - **Empleado:**
    - Acceso físico según zonas asignadas
    - Sin acceso al dashboard web
    - Reconocimiento facial en puntos de control
  - **Visitante:**
    - Acceso temporal a zonas específicas
    - Horarios restringidos
    - Sin acceso al dashboard
- **Funcionalidades:**
  - ✅ Selector dropdown de roles
  - ✅ Descripción de permisos por rol
  - ✅ Validación de cambios de rol
  - ✅ Auditoría de cambios de rol
- **API:** `PUT /api/usuarios/:id` (campo rol_id)

#### **3.7. 📸 Ver Rostros Registrados**
- **Componente:** `VerRostrosModal.tsx`
- **Descripción:** Visualización de rostros faciales registrados por usuario
- **Funcionalidades:**
  - ✅ Modal con galería de rostros
  - ✅ Muestra todas las capturas faciales
  - ✅ Información de cada rostro:
    - Fecha de registro
    - Calidad del embedding
    - Dimensiones del embedding (512)
    - Estado (Activo/Inactivo)
  - ✅ Opción de eliminar rostros individuales
  - ✅ Indicador de rostro principal
  - ✅ Vista previa en miniatura y ampliada
- **Datos mostrados:**
  - Imagen del rostro recortado
  - Fecha y hora de registro
  - Usuario que registró
  - Punto de control donde se registró
  - Calidad del embedding
  - Estado del rostro
- **Acciones:**
  - Ver imagen en tamaño completo
  - Eliminar rostro específico
  - Marcar como rostro principal
  - Descargar imagen
- **API:** `GET /api/usuarios/:id/rostros`

#### **3.8. 🗺️ Gestionar Zonas y Horarios de Acceso**
- **Componente:** `GestionZonasModal.tsx`
- **Descripción:** Configuración de reglas de acceso por zona y horario (RF10)
- **Funcionalidades:**
  - ✅ Modal completo de gestión de reglas
  - ✅ Listar zonas asignadas al usuario
  - ✅ Asignar nueva zona con horarios
  - ✅ Editar horarios de zona existente
  - ✅ Eliminar regla de acceso
  - ✅ Activar/Desactivar regla temporalmente
  - ✅ Configuración por día de semana
  - ✅ Validación de horarios (inicio < fin)
- **Configuración de regla:**
  - **Zona:** Selector de zonas disponibles
  - **Día de semana:**
    - Todos los días
    - Lunes a Viernes
    - Días específicos (Lun, Mar, Mié, Jue, Vie, Sáb, Dom)
  - **Hora inicio:** Time picker (HH:MM)
  - **Hora fin:** Time picker (HH:MM)
  - **Estado:** Activo/Inactivo
- **Validaciones:**
  - No duplicar reglas (mismo usuario + zona + día)
  - Hora inicio debe ser menor que hora fin
  - Zona debe estar activa
  - Usuario debe estar activo
- **Vista de reglas:**
  - Tabla con todas las reglas del usuario
  - Zona asignada
  - Días permitidos
  - Horario (HH:MM - HH:MM)
  - Estado (Activo/Inactivo)
  - Acciones (Editar, Eliminar, Toggle)
- **Efectos en el sistema:**
  - Validación automática en reconocimiento facial
  - Generación de alertas tipo 5 (fuera de horario)
  - Generación de alertas tipo 6 (zona restringida)
- **API:** 
  - `GET /api/reglas-acceso?usuarioId=:id`
  - `POST /api/reglas-acceso`
  - `PUT /api/reglas-acceso/:id`
  - `DELETE /api/reglas-acceso/:id`

#### **3.9. 📊 Historial de Accesos del Usuario**
- **Componente:** Modal o sección expandible en tabla
- **Descripción:** Visualización del historial completo de accesos
- **Funcionalidades:**
  - ✅ Lista de todos los accesos del usuario
  - ✅ Filtro por fecha (desde - hasta)
  - ✅ Filtro por punto de control
  - ✅ Filtro por decisión (Permitido/Denegado)
  - ✅ Paginación de resultados
  - ✅ Exportación a CSV/Excel
- **Información mostrada:**
  - Fecha y hora del acceso
  - Punto de control
  - Zona
  - Decisión (Permitido/Denegado)
  - Confianza del reconocimiento (%)
  - Liveness detection (Pasó/Falló)
  - Evidencia fotográfica (ver imagen)
  - Razón de denegación (si aplica)
- **Estadísticas:**
  - Total de accesos
  - Accesos permitidos
  - Accesos denegados
  - Tasa de éxito (%)
  - Puntos más frecuentes
  - Horarios más frecuentes
- **API:** `GET /api/usuarios/:id/accesos`

#### **3.10. 🔍 Búsqueda y Filtros Avanzados**
- **Componente:** Barra de búsqueda y filtros en `page.tsx`
- **Descripción:** Herramientas de búsqueda y filtrado de usuarios
- **Funcionalidades:**
  - ✅ Búsqueda en tiempo real
  - ✅ Búsqueda por múltiples campos
  - ✅ Filtros combinables
  - ✅ Limpieza rápida de filtros
- **Campos de búsqueda:**
  - Nombre completo
  - Email
  - Documento de identidad
  - Teléfono
- **Filtros disponibles:**
  - Por rol (Administrador, Empleado, Visitante)
  - Por estado (Activo, Inactivo, Todos)
  - Por fecha de registro (desde - hasta)
  - Por número de rostros (0, 1-3, 4+)
  - Por zonas asignadas
- **Ordenamiento:**
  - Por nombre (A-Z, Z-A)
  - Por fecha de registro (Más reciente, Más antiguo)
  - Por número de accesos (Mayor a menor)
  - Por estado (Activos primero, Inactivos primero)

### **4. 📍 Zonas y Puntos de Control**
- **Ruta:** `/zonas`
- **Archivo:** `src/app/zonas/page.tsx`
- **Descripción:** Gestión de zonas físicas y puntos de control
- **Funcionalidades:**
  - ✅ Listar zonas con descripción
  - ✅ Crear nueva zona
  - ✅ Editar zona existente
  - ✅ Eliminar zona
  - ✅ Activar/Desactivar zona
  - ✅ Listar puntos de control por zona
  - ✅ Crear punto de control
  - ✅ Editar punto de control
  - ✅ Configurar cámara IP/USB por punto
  - ✅ Eliminar punto de control
- **Componentes:**
  - `CreateZonaModal.tsx` - Crear zona
  - `EditZonaModal.tsx` - Editar zona
  - `DeleteZonaModal.tsx` - Eliminar zona
  - `CreatePuntoModal.tsx` - Crear punto de control
  - `EditPuntoModal.tsx` - Editar punto de control
  - `DeletePuntoModal.tsx` - Eliminar punto
  - `ConfigCamaraModal.tsx` - Configurar cámara
  - `VerPuntosModal.tsx` - Ver puntos de una zona

### **5. 🎥 Monitoreo en Tiempo Real**
- **Ruta:** `/monitoreo`
- **Archivo:** `src/app/monitoreo/page.tsx`
- **Descripción:** Monitoreo en vivo de accesos
- **Funcionalidades:**
  - ✅ Ver accesos en tiempo real
  - ✅ Filtrar por punto de control
  - ✅ Filtrar por decisión (Permitido/Denegado)
  - ✅ Ver evidencia fotográfica
  - ✅ Actualización automática cada 10 segundos
  - ✅ Detalles de cada acceso
- **Componentes:**
  - `AccessLogTable.tsx` - Tabla de accesos
  - `AccessFilters.tsx` - Filtros de búsqueda
  - `AccessDetailModal.tsx` - Detalle del acceso

### **6. ⚠️ Gestión de Alertas**
- **Ruta:** `/alertas`
- **Archivo:** `src/app/alertas/page.tsx`
- **Descripción:** Visualización y gestión de alertas de seguridad
- **Funcionalidades:**
  - ✅ Listar alertas con paginación
  - ✅ Filtrar por tipo de alerta
  - ✅ Filtrar por estado (Pendiente/Revisada/Resuelta)
  - ✅ Filtrar por fecha
  - ✅ Ver detalles de alerta
  - ✅ Cambiar estado de alerta
  - ✅ Ver evidencia fotográfica
  - ✅ Ver usuario involucrado
  - ✅ Ver punto de control 
- **Tipos de Alertas:**
  - Acceso no autorizado
  - Falla en prueba de vida
  - Usuario desconocido
  - Múltiples intentos fallidos
  - Acceso fuera de horario
  - Zona restringida

### **7. ⚙️ Configuración del Sistema**
- **Ruta:** `/configuracion`
- **Archivo:** `src/app/configuracion/page.tsx`
- **Descripción:** Configuraciones generales del sistema
- **Funcionalidades:**
  - ✅ Configurar notificaciones (Email, Telegram)
  - ✅ Configurar umbrales de confianza
  - ✅ Configurar liveness detection
  - ✅ Ver información del sistema
  - ✅ Gestionar roles y permisos

### **8. 🔐 Autenticación**
- **Ruta:** `/login`
- **Archivo:** `src/app/login/page.tsx`
- **Descripción:** Sistema de login con JWT
- **Funcionalidades:**
  - ✅ Login con email y contraseña
  - ✅ Autenticación JWT
  - ✅ Protección de rutas con middleware
  - ✅ Logout
  - ✅ Recordar sesión
  - ✅ Auditoría de accesos

---

## 🔌 API REST (Backend - Next.js)

### **Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### **Dashboard**
- `GET /api/dashboard/stats` - Estadísticas del dashboard

### **Usuarios**
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:id` - Obtener usuario
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `GET /api/usuarios/:id/rostros` - Obtener rostros del usuario
- `GET /api/usuarios/:id/accesos` - Historial de accesos

### **Zonas**
- `GET /api/zonas` - Listar zonas
- `GET /api/zonas/:id` - Obtener zona
- `POST /api/zonas` - Crear zona
- `PUT /api/zonas/:id` - Actualizar zona
- `DELETE /api/zonas/:id` - Eliminar zona
- `GET /api/zonas/:id/puntos` - Puntos de control de una zona

### **Puntos de Control**
- `GET /api/puntos-control` - Listar puntos de control
- `GET /api/puntos-control/:id` - Obtener punto de control
- `POST /api/puntos-control` - Crear punto de control
- `PUT /api/puntos-control/:id` - Actualizar punto de control
- `DELETE /api/puntos-control/:id` - Eliminar punto de control
- `GET /api/puntos-control/:id/camera` - Configuración de cámara
- `PUT /api/puntos-control/:id/camera` - Actualizar cámara

### **Alertas**
- `GET /api/alertas` - Listar alertas
- `GET /api/alertas/:id` - Obtener alerta
- `PUT /api/alertas/:id` - Actualizar estado de alerta
- `GET /api/alertas/stats` - Estadísticas de alertas

### **Accesos**
- `GET /api/accesos` - Listar accesos (monitoreo)

### **Reglas de Acceso (Zonas y Horarios)**
- `GET /api/reglas-acceso` - Listar reglas
- `GET /api/reglas-acceso/:id` - Obtener regla
- `POST /api/reglas-acceso` - Crear regla
- `PUT /api/reglas-acceso/:id` - Actualizar regla
- `DELETE /api/reglas-acceso/:id` - Eliminar regla

### **Notificaciones**
- `GET /api/notifications` - Listar notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída
- `PUT /api/notifications/read-all` - Marcar todas como leídas

### **Catálogos**
- `GET /api/roles` - Listar roles
- `GET /api/tipo-punto` - Tipos de punto de control

### **Salud del Sistema**
- `GET /api/health` - Estado del sistema

---

## 🤖 API DE RECONOCIMIENTO FACIAL (Python/FastAPI)

**Puerto:** 8000  
**Archivo:** `face_recognition_service/main.py`

### **Endpoints Principales:**

#### **1. Detección de Rostros**
- `POST /detect-face`
- **Función:** Detecta rostros en una imagen
- **Entrada:** Imagen en base64
- **Salida:** Coordenadas de rostros detectados
- **Tecnología:** OpenCV + Haar Cascade

#### **2. Registro de Rostro**
- `POST /register-face`
- **Función:** Registra un nuevo rostro en el sistema
- **Entrada:** 
  - Imagen en base64
  - usuario_id
- **Salida:** Embedding facial generado
- **Tecnología:** DeepFace (ArcFace) - 512 dimensiones
- **Seguridad:** Embeddings encriptados con Fernet

#### **3. Reconocimiento Facial**
- `POST /recognize-face`
- **Función:** Reconoce un rostro y decide acceso
- **Entrada:**
  - Imagen en base64
  - punto_control_id
- **Validaciones:**
  - Detección de rostro
  - Liveness detection (TensorFlow)
  - Anti-spoofing (análisis de textura)
  - Match facial (DeepFace)
  - Validación de zona y horario (RF4/RF10)
- **Salida:**
  - decision: PERMITIDO/DENEGADO
  - confianza: 0-100%
  - usuario reconocido
  - razón de la decisión
- **Alertas Generadas:**
  - Tipo 1: Acceso no autorizado
  - Tipo 2: Falla en prueba de vida
  - Tipo 3: Usuario desconocido
  - Tipo 5: Acceso fuera de horario
  - Tipo 6: Zona restringida

#### **4. Eliminar Rostro**
- `DELETE /delete-face/:rostro_id`
- **Función:** Elimina un rostro registrado

#### **5. Estadísticas**
- `GET /stats`
- **Función:** Estadísticas del servicio de IA

#### **6. Salud del Servicio**
- `GET /health`
- **Función:** Estado del servicio (TensorFlow, DeepFace, OpenCV)

### **Tecnologías de IA:**

1. **DeepFace (ArcFace)**
   - Modelo pre-entrenado
   - 512 dimensiones de embedding
   - Distancia euclidiana para similitud

2. **TensorFlow 2.15.0**
   - Anti-spoofing neural network
   - Liveness detection
   - Análisis de calidad de imagen

3. **OpenCV 4.8.1**
   - Detección de rostros (Haar Cascade)
   - Procesamiento de imágenes
   - Validación de calidad

### **Seguridad:**
- ✅ Encriptación Fernet para embeddings
- ✅ Validación estricta de rostros
- ✅ Anti-spoofing multinivel
- ✅ Umbrales configurables

---

## 💻 APLICACIÓN DE ESCRITORIO (Python/Tkinter)

**Archivo:** `desktop_access_app/main.py`  
**Uso:** Puntos de acceso físicos (puertas, torniquetes)

### **Funcionalidades:**

1. **Interfaz Gráfica Moderna**
   - ✅ Diseño intuitivo con Tkinter
   - ✅ Cámara en tiempo real
   - ✅ Feedback visual (verde/rojo)
   - ✅ Indicadores de estado

2. **Control de Acceso**
   - ✅ Captura de rostro en tiempo real
   - ✅ Selección de punto de control
   - ✅ Envío a API de reconocimiento
   - ✅ Decisión instantánea (< 500ms)
   - ✅ Registro de evidencias

3. **Configuración de Cámara**
   - ✅ Cámara USB (índice 0, 1, 2...)
   - ✅ Cámara IP (RTSP, HTTP)
   - ✅ DroidCam (Android como cámara IP)
   - ✅ Configuración dinámica desde dashboard

4. **Historial Local**
   - ✅ Registro de últimos 10 accesos
   - ✅ Timestamp de cada acceso
   - ✅ Usuario reconocido
   - ✅ Decisión tomada

5. **Integración**
   - ✅ Conexión con API Python (puerto 8000)
   - ✅ Conexión con Dashboard (puerto 3000)
   - ✅ Sincronización en tiempo real

### **Instalación:**
```bash
cd desktop_access_app
install.bat  # Instala dependencias
run.bat      # Ejecuta la aplicación
```

---

## 🗄️ BASE DE DATOS (PostgreSQL)

### **18 Tablas Principales:**

#### **Tablas de Catálogo (7):**
1. `roles` - Roles del sistema
2. `tipo_decision` - PERMITIDO/DENEGADO/PENDIENTE
3. `tipo_alerta` - 6 tipos de alertas
4. `tipo_punto` - Tipos de puntos de control
5. `tipo_evidencia` - Tipos de evidencias fotográficas
6. `canal_notificacion` - Email, Telegram, SMS
7. `modelos_faciales` - FaceNet, ArcFace, DeepFace

#### **Tablas Operacionales (11):**
8. `usuarios` - Información de usuarios
9. `rostros` - Embeddings faciales encriptados (512 dim)
10. `imagenes_entrenamiento` - Imágenes originales de registro
11. `zonas` - Zonas físicas del edificio
12. `puntos_control` - Puntos de acceso físicos
13. `evidencias` - Fotografías de accesos/alertas
14. `accesos` - Registro de todos los accesos
15. `acceso_rostros` - Relación acceso-rostro (N:N)
16. `alertas` - Alertas de seguridad generadas
17. `reglas_acceso` - Reglas zona-horario por usuario (RF10)
18. `notificaciones` - Notificaciones enviadas
19. `log_auditoria` - Auditoría completa del sistema

### **Características:**
- ✅ Índices optimizados para consultas rápidas
- ✅ Relaciones FK con integridad referencial
- ✅ Timestamps automáticos (creado_en, actualizado_en)
- ✅ Campos JSONB para metadatos
- ✅ Campos BYTEA para embeddings encriptados
- ✅ Soporte UUID para identificadores únicos

---

## 🎨 COMPONENTES REUTILIZABLES

### **Layout:**
- `Layout.tsx` - Layout principal con sidebar y header
- `Sidebar.tsx` - Menú lateral de navegación
- `Header.tsx` - Barra superior con notificaciones y usuario

### **UI Components (shadcn/ui):**
- `button.tsx` - Botones estilizados
- `card.tsx` - Tarjetas de contenido
- `dialog.tsx` - Modales/Diálogos
- `input.tsx` - Campos de entrada
- `label.tsx` - Etiquetas de formulario
- `select.tsx` - Selectores dropdown
- `table.tsx` - Tablas de datos

### **Dashboard:**
- `StatsCard.tsx` - Tarjetas de estadísticas

### **Usuarios:**
- Modales de CRUD completo
- Gestión de zonas y horarios
- Visualización de rostros

### **Zonas:**
- Modales de CRUD completo
- Gestión de puntos de control
- Configuración de cámaras

### **Notificaciones:**
- `NotificationBell.tsx` - Campana de notificaciones
- `NotificationDropdown.tsx` - Dropdown de notificaciones

---

## 📄 DOCUMENTACIÓN

### **Archivos de Documentación:**
1. `README.md` - Guía general del proyecto
2. `README_SISTEMA_COMPLETO.md` - Documentación técnica completa
3. `INICIO_RAPIDO.md` - Guía de inicio rápido (5 minutos)
4. `VERIFICACION_SISTEMA_COMPLETO.md` - Checklist de verificación
5. `SISTEMA_ZONAS_Y_HORARIOS.md` - Documentación RF4/RF10
6. `DROIDCAM_SETUP.md` - Configuración de DroidCam
7. `CREDENCIALES_LOGIN.md` - Credenciales de acceso
8. `LISTADO_MODULOS_SISTEMA.md` - Este documento

### **Diagramas UML (PlantUML):**
1. `diagrama_casos_uso.puml` - Casos de uso del sistema
2. `diagrama_clases.puml` - Diagrama de clases
3. `diagrama_actividades.puml` - Diagrama de actividades
4. `diagrama_despliegue.puml` - Arquitectura de despliegue (COMPACTO)
5. `diagrama_despliegue_explicacion.md` - Explicación detallada

---

## ✅ REQUERIMIENTOS FUNCIONALES IMPLEMENTADOS

### **RF1:** ✅ Registro de usuarios con captura facial múltiple
### **RF2:** ✅ Reconocimiento facial en tiempo real
### **RF3:** ✅ Liveness detection y anti-spoofing
### **RF4:** ✅ Decisión basada en match + liveness + ZONA + HORARIO
### **RF5:** ✅ Registro completo de accesos con evidencias
### **RF6:** ✅ Generación automática de alertas (6 tipos)
### **RF7:** ✅ Notificaciones multi-canal (Email, Telegram)
### **RF8:** ✅ Dashboard web con estadísticas en tiempo real
### **RF9:** ✅ Gestión completa de usuarios, zonas y puntos
### **RF10:** ✅ Reglas de acceso por zona y horario con enforcement automático

---

## ✅ REQUERIMIENTOS NO FUNCIONALES CUMPLIDOS

### **RNF1:** ✅ Tiempo de procesamiento < 500ms
### **RNF2:** ✅ Confianza mínima configurable (85%)
### **RNF3:** ✅ Arquitectura escalable (N cámaras simultáneas)
### **RNF4:** ✅ Interfaz web moderna y responsiva
### **RNF5:** ✅ Seguridad robusta (JWT, bcrypt, Fernet)
### **RNF6:** ✅ Base de datos PostgreSQL con backups
### **RNF7:** ✅ Logging completo y auditoría
### **RNF8:** ✅ Compatible con hardware estándar (laptop/PC)
### **RNF9:** ✅ Stack tecnológico: Python + Next.js + PostgreSQL
### **RNF10:** ✅ Documentación completa y profesional

---

## 🚀 SCRIPTS DE UTILIDAD

### **Instalación y Configuración:**
- `install.bat` - Instalación inicial del sistema
- `INICIAR_SISTEMA_COMPLETO.bat` - Inicio automático de todos los servicios

### **Base de Datos:**
- `crear_usuarios.js` - Crear/actualizar usuarios de login
- `restaurar_datos.js` - Restaurar catálogos sin borrar usuarios
- `verificar_bd.js` - Verificar estado de la BD

### **Mantenimiento:**
- `arreglar_login.bat` - Solucionar problemas de login
- `clean_database_simple.py` - Limpieza de embeddings
- `diagnose_problems.py` - Diagnóstico del sistema

---

## 📊 ESTADÍSTICAS DEL PROYECTO

### **Código:**
- **Líneas de código:** ~15,000+
- **Archivos:** ~150+
- **Lenguajes:** TypeScript, Python, SQL

### **Frontend (Next.js):**
- **Páginas:** 7
- **Componentes:** 30+
- **API Routes:** 25+

### **Backend (Python):**
- **Endpoints:** 6 principales
- **Servicios de IA:** 3 (DeepFace, TensorFlow, OpenCV)

### **Base de Datos:**
- **Tablas:** 18
- **Índices optimizados:** 20+
- **Relaciones:** 15+

---

## 🎓 IDEAL PARA TESINA

Este sistema es **perfecto para una tesina** porque:

✅ **Complejidad técnica apropiada** - IA, Backend, Frontend, BD  
✅ **Arquitectura profesional** - Microservicios, REST API, separación de capas  
✅ **Tecnologías modernas** - TensorFlow, Next.js, FastAPI, PostgreSQL  
✅ **Funcionalidad completa** - Sistema real y usable  
✅ **Documentación exhaustiva** - UML, manuales, código comentado  
✅ **Seguridad implementada** - JWT, encriptación, anti-spoofing  
✅ **Escalabilidad** - Soporte multi-cámara, multi-usuario  
✅ **Casos de uso reales** - Control de acceso empresarial  

---

## 📞 INFORMACIÓN TÉCNICA

### **Stack Tecnológico:**
- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS, shadcn/ui
- **Backend IA:** Python 3.11, FastAPI, TensorFlow 2.15, DeepFace, OpenCV
- **Backend Web:** Next.js API Routes
- **Base de Datos:** PostgreSQL 15, Prisma ORM
- **Autenticación:** JWT, bcrypt
- **Seguridad:** Fernet encryption
- **Aplicación Escritorio:** Python, Tkinter

### **Puertos:**
- **3000** - Dashboard Web (Next.js)
- **8000** - API Reconocimiento Facial (FastAPI)
- **5432** - PostgreSQL
- **4747** - DroidCam (opcional)

---

**Última actualización:** Octubre 2025  
**Versión del sistema:** 1.0.0  
**Estado:** ✅ 100% FUNCIONAL Y OPERATIVO
