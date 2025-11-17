# Diagramas UML - Sistema de Seguridad con Reconocimiento Facial

## Índice
1. [Diagrama de Casos de Uso](#diagrama-de-casos-de-uso)
2. [Diagrama de Clases](#diagrama-de-clases)
3. [Relación con Requisitos](#relación-con-requisitos)
4. [Actores del Sistema](#actores-del-sistema)
5. [Arquitectura del Sistema](#arquitectura-del-sistema)

---

## Diagrama de Casos de Uso

### Descripción General
El diagrama de casos de uso representa todas las funcionalidades del sistema organizadas en 8 paquetes principales, cada uno alineado directamente con los requisitos funcionales establecidos.

### Paquetes de Casos de Uso

#### 1. Gestión de Usuarios (RF1)
- **UC01 - Registrar Usuario**: Permite al administrador crear nuevos usuarios
- **UC02 - Capturar Rostro**: Proceso de captura facial durante el registro
- **UC03 - Generar Embedding Facial**: Conversión de imagen facial a vector matemático
- **UC04 - Asignar Rol y Permisos**: Configuración de roles y permisos de acceso

#### 2. Reconocimiento Facial en Tiempo Real (RF2, RF3)
- **UC05 - Detectar Rostro en Cámara**: Detección automática de rostros
- **UC06 - Capturar Imagen Facial**: Captura de imagen para procesamiento
- **UC07 - Procesar Embedding**: Extracción de características faciales
- **UC08 - Comparar con Base de Datos**: Comparación con rostros registrados
- **UC09 - Verificar Liveness**: Detección de vida para prevenir spoofing

#### 3. Control de Acceso (RF4)
- **UC10 - Evaluar Reglas de Acceso**: Aplicación de reglas de negocio
- **UC11 - Verificar Horarios**: Validación de horarios permitidos
- **UC12 - Verificar Zonas Permitidas**: Validación de zonas autorizadas
- **UC13 - Tomar Decisión de Acceso**: Decisión final de permitir/denegar

#### 4. Registro y Auditoría (RF5, RF7)
- **UC14 - Registrar Acceso**: Almacenamiento del evento de acceso
- **UC15 - Almacenar Evidencia Visual**: Guardado de imágenes como evidencia
- **UC16 - Generar Log de Auditoría**: Registro para trazabilidad
- **UC17 - Calcular Score de Confianza**: Métrica de certeza del reconocimiento

#### 5. Sistema de Alertas (RF6)
- **UC18 - Detectar Rostro No Autorizado**: Identificación de intrusos
- **UC19 - Detectar Falla de Liveness**: Detección de intentos de spoofing
- **UC20 - Generar Alerta de Seguridad**: Creación de alertas automáticas
- **UC21 - Clasificar Tipo de Alerta**: Categorización por severidad

#### 6. Dashboard y Monitoreo (RF8)
- **UC22 - Visualizar Accesos en Tiempo Real**: Monitor en vivo
- **UC23 - Consultar Historial de Accesos**: Búsqueda histórica
- **UC24 - Ver Estadísticas por Usuario**: Análisis por persona
- **UC25 - Ver Estadísticas por Zona**: Análisis por ubicación
- **UC26 - Generar Reportes**: Informes ejecutivos

#### 7. Sistema de Notificaciones (RF9)
- **UC27 - Configurar Canales de Notificación**: Setup de canales
- **UC28 - Enviar Notificación Email**: Alertas por correo
- **UC29 - Enviar Notificación Telegram**: Alertas por mensajería
- **UC30 - Registrar Notificación Interna**: Logs internos

#### 8. Gestión de Reglas (RF10)
- **UC31 - Crear Regla de Acceso**: Definición de nuevas reglas
- **UC32 - Modificar Regla de Acceso**: Actualización de reglas existentes
- **UC33 - Eliminar Regla de Acceso**: Eliminación de reglas obsoletas
- **UC34 - Aplicar Reglas Automáticamente**: Ejecución automática

### Relaciones entre Casos de Uso
- **Include**: Relaciones obligatorias (ej: Registrar Usuario incluye Capturar Rostro)
- **Extend**: Relaciones opcionales (ej: Comparar con BD puede extender a Detectar No Autorizado)

---

## Diagrama de Clases

### Descripción General
El diagrama de clases representa la estructura del sistema organizada en 7 paquetes que reflejan la arquitectura de la aplicación y el esquema de base de datos.

### Paquetes de Clases

#### 1. Gestión de Usuarios
**Clases principales:**
- `Usuario`: Entidad central con autenticación y gestión de intentos fallidos
- `Rol`: Definición de permisos y niveles de acceso
- `Rostro`: Almacenamiento de embeddings faciales encriptados
- `ImagenEntrenamiento`: Gestión de imágenes para entrenamiento de modelos

**Responsabilidades:**
- Autenticación segura con bcrypt
- Gestión de roles y permisos
- Almacenamiento seguro de datos biométricos

#### 2. Control de Acceso
**Clases principales:**
- `Zona`: Definición de áreas físicas del sistema
- `PuntoControl`: Puntos de acceso físicos (puertas, torniquetes)
- `ReglaAcceso`: Reglas de negocio para autorización
- `Acceso`: Registro de eventos de acceso
- `AccesoRostro`: Detalle biométrico de cada acceso

**Responsabilidades:**
- Aplicación de reglas de negocio
- Validación de horarios y zonas
- Registro detallado de accesos

#### 3. Alertas y Notificaciones
**Clases principales:**
- `Alerta`: Eventos de seguridad del sistema
- `Notificacion`: Mensajes enviados a usuarios
- `TipoAlerta`: Clasificación de alertas por severidad
- `CanalNotificacion`: Medios de comunicación (email, Telegram)

**Responsabilidades:**
- Detección automática de anomalías
- Notificación multi-canal
- Clasificación por criticidad

#### 4. Gestión de Evidencias
**Clases principales:**
- `Evidencia`: Almacenamiento de archivos multimedia
- `TipoEvidencia`: Clasificación de tipos de evidencia

**Responsabilidades:**
- Almacenamiento seguro de imágenes
- Validación de integridad con hash
- Gestión de metadatos

#### 5. Modelos de Inteligencia Artificial
**Clases principales:**
- `ModeloFacial`: Gestión de modelos de IA
- `TensorFlowModelManager`: Controlador de TensorFlow
- `FaceRecognitionService`: Servicio principal de reconocimiento

**Responsabilidades:**
- Procesamiento de imágenes < 500ms (RNF1)
- Detección de liveness y anti-spoofing
- Transfer Learning sin downtime (RNF7)
- Comparación de embeddings

#### 6. Catálogos del Sistema
**Clases principales:**
- `TipoDecision`: Tipos de decisiones de acceso
- `TipoPunto`: Clasificación de puntos de control

**Responsabilidades:**
- Configuración del sistema
- Estandarización de tipos

#### 7. Auditoría y Logs
**Clases principales:**
- `LogAuditoria`: Registro completo de cambios

**Responsabilidades:**
- Trazabilidad completa (RNF5)
- Integridad de datos
- Generación de reportes de auditoría

---

## Relación con Requisitos

### Requisitos Funcionales Cubiertos

| RF | Descripción | Casos de Uso | Clases Principales |
|---|---|---|---|
| RF1 | Inscripción de usuarios | UC01-UC04 | Usuario, Rostro, Rol |
| RF2 | Captura facial en tiempo real | UC05-UC06 | FaceRecognitionService, TensorFlowModelManager |
| RF3 | Reconocimiento facial | UC07-UC08 | Rostro, ModeloFacial |
| RF4 | Decisión de acceso | UC10-UC13 | ReglaAcceso, Acceso, TipoDecision |
| RF5 | Registro de accesos | UC14, UC17 | Acceso, AccesoRostro |
| RF6 | Generación de alertas | UC18-UC21 | Alerta, TipoAlerta |
| RF7 | Evidencia visual | UC15 | Evidencia, TipoEvidencia |
| RF8 | Dashboard web | UC22-UC26 | Todas las clases (consulta) |
| RF9 | Notificaciones | UC27-UC30 | Notificacion, CanalNotificacion |
| RF10 | Gestión de reglas | UC31-UC34 | ReglaAcceso |

### Requisitos No Funcionales Implementados

| RNF | Descripción | Implementación |
|---|---|---|
| RNF1 | Tiempo < 500ms | TensorFlowModelManager optimizado |
| RNF2 | Escalabilidad multi-usuario | Arquitectura basada en servicios |
| RNF3 | Alta disponibilidad | Sistema de monitoreo y alertas |
| RNF4 | Datos encriptados | Embeddings en bytes, passwords hasheados |
| RNF5 | Integridad de datos | LogAuditoria, validaciones hash |
| RNF6 | Interfaz intuitiva | Dashboard web moderno |
| RNF7 | Transfer Learning | ModeloFacial versionado |
| RNF8 | Compatibilidad PC | Tecnologías web estándar |
| RNF9 | Stack tecnológico | PostgreSQL + Python + Next.js |
| RNF10 | Escalabilidad futura | Arquitectura modular |

---

## Actores del Sistema

### Actores Humanos
1. **Administrador**: Gestión completa del sistema
2. **Personal de Seguridad**: Monitoreo y consultas
3. **Empleado**: Usuario final con acceso autorizado
4. **Visitante**: Usuario temporal con acceso limitado

### Actores del Sistema
1. **Sistema de Cámara**: Captura automática de imágenes
2. **Sistema de Notificaciones**: Envío automático de alertas

---

## Arquitectura del Sistema

### Capas de la Aplicación
1. **Capa de Presentación**: Next.js Dashboard Web
2. **Capa de Servicios**: FastAPI Python Services
3. **Capa de Inteligencia Artificial**: TensorFlow + OpenCV
4. **Capa de Datos**: PostgreSQL + Prisma ORM

### Flujo Principal de Reconocimiento
1. Cámara captura imagen → TensorFlowModelManager
2. Detección de rostro → Extracción de embedding
3. Comparación con base de datos → Verificación de liveness
4. Aplicación de reglas de acceso → Decisión final
5. Registro en base de datos → Generación de alertas (si aplica)
6. Notificaciones automáticas → Actualización de dashboard

### Tecnologías Utilizadas
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11
- **IA**: TensorFlow, OpenCV, NumPy
- **Base de Datos**: PostgreSQL, Prisma ORM
- **Autenticación**: JWT, bcrypt
- **Comunicación**: WebSockets, REST API

---

## Notas de Implementación

### Consideraciones de Seguridad
- Embeddings almacenados como bytes encriptados
- Contraseñas hasheadas con bcrypt (salt 10)
- Tokens JWT con expiración de 24 horas
- Validación de integridad con hash SHA-256

### Consideraciones de Rendimiento
- Índices optimizados en PostgreSQL
- Cache de modelos de IA en memoria
- Procesamiento asíncrono de notificaciones
- Compresión de imágenes de evidencia

### Consideraciones de Escalabilidad
- Arquitectura de microservicios
- Base de datos normalizada
- Separación de responsabilidades
- Interfaces bien definidas entre capas

---

## Conclusión

Los diagramas UML presentados reflejan fielmente los requisitos funcionales y no funcionales establecidos al inicio del proyecto. La arquitectura implementada garantiza:

- ✅ **Funcionalidad Completa**: Todos los RF implementados
- ✅ **Rendimiento Óptimo**: Cumplimiento de RNF de tiempo y escalabilidad
- ✅ **Seguridad Robusta**: Encriptación y autenticación de nivel empresarial
- ✅ **Mantenibilidad**: Código modular y bien documentado
- ✅ **Escalabilidad**: Preparado para crecimiento futuro

El sistema está listo para demostración académica y uso en producción.
