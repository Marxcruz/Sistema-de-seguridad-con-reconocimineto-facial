#!/bin/bash

# Sistema de Seguridad con Reconocimiento Facial - Setup Script
# Este script automatiza la configuración inicial del sistema

set -e

echo "🚀 Iniciando configuración del Sistema de Seguridad con Reconocimiento Facial..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar prerrequisitos
check_prerequisites() {
    print_status "Verificando prerrequisitos..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versión 18+ requerida. Versión actual: $(node -v)"
        exit 1
    fi
    
    # Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 no está instalado. Por favor instala Python 3.8+"
        exit 1
    fi
    
    # PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL no detectado. Asegúrate de tenerlo instalado y ejecutándose."
    fi
    
    print_status "✅ Prerrequisitos verificados"
}

# Configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_status "Archivo .env creado desde .env.example"
        print_warning "Por favor edita el archivo .env con tus configuraciones antes de continuar"
        
        # Generar claves aleatorias
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        ENCRYPTION_KEY=$(openssl rand -base64 32)
        
        # Actualizar .env con claves generadas
        sed -i "s/your-secret-key-here/$NEXTAUTH_SECRET/" .env
        sed -i "s/your-encryption-key-here/$ENCRYPTION_KEY/" .env
        
        print_status "Claves de seguridad generadas automáticamente"
    else
        print_status "Archivo .env ya existe"
    fi
}

# Instalar dependencias Node.js
install_node_dependencies() {
    print_status "Instalando dependencias de Node.js..."
    npm install
    print_status "✅ Dependencias de Node.js instaladas"
}

# Configurar Python
setup_python() {
    print_status "Configurando entorno Python..."
    
    cd face_recognition_service
    
    # Crear entorno virtual si no existe
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_status "Entorno virtual Python creado"
    fi
    
    # Activar entorno virtual
    source venv/bin/activate
    
    # Instalar dependencias
    pip install -r requirements.txt
    
    cd ..
    print_status "✅ Entorno Python configurado"
}

# Configurar base de datos
setup_database() {
    print_status "Configurando base de datos..."
    
    # Generar cliente Prisma
    npx prisma generate
    
    # Aplicar migraciones
    npx prisma db push
    
    # Ejecutar seed
    npx prisma db seed
    
    print_status "✅ Base de datos configurada"
}

# Crear directorios necesarios
create_directories() {
    print_status "Creando directorios necesarios..."
    
    mkdir -p uploads
    mkdir -p evidencias
    mkdir -p logs
    mkdir -p temp
    
    print_status "✅ Directorios creados"
}

# Verificar configuración
verify_setup() {
    print_status "Verificando configuración..."
    
    # Verificar que los servicios pueden iniciarse
    print_status "Probando compilación de Next.js..."
    npm run build
    
    print_status "✅ Configuración verificada"
}

# Mostrar instrucciones finales
show_final_instructions() {
    echo ""
    echo "🎉 ¡Configuración completada exitosamente!"
    echo ""
    echo "Para iniciar el sistema:"
    echo ""
    echo "1. Iniciar servicio de reconocimiento facial:"
    echo "   cd face_recognition_service"
    echo "   source venv/bin/activate"
    echo "   python main.py"
    echo ""
    echo "2. En otra terminal, iniciar aplicación web:"
    echo "   npm run dev"
    echo ""
    echo "3. Abrir navegador en: http://localhost:3000"
    echo ""
    echo "Para producción con Docker:"
    echo "   docker-compose up -d"
    echo ""
    echo "📚 Consulta README.md para más información"
}

# Función principal
main() {
    check_prerequisites
    setup_environment
    install_node_dependencies
    setup_python
    create_directories
    setup_database
    verify_setup
    show_final_instructions
}

# Ejecutar si es llamado directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
