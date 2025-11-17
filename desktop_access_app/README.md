# 🖥️ Aplicación de Escritorio - Control de Acceso Facial

## 📋 Descripción

Aplicación de escritorio desarrollada en **Python + Tkinter** para operadores de seguridad en puntos de control físicos. Esta aplicación maneja el **reconocimiento facial en tiempo real** y las **decisiones de acceso** directamente en la entrada/puerta.

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA COMPLETO                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🖥️ APLICACIÓN DE ESCRITORIO (Esta App)                    │
│  ├─ Control de acceso en tiempo real                       │
│  ├─ Cámara y reconocimiento facial                         │
│  ├─ Decisiones de acceso inmediatas                        │
│  └─ Para operadores de seguridad en puerta                 │
│                                                             │
│  🌐 DASHBOARD WEB (Separado)                               │
│  ├─ Administración de usuarios                             │
│  ├─ Reportes y estadísticas                                │
│  ├─ Configuración del sistema                              │
│  └─ Para administradores desde oficina                     │
│                                                             │
│  🤖 API PYTHON (Backend)                                   │
│  ├─ Procesamiento de IA                                    │
│  ├─ Reconocimiento facial                                  │
│  ├─ Anti-spoofing y liveness                               │
│  └─ Puerto 8000                                            │
│                                                             │
│  💾 BASE DE DATOS PostgreSQL                               │
│  └─ Almacenamiento de datos                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Características

### 🔒 Control de Acceso
- **Reconocimiento facial en tiempo real** (< 500ms)
- **Detección de liveness** y anti-spoofing
- **Decisiones automáticas** de acceso
- **Múltiples puntos de control** configurables

### 📹 Interfaz de Cámara
- **Video en vivo** con detección facial
- **Controles intuitivos** para operadores
- **Indicadores visuales** de estado
- **Resultados inmediatos** en pantalla

### 📊 Registro y Monitoreo
- **Log en tiempo real** de intentos de acceso
- **Estado del sistema** (cámara, API, BD)
- **Información detallada** de cada verificación
- **Historial de accesos** recientes

### 🛡️ Seguridad
- **Comunicación encriptada** con API
- **Validación de usuarios** registrados
- **Auditoría completa** de accesos
- **Manejo de errores** robusto

## 🚀 Instalación

### Prerrequisitos
- **Python 3.11+** instalado
- **Cámara web** conectada
- **API Python** corriendo en puerto 8000
- **Dashboard Web** corriendo en puerto 3000

### Pasos de Instalación

1. **Ejecutar instalador**:
   ```batch
   install.bat
   ```

2. **Verificar instalación**:
   - Se creará entorno virtual `desktop_env`
   - Se instalarán todas las dependencias
   - Se verificará Python y cámara

## 🎮 Uso

### Iniciar Aplicación

1. **Asegurar servicios activos**:
   - API Python: `http://localhost:8000`
   - Dashboard Web: `http://localhost:3000`

2. **Ejecutar aplicación**:
   ```batch
   run.bat
   ```

### Operación Normal

1. **Seleccionar punto de control**
2. **Iniciar cámara** con botón "▶ INICIAR CÁMARA"
3. **Verificar acceso** con botón "🔍 VERIFICAR ACCESO"
4. **Revisar resultados** en panel derecho

### Puntos de Control Disponibles
- **1 - Entrada Principal**: Acceso general al edificio
- **2 - Acceso Oficinas**: Área de oficinas administrativas
- **3 - Sala Servidores**: Área de alta seguridad

## 🔧 Configuración

### API Endpoints
- **Reconocimiento**: `POST /recognize-face`
- **Salud del servicio**: `GET /health`
- **Registro de accesos**: `POST /api/accesos`

### Parámetros Configurables
```python
# En main.py
self.api_base_url = "http://localhost:8000"  # URL de la API
self.selected_point = 1                      # Punto de control por defecto
```

## 📝 Logs

### Archivo de Log
- **Ubicación**: `access_control.log`
- **Formato**: Timestamp - Level - Message
- **Rotación**: Manual

### Información Registrada
- Inicio/cierre de cámara
- Intentos de reconocimiento
- Errores de conexión
- Cambios de configuración

## 🛠️ Desarrollo

### Estructura del Código
```
desktop_access_app/
├── main.py              # Aplicación principal
├── requirements.txt     # Dependencias Python
├── install.bat         # Script de instalación
├── run.bat             # Script de ejecución
├── README.md           # Esta documentación
└── desktop_env/        # Entorno virtual (creado automáticamente)
```

### Clases Principales
- **AccessControlApp**: Clase principal de la aplicación
- **setup_ui()**: Configuración de interfaz
- **setup_camera_panel()**: Panel de cámara
- **setup_access_log_panel()**: Panel de registro

### Métodos Clave
- **start_camera()**: Inicializar cámara
- **verify_access()**: Procesar reconocimiento
- **process_recognition_result()**: Manejar resultados
- **register_access_in_db()**: Guardar en base de datos

## 🔍 Troubleshooting

### Problemas Comunes

#### Cámara no detectada
```
Error: No se pudo acceder a la cámara
```
**Solución**: Verificar que la cámara esté conectada y no esté siendo usada por otra aplicación.

#### API no responde
```
🤖 Servicio IA: DESCONECTADO
```
**Solución**: Iniciar la API Python en puerto 8000.

#### Base de datos desconectada
```
💾 Base de Datos: DESCONECTADA
```
**Solución**: Iniciar el dashboard web en puerto 3000.

#### Error de dependencias
```
ModuleNotFoundError: No module named 'cv2'
```
**Solución**: Ejecutar `install.bat` nuevamente.

## 📞 Soporte

### Logs de Depuración
1. Revisar `access_control.log`
2. Verificar estado de servicios
3. Comprobar conexión de cámara
4. Validar configuración de red

### Contacto
- **Proyecto**: Sistema de Seguridad con Reconocimiento Facial
- **Tipo**: Aplicación de Escritorio para Control de Acceso
- **Tecnología**: Python 3.11 + Tkinter + OpenCV

---

## 🎯 Diferencias con Dashboard Web

| Característica | Aplicación Escritorio | Dashboard Web |
|---|---|---|
| **Propósito** | Control de acceso en tiempo real | Administración y reportes |
| **Usuario** | Operador de seguridad | Administrador del sistema |
| **Ubicación** | Punto de control físico | Oficina administrativa |
| **Funciones** | Cámara, reconocimiento, acceso | Gestión, reportes, configuración |
| **Tecnología** | Python + Tkinter | Next.js + React |
| **Interfaz** | Aplicación nativa | Navegador web |

Esta separación garantiza que cada componente tenga su función específica y optimizada para su contexto de uso.
