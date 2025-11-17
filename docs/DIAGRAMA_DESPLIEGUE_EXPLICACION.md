# Diagrama de Despliegue - Sistema de Reconocimiento Facial

## 📋 Descripción General

El diagrama de despliegue muestra la **arquitectura física** del sistema, incluyendo todos los nodos de hardware, software, protocolos de comunicación y componentes desplegados.

---

## 🖥️ Nodos del Sistema

### 1. **Estación de Control** (PC/Laptop en Punto de Acceso)

**Ubicación:** Punto físico de control de acceso (entrada, puerta, torniquete)

**Hardware:**
- PC o Laptop con Windows 10/11
- CPU: Intel i3 o superior
- RAM: 4 GB mínimo
- Cámara USB/Webcam (720p mínimo)

**Software Desplegado:**
- **desktop_access_app** (Python 3.11 + Tkinter)
  - `main.py` - Aplicación principal
  - Interfaz gráfica (Tkinter)
  - Captura de cámara (OpenCV)
  - Cliente HTTP (requests)
- **face_env** - Entorno virtual Python
- **Cámara USB/Webcam** - Dispositivo de captura

**Función:**
- Capturar rostros en tiempo real
- Enviar imágenes a API Python para procesamiento
- Mostrar resultado de acceso (PERMITIDO/DENEGADO)
- Registrar eventos localmente

**Protocolo de Comunicación:**
- HTTP/REST → API Python (Puerto 8000)
- POST /recognize-face (JSON + Base64)
- POST /register-face (JSON + Base64)

---

### 2. **Cámara IP/DroidCam** (Opcional)

**Ubicación:** Dispositivo móvil o cámara IP profesional

**Hardware:**
- Smartphone Android con DroidCam
- O cámara IP profesional (Hikvision, Dahua)

**Software:**
- DroidCam App (Stream HTTP)
- Cámara trasera 1080p

**Función:**
- Transmitir video en tiempo real vía WiFi
- Alternativa a cámara USB
- Permite ubicación remota de cámara

**Protocolo de Comunicación:**
- HTTP Stream → Estación de Control
- URL: `http://192.168.1.X:4747/video`
- Formato: MJPEG/H.264

---

### 3. **Servidor de Aplicación** (Laptop/PC Central)

**Ubicación:** Servidor central (puede ser la misma máquina o servidor dedicado)

**Hardware Recomendado:**
- CPU: Intel i5/i7 o AMD Ryzen 5/7
- RAM: 8-16 GB
- GPU: Opcional (CUDA para TensorFlow)
- Disco: 50 GB SSD
- SO: Windows 10/11

**Software Desplegado:**

#### A) **API Python (FastAPI)** - Puerto 8000
- **main.py** - Servidor FastAPI
- **TensorFlow 2.15.0** - Liveness detection
- **OpenCV 4.8.1** - Procesamiento de imágenes
- **DeepFace** - Embeddings faciales (ArcFace 512-dim)
- **Encriptación Fernet** - Seguridad de datos
- **Validación de Zonas/Horarios** - Control de acceso

**Endpoints:**
- POST /recognize-face
- POST /register-face
- POST /detect-face
- GET /stats
- GET /health

