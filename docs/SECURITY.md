# Guía de Seguridad - Sistema de Seguridad con Reconocimiento Facial

Esta guía detalla las medidas de seguridad implementadas y las mejores prácticas para el despliegue seguro del sistema.

## 🔒 Medidas de Seguridad Implementadas

### 1. Protección de Datos Biométricos

#### Encriptación de Embeddings Faciales
- **Algoritmo**: Fernet (AES 128 en modo CBC)
- **Gestión de claves**: Variables de entorno seguras
- **Rotación**: Recomendada cada 90 días

```python
# Ejemplo de encriptación implementada
from cryptography.fernet import Fernet

def encrypt_embedding(embedding_data, key):
    f = Fernet(key)
    return f.encrypt(embedding_data.encode())
```

#### Almacenamiento Seguro
- Embeddings encriptados en base de datos
- Imágenes de evidencia con hash SHA-256
- Separación de datos sensibles y metadatos

### 2. Autenticación y Autorización

#### Control de Acceso Basado en Roles (RBAC)
```sql
-- Roles implementados
INSERT INTO roles (nombre, descripcion) VALUES 
('Administrador', 'Acceso completo al sistema'),
('Operador', 'Gestión de usuarios y monitoreo'),
('Auditor', 'Solo lectura de logs y reportes'),
('Usuario', 'Acceso básico autorizado');
```

#### Validación de Sesiones
- Tokens JWT con expiración
- Refresh tokens seguros
- Logout automático por inactividad

### 3. Protección contra Ataques

#### Detección de Liveness
```python
def detect_liveness(image):
    # Análisis de textura LBP
    # Detección de movimiento ocular
    # Verificación de profundidad
    return liveness_score > LIVENESS_THRESHOLD
```

#### Rate Limiting
```nginx
# Configuración Nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=face:10m rate=5r/s;
```

#### Validación de Entrada
```javascript
// Esquemas Zod para validación
const userSchema = z.object({
  nombre: z.string().min(2).max(100),
  documento: z.string().regex(/^[0-9]{8,12}$/),
  email: z.string().email(),
});
```

### 4. Audit Logging

#### Eventos Auditados
- Intentos de acceso (exitosos y fallidos)
- Modificaciones de usuarios
- Cambios de configuración
- Acceso a datos sensibles
- Errores de seguridad

```sql
-- Estructura de audit log
CREATE TABLE log_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

## 🛡️ Configuración de Seguridad

### Variables de Entorno Críticas

```bash
# .env - Configuración de producción
DATABASE_URL="postgresql://user:password@localhost:5432/db"
NEXTAUTH_SECRET="generated-secret-key-32-chars"
ENCRYPTION_KEY="fernet-key-base64-encoded"
JWT_SECRET="jwt-signing-key"

# Configuración de red
ALLOWED_ORIGINS="https://yourdomain.com"
CORS_ENABLED=true

# Configuración de archivos
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_EXTENSIONS=".jpg,.jpeg,.png"
UPLOAD_PATH="/secure/uploads"
```

### Headers de Seguridad HTTP

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### Configuración de Base de Datos

```sql
-- Configuración PostgreSQL segura
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_statement = 'mod';

-- Crear usuario con permisos limitados
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE sistema_seguridad_facial TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

## 🔐 Mejores Prácticas de Despliegue

### 1. Configuración del Servidor

#### Firewall
```bash
# UFW - Ubuntu Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### SSL/TLS
```bash
# Certificados Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

#### Fail2Ban
```bash
# Protección contra ataques de fuerza bruta
sudo apt install fail2ban

# /etc/fail2ban/jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

### 2. Monitoreo de Seguridad

#### Logs Centralizados
```yaml
# docker-compose.yml - ELK Stack
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    
  logstash:
    image: logstash:7.14.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    
  kibana:
    image: kibana:7.14.0
    ports:
      - "5601:5601"
```

#### Alertas de Seguridad
```python
# Configuración de alertas
SECURITY_ALERTS = {
    'multiple_failed_logins': {
        'threshold': 5,
        'timeframe': 300,  # 5 minutos
        'action': 'block_ip'
    },
    'suspicious_face_attempts': {
        'threshold': 10,
        'timeframe': 600,  # 10 minutos
        'action': 'alert_admin'
    },
    'unauthorized_access': {
        'threshold': 1,
        'timeframe': 60,
        'action': 'immediate_alert'
    }
}
```

### 3. Backup y Recuperación

#### Backup Automático
```bash
#!/bin/bash
# backup.sh - Script de backup diario

