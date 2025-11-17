# Sistema de Seguridad con Reconocimiento Facial

Sistema integral de control de acceso basado en reconocimiento facial desarrollado como proyecto de tesina. Combina tecnologías modernas de inteligencia artificial, desarrollo web y bases de datos para crear una solución completa de seguridad biométrica.

## 🚀 Características Principales

- **Reconocimiento Facial en Tiempo Real**: Procesamiento < 500ms con alta precisión
- **Dashboard Interactivo**: Monitoreo en tiempo real con métricas y estadísticas
- **Gestión de Usuarios**: Administración completa de usuarios y roles
- **Control de Zonas**: Configuración de zonas de seguridad y puntos de control
- **Sistema de Alertas**: Notificaciones automáticas por eventos de seguridad
- **Auditoría Completa**: Registro detallado de todos los accesos y cambios
- **Detección de Vida**: Verificación de liveness para prevenir suplantación
- **Cifrado de Datos**: Protección de embeddings biométricos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14**: Framework React para aplicaciones web
- **TypeScript**: Tipado estático para JavaScript
- **Tailwind CSS**: Framework CSS utilitario
- **Radix UI**: Componentes accesibles y personalizables
- **Recharts**: Gráficos y visualizaciones interactivas

### Backend
- **Next.js API Routes**: Endpoints REST para el frontend
- **Prisma**: ORM moderno para TypeScript/JavaScript
- **PostgreSQL**: Base de datos relacional robusta
- **FastAPI (Python)**: Servicio de reconocimiento facial
- **OpenCV**: Procesamiento de imágenes y video

### Inteligencia Artificial
- **face_recognition**: Biblioteca de reconocimiento facial
- **dlib**: Detección y análisis facial
- **NumPy**: Computación científica
- **scikit-learn**: Algoritmos de machine learning

## 📋 Requisitos del Sistema

### Software Requerido
- Node.js 18+ y npm
- Python 3.8+
- PostgreSQL 12+
- Git
- Cámara web (para reconocimiento facial)

### Hardware Recomendado
- CPU: Intel i5 o AMD Ryzen 5 (mínimo)
- RAM: 8GB (16GB recomendado)
- Almacenamiento: 10GB libres
- Cámara: 720p o superior

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- Python 3.8+
- PostgreSQL 12+
- Git
- Cámara web (para reconocimiento facial)

### Opción 1: Instalación Automática (Recomendada)

#### Windows
```bash
# Ejecutar script de configuración automática
scripts\setup.bat
```

#### Linux/macOS
```bash
# Dar permisos de ejecución
chmod +x scripts/setup.sh

# Ejecutar script de configuración
./scripts/setup.sh
```

### Opción 2: Instalación Manual

#### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd sitema-de-seguridad-con-reconocimiento-facial
```

#### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

#### 3. Instalar dependencias de Node.js
```bash
npm install
```

#### 4. Configurar Python
```bash
cd face_recognition_service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

#### 5. Configurar base de datos
```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma db push

# Poblar datos iniciales
npx prisma db seed
```

## 🏃‍♂️ Ejecutar la Aplicación

### Para Presentación en Laptop

#### 1. Iniciar Servicio de Reconocimiento Facial
```bash
cd face_recognition_service

# Windows
venv\Scripts\activate
python main.py

# Linux/macOS  
source venv/bin/activate
python main.py
```
El servicio estará disponible en `http://localhost:8000`

#### 2. Iniciar Aplicación Web (en otra terminal)
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`

#### 3. Acceder al Sistema
- **URL**: http://localhost:3000
- **Usuario por defecto**: admin@sistema.com
- **Dashboard**: Estadísticas en tiempo real
- **Gestión**: Usuarios, zonas, alertas

### Script de Inicio Rápido
```bash
# Windows - Crear start.bat
@echo off
start cmd /k "cd face_recognition_service && venv\Scripts\activate && python main.py"
start cmd /k "npm run dev"

# Linux/macOS - Crear start.sh
#!/bin/bash
cd face_recognition_service && source venv/bin/activate && python main.py &
npm run dev
```

## 🔧 Configuración

### Variables de Entorno Principales

### Variables de Entorno
```env
# Base de datos
DATABASE_URL="postgresql://user:pass@localhost:5432/sistema_seguridad_facial"