#### B) **Dashboard Web (Next.js)** - Puerto 3000
- **Next.js Server** - Servidor web
- **API Routes** - Backend Next.js (/api/*)
- **Prisma Client** - ORM para PostgreSQL
- **Autenticación JWT + bcrypt** - Seguridad
- **Componentes React** - Interfaz de usuario

**Módulos:**
- Dashboard principal
- Gestión de usuarios
- Alertas y notificaciones
- Historial de accesos
- Configuración de zonas y horarios
- Reportes y estadísticas

**Protocolos de Comunicación:**
- TCP/IP → PostgreSQL (Puerto 5432)
- File I/O → Sistema de Archivos
- SMTP/HTTPS → Servicios Externos

---

### 4. **Servidor de Base de Datos** (PostgreSQL)

**Ubicación:** Mismo servidor o servidor dedicado

**Software:**
- PostgreSQL 15+
- Puerto: 5432
- Encoding: UTF8
- Timezone: UTC

**Esquema de Base de Datos:**

#### Tablas Catálogo (7):
- roles
- tipo_decision
- tipo_alerta
- tipo_punto
- tipo_evidencia
- canal_notificacion
- modelos_faciales

#### Tablas Core (11):
- usuarios
- rostros
- imagenes_entrenamiento
- zonas
- puntos_control
- evidencias
- accesos
- acceso_rostros
- alertas
- reglas_acceso
- notificaciones
- log_auditoria

**Datos Almacenados:**
- Embeddings faciales encriptados
- Contraseñas hasheadas (bcrypt)
- Tokens JWT
- Registros de accesos y alertas
- Configuraciones del sistema

**Configuración:**
- Max Connections: 100
- Backup diario automático
- Retención: 30 días

**Protocolos de Comunicación:**
- TCP/IP desde API Python (psycopg2)
- TCP/IP desde Dashboard Web (Prisma ORM)

---

### 5. **Sistema de Archivos** (Disco Local)

**Ubicación:** Disco local del servidor

**Estructura de Carpetas:**

#### `/evidencias/YYYY/MM/DD/`
- **FOTO_ACCESO** - Escena completa de cada intento
- **FOTO_ALERTA** - Foto cuando hay acceso denegado
- **FOTO_ROSTRO** - Rostro recortado sin fondo

**Formato:**
- Imágenes: JPEG (85% calidad)
- Hash: SHA256 para integridad
- Metadata: JSON con dimensiones, timestamp

#### `/face_recognition_service/`
- **haarcascade_frontalface_default.xml** - Detector de rostros
- **DeepFace Models** - ArcFace, VGG-Face
- **TensorFlow Models** - Anti-spoofing

**Almacenamiento Estimado:**
- Evidencias: ~500 MB/mes
- Modelos: ~200 MB
- Logs: ~50 MB/mes

---

### 6. **Cliente Web** (Navegador)

**Ubicación:** Cualquier dispositivo con navegador

**Software:**
- Google Chrome, Edge, Firefox
- Interfaz de Usuario (React SPA)
- LocalStorage (JWT Token)

**Función:**
- Acceso al dashboard web
- Gestión administrativa
- Visualización de reportes
- Configuración del sistema

**Protocolo de Comunicación:**
- HTTPS → Dashboard Web (Puerto 3000)
- GET/POST/PUT/DELETE (JSON + JWT)

---

### 7. **Servicios Externos** (Cloud)

**Servicios Integrados:**

#### A) Servidor Email (SMTP)
- Gmail, Outlook, SendGrid
- Puerto: 587 (TLS)
- Función: Notificaciones por email

#### B) Telegram Bot API
- HTTPS (Puerto 443)
- Función: Alertas instantáneas

**Protocolo de Comunicación:**
- SMTP desde API Python
- HTTPS desde API Python

---

## 🌐 Red Local (LAN)

**Configuración:**
- Red: 192.168.1.0/24
- Protocolo: WiFi/Ethernet
- Velocidad: 100 Mbps mínimo

**Dispositivos Conectados:**
- Estación de Control
- Servidor de Aplicación
- Cámara IP/DroidCam
- Cliente Web

---

## 🔄 Flujo de Comunicación

### Flujo de Reconocimiento Facial:

1. **Captura:**
   - Cámara USB/IP → Estación de Control
   - USB o HTTP Stream (640x480 @ 30fps)

2. **Envío:**
   - Estación de Control → API Python
   - HTTP POST /recognize-face
   - JSON + Base64 (imagen + punto_control_id)

3. **Procesamiento:**
   - API Python procesa con TensorFlow + DeepFace
   - Valida liveness y anti-spoofing
   - Compara embeddings con BD
   - Valida zonas y horarios

4. **Consulta BD:**
   - API Python → PostgreSQL
   - SELECT embeddings, reglas de acceso
   - TCP/IP (Puerto 5432)

5. **Decisión:**
   - API Python calcula confianza
   - PERMITIDO o DENEGADO
   - Genera alerta si es necesario

6. **Registro:**
   - API Python → PostgreSQL
   - INSERT en accesos, alertas
   - API Python → Sistema de Archivos
   - Guarda evidencia fotográfica

7. **Respuesta:**
   - API Python → Estación de Control
   - JSON con resultado
   - HTTP 200 OK

8. **Visualización:**
   - Cliente Web → Dashboard Web
   - GET /api/accesos, /api/alertas
   - HTTPS (Puerto 3000)

9. **Notificación (Opcional):**
   - API Python → SMTP/Telegram
   - Email o mensaje instantáneo
   - Solo para alertas críticas

---

## 🔐 Protocolos de Seguridad

### Comunicación:
- **HTTP/REST** - API Python (sin datos sensibles en tránsito)
- **HTTPS** - Dashboard Web (TLS 1.2+)
- **TCP/IP** - PostgreSQL (conexión local segura)

### Datos:
- **JWT** - Autenticación de usuarios (HS256)
- **bcrypt** - Hash de contraseñas (salt 10)
- **Fernet** - Encriptación de embeddings (AES-128)
- **SHA256** - Hash de evidencias fotográficas

### Red:
- **Firewall** - Puertos 3000, 8000, 5432 protegidos
- **VPN** - Opcional para acceso remoto
- **WiFi WPA3** - Seguridad de red inalámbrica

---

## 📊 Cumplimiento de Requerimientos No Funcionales

| Requerimiento | Cumplimiento | Evidencia en Diagrama |
|---------------|--------------|----------------------|
| **RNF1:** < 500ms procesamiento | ✅ | TensorFlow + DeepFace optimizados |
| **RNF2:** Multi-usuario escalable | ✅ | Arquitectura cliente-servidor |
| **RNF3:** Alta disponibilidad | ✅ | Servidor dedicado 24/7 |
| **RNF4:** Datos encriptados | ✅ | Fernet + bcrypt + JWT |
| **RNF5:** Integridad de datos | ✅ | PostgreSQL + SHA256 |
| **RNF6:** Interfaz intuitiva | ✅ | Dashboard Web React |
| **RNF7:** Actualización sin downtime | ✅ | Modelos en archivos separados |
| **RNF8:** Compatible laptop/PC | ✅ | Windows 10/11 |
| **RNF9:** PostgreSQL + Python + Next.js | ✅ | Stack completo implementado |
| **RNF10:** Escalable múltiples cámaras | ✅ | Soporte USB + IP + RTSP |

---

## 🚀 Despliegue en Producción

### Opción 1: Todo en Una Máquina (Desarrollo/Demo)
- Servidor de Aplicación + Base de Datos + Estación de Control
- Hardware: Laptop i5, 8GB RAM, SSD 256GB
- Ideal para: Tesina, demostración, pruebas

### Opción 2: Servidor Dedicado (Producción)
- **Servidor Central:** API Python + Dashboard Web + PostgreSQL
- **Estaciones de Control:** N dispositivos en puntos de acceso
- **Cámaras IP:** M cámaras distribuidas
- Hardware: Servidor i7/Ryzen 7, 16GB RAM, SSD 512GB
- Ideal para: Empresa, edificio, campus

### Opción 3: Cloud Híbrido (Escalable)
- **Cloud:** Dashboard Web + PostgreSQL (AWS/Azure)
- **On-Premise:** API Python + Estaciones de Control
- Ideal para: Múltiples ubicaciones, alta disponibilidad

---

## 📝 Notas para Tesina

### Aspectos Destacables:

1. **Arquitectura Distribuida:**
   - Separación clara de responsabilidades
   - Escalabilidad horizontal y vertical
   - Tolerancia a fallos

2. **Tecnologías Modernas:**
   - IA/ML con TensorFlow y DeepFace
   - Framework web moderno (Next.js)
   - Base de datos relacional robusta

3. **Seguridad Integral:**
   - Múltiples capas de seguridad
   - Encriptación end-to-end
   - Auditoría completa

4. **Escalabilidad:**
   - Soporte para múltiples cámaras
   - Arquitectura preparada para cloud
   - Crecimiento sin rediseño

5. **Profesionalismo:**
   - Cumple estándares de la industria
   - Documentación completa
   - Código limpio y mantenible

---

## 🛠️ Herramientas para Generar el Diagrama

### PlantUML:
```bash
# Instalar PlantUML
# Opción 1: Visual Studio Code Extension
# Buscar "PlantUML" en extensiones

# Opción 2: Línea de comandos
java -jar plantuml.jar diagrama_despliegue.puml

# Opción 3: Online
# https://www.plantuml.com/plantuml/uml/
```

### Exportar a PNG/SVG:
```bash
# PNG (alta resolución)
java -jar plantuml.jar -tpng diagrama_despliegue.puml

# SVG (vectorial)
java -jar plantuml.jar -tsvg diagrama_despliegue.puml

# PDF (para documento)
java -jar plantuml.jar -tpdf diagrama_despliegue.puml
```

---

## 📚 Referencias

- **UML 2.5 Specification** - Deployment Diagrams
- **PlantUML Documentation** - https://plantuml.com/deployment-diagram
- **Arquitectura de Software** - Patrones de despliegue
- **Sistemas Distribuidos** - Comunicación cliente-servidor

---

**Fecha de Creación:** Octubre 2025  
**Versión:** 1.0  
**Autor:** Sistema de Reconocimiento Facial  
**Propósito:** Documentación para Tesina Académica