DB_NAME="sistema_seguridad_facial"
BACKUP_DIR="/secure/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup de base de datos
pg_dump $DB_NAME | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Backup de archivos de evidencia
tar -czf "$BACKUP_DIR/evidencias_$DATE.tar.gz" /app/evidencias/

# Retener solo últimos 30 días
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

#### Plan de Recuperación
1. **RTO (Recovery Time Objective)**: 4 horas
2. **RPO (Recovery Point Objective)**: 1 hora
3. **Procedimiento**:
   - Restaurar base de datos desde backup
   - Restaurar archivos de evidencia
   - Verificar integridad de datos
   - Reiniciar servicios

## ⚠️ Vulnerabilidades Conocidas y Mitigaciones

### 1. Ataques de Spoofing Facial

#### Riesgos
- Uso de fotografías impresas
- Videos reproducidos en pantalla
- Máscaras 3D

#### Mitigaciones Implementadas
```python
def advanced_liveness_detection(image):
    checks = {
        'texture_analysis': analyze_texture_lbp(image),
        'depth_estimation': estimate_depth(image),
        'micro_expressions': detect_micro_movements(image),
        'reflection_analysis': analyze_eye_reflections(image)
    }
    
    return all(score > threshold for score, threshold in checks.items())
```

### 2. Ataques de Inyección

#### SQL Injection
- **Mitigación**: Uso exclusivo de Prisma ORM con queries parametrizadas
- **Validación**: Esquemas Zod en todas las entradas

#### NoSQL Injection
- **Mitigación**: Validación estricta de objetos JSON
- **Sanitización**: Limpieza de caracteres especiales

### 3. Ataques de Denegación de Servicio (DoS)

#### Rate Limiting
```javascript
// Implementación en API routes
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes, intenta más tarde'
});
```

#### Resource Limiting
```python
# Límites en servicio Python
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_CONCURRENT_REQUESTS = 10
REQUEST_TIMEOUT = 30  # segundos
```

## 📋 Checklist de Seguridad

### Pre-Despliegue
- [ ] Variables de entorno configuradas
- [ ] Certificados SSL instalados
- [ ] Firewall configurado
- [ ] Usuarios de base de datos con permisos mínimos
- [ ] Backup automático configurado
- [ ] Logs de auditoría activados

### Post-Despliegue
- [ ] Pruebas de penetración básicas
- [ ] Verificación de headers de seguridad
- [ ] Monitoreo de logs activo
- [ ] Alertas de seguridad configuradas
- [ ] Plan de respuesta a incidentes documentado

### Mantenimiento Continuo
- [ ] Actualizaciones de seguridad mensuales
- [ ] Revisión de logs semanalmente
- [ ] Rotación de claves trimestralmente
- [ ] Auditoría de accesos semestralmente
- [ ] Pruebas de backup mensualmente

## 🚨 Respuesta a Incidentes

### Procedimiento de Escalación
1. **Detección** → Alertas automáticas
2. **Análisis** → Revisar logs y evidencia
3. **Contención** → Bloquear acceso si es necesario
4. **Erradicación** → Eliminar causa raíz
5. **Recuperación** → Restaurar servicios
6. **Lecciones aprendidas** → Documentar y mejorar

### Contactos de Emergencia
```yaml
# incident-response.yml
contacts:
  admin: admin@company.com
  security: security@company.com
  technical: tech@company.com

escalation_levels:
  low: 4 hours
  medium: 1 hour
  high: 15 minutes
  critical: immediate
```

## 📚 Referencias y Recursos

### Estándares de Seguridad
- **ISO 27001**: Gestión de seguridad de la información
- **NIST Cybersecurity Framework**: Marco de ciberseguridad
- **OWASP Top 10**: Principales vulnerabilidades web
- **GDPR**: Protección de datos personales

### Herramientas Recomendadas
- **Análisis de vulnerabilidades**: OWASP ZAP, Nessus
- **Monitoreo**: ELK Stack, Grafana, Prometheus
- **Backup**: pg_dump, rsync, AWS S3
- **Certificados**: Let's Encrypt, Certbot