# Servicio de reconocimiento facial
FACE_RECOGNITION_API_URL="http://localhost:8000"
CONFIDENCE_THRESHOLD="0.6"
LIVENESS_THRESHOLD="0.5"

# Cifrado
ENCRYPTION_KEY="your-encryption-key-here"

# Notificaciones
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Personalización de Umbrales
- **Umbral de Confianza**: Ajustar `CONFIDENCE_THRESHOLD` (0.0-1.0)
- **Umbral de Liveness**: Modificar `LIVENESS_THRESHOLD` (0.0-1.0)
- **Tiempo de Procesamiento**: Optimizar según hardware disponible

## 📊 Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Python API     │    │   PostgreSQL    │
│                 │    │   (FastAPI)      │    │                 │
│ • Dashboard     │◄──►│ • Face Recognition│◄──►│ • Usuarios      │
│ • User Mgmt     │    │ • Liveness Check │    │ • Accesos       │
│ • Access Control│    │ • Embeddings     │    │ • Alertas       │
│ • Alerts        │    │ • Real-time      │    │ • Auditoría     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐
│   WebSockets    │    │   Camera/CV      │
│ • Real-time UI  │    │ • OpenCV         │
│ • Notifications │    │ • Face Detection │
└─────────────────┘    └──────────────────┘
```

## 🔒 Seguridad

### Medidas Implementadas
- **Cifrado de Embeddings**: Datos biométricos protegidos con Fernet
- **Validación de Entrada**: Sanitización de todos los inputs
- **Auditoría Completa**: Log de todas las operaciones críticas
- **Control de Acceso**: Roles y permisos granulares
- **Detección de Liveness**: Prevención de ataques con fotos

### Recomendaciones Adicionales
- Usar HTTPS en producción
- Implementar autenticación robusta
- Configurar firewall para servicios
- Realizar backups regulares de la base de datos
- Monitorear logs de seguridad

## 📈 Métricas y Rendimiento

### KPIs del Sistema
- **Tiempo de Procesamiento**: < 500ms por verificación
- **Precisión**: > 95% en condiciones óptimas
- **Disponibilidad**: 99.9% durante horario laboral
- **Throughput**: 100+ verificaciones por minuto

### Optimizaciones
- Índices de base de datos optimizados
- Cache de embeddings en memoria
- Procesamiento asíncrono de imágenes
- Compresión de evidencias visuales

## 🚨 Solución de Problemas

### Problemas Comunes

#### Error de Conexión a Cámara
```bash
# Verificar permisos de cámara en el navegador
# Comprobar que no esté siendo usada por otra aplicación
```

#### Servicio de IA No Responde
```bash
# Verificar que el servicio esté ejecutándose
curl http://localhost:8000/health

# Revisar logs del servicio
```

#### Error de Base de Datos
```bash
# Verificar conexión
npm run db:studio

# Regenerar cliente Prisma
npm run db:generate
```

## 🤝 Contribución

### Estructura del Proyecto
```
├── src/
│   ├── app/                 # Páginas y API routes
│   ├── components/          # Componentes React
│   ├── lib/                # Utilidades y configuración
│   └── types/              # Definiciones TypeScript
├── prisma/                 # Schema y migraciones
├── face_recognition_service/ # Servicio Python
└── docs/                   # Documentación adicional
```

### Estándares de Código
- Usar TypeScript para type safety
- Seguir convenciones de Next.js
- Documentar funciones complejas
- Escribir tests para funcionalidad crítica

## 📄 Licencia

Este proyecto está desarrollado como trabajo académico para tesina de grado. Todos los derechos reservados.

## 👥 Autor

**[Tu Nombre]**
- Estudiante de [Tu Carrera]
- Universidad: [Tu Universidad]
- Email: [tu-email@universidad.edu]

## 🙏 Agradecimientos

- Profesores y tutores por su guía
- Comunidad open source por las herramientas utilizadas
- Compañeros de clase por feedback y sugerencias

---

**Nota**: Este sistema está diseñado para fines educativos y de demostración. Para uso en producción, se recomienda realizar auditorías de seguridad adicionales y cumplir con regulaciones locales de protección de datos biométricos.
