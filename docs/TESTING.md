# Guía de Pruebas - Sistema de Seguridad con Reconocimiento Facial

Esta guía describe los procedimientos de prueba para validar el funcionamiento del sistema.

## 🧪 Tipos de Pruebas

### 1. Pruebas Unitarias
- Validación de funciones de utilidad
- Pruebas de API endpoints
- Validación de esquemas Prisma

### 2. Pruebas de Integración
- Comunicación entre frontend y backend
- Integración con servicio de reconocimiento facial
- Conexión con base de datos

### 3. Pruebas de Sistema
- Flujo completo de registro de usuario
- Proceso de reconocimiento facial
- Generación de alertas y notificaciones

### 4. Pruebas de Rendimiento
- Tiempo de respuesta del reconocimiento facial
- Carga de usuarios concurrentes
- Optimización de consultas de base de datos

## 🔧 Configuración de Pruebas

### Instalar Dependencias de Pruebas
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev supertest @types/supertest
npm install --save-dev playwright @playwright/test
```

### Configurar Jest
Crear `jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

## 📝 Casos de Prueba

### Pruebas de API

#### 1. Gestión de Usuarios
```javascript
// tests/api/usuarios.test.js
describe('/api/usuarios', () => {
  test('GET /api/usuarios - Listar usuarios', async () => {
    const response = await request(app).get('/api/usuarios');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('usuarios');
    expect(Array.isArray(response.body.usuarios)).toBe(true);
  });

  test('POST /api/usuarios - Crear usuario', async () => {
    const userData = {
      nombre: 'Test User',
      documento: '12345678',
      email: 'test@example.com',
      id_rol: 1
    };
    
    const response = await request(app)
      .post('/api/usuarios')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body.usuario.nombre).toBe(userData.nombre);
  });
});
```

#### 2. Control de Acceso
```javascript
// tests/api/accesos.test.js
describe('/api/accesos', () => {
  test('POST /api/accesos - Registrar acceso', async () => {
    const accessData = {
      id_usuario: 1,
      id_punto_control: 1,
      id_decision: 1,
      confianza: 0.95
    };
    
    const response = await request(app)
      .post('/api/accesos')
      .send(accessData);
    
    expect(response.status).toBe(201);
    expect(response.body.acceso.confianza).toBe(accessData.confianza);
  });
});
```

### Pruebas de Reconocimiento Facial

#### 1. Detección de Rostros
```python
# tests/test_face_recognition.py
import pytest
import base64
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_face_detection():
    # Cargar imagen de prueba
    with open("test_images/face_sample.jpg", "rb") as f:
        image_data = base64.b64encode(f.read()).decode()
    
    response = client.post("/detect", json={"image": image_data})
    
    assert response.status_code == 200
    data = response.json()
    assert "faces_detected" in data
    assert data["faces_detected"] > 0

def test_face_recognition():
    # Imagen con rostro conocido
    with open("test_images/known_face.jpg", "rb") as f:
        image_data = base64.b64encode(f.read()).decode()
    
    response = client.post("/recognize", json={
        "image": image_data,
        "user_id": 1
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "match" in data
    assert "confidence" in data
```

### Pruebas de Frontend

#### 1. Componentes UI
```javascript
// tests/components/StatsCard.test.jsx
import { render, screen } from '@testing-library/react';
import StatsCard from '@/components/dashboard/StatsCard';

describe('StatsCard', () => {
  test('renders stats card with correct data', () => {
    const props = {
      title: 'Total Users',
      value: '150',
      icon: 'Users',
      change: '+12%'
    };
    
    render(<StatsCard {...props} />);
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });
});
```

#### 2. Páginas
```javascript
// tests/pages/dashboard.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';

// Mock fetch
global.fetch = jest.fn();

describe('Dashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('loads and displays dashboard stats', async () => {
    const mockStats = {
      totalUsers: 150,
      todayAccess: 45,
      activeAlerts: 2,
      systemStatus: 'online'
    };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });
  });
});
```

### Pruebas E2E con Playwright

```javascript
// tests/e2e/user-flow.spec.js
const { test, expect } = require('@playwright/test');

test.describe('User Management Flow', () => {
  test('complete user registration and access flow', async ({ page }) => {
    // Navegar a la página de usuarios
    await page.goto('/usuarios');
    
    // Crear nuevo usuario
    await page.click('[data-testid="add-user-button"]');
    await page.fill('[name="nombre"]', 'Test User E2E');
    await page.fill('[name="documento"]', '87654321');
    await page.fill('[name="email"]', 'e2e@test.com');
    await page.selectOption('[name="id_rol"]', '2');
    
    // Guardar usuario
    await page.click('[data-testid="save-user-button"]');
    
    // Verificar que el usuario aparece en la lista
    await expect(page.locator('text=Test User E2E')).toBeVisible();
    
    // Navegar a control de acceso
    await page.goto('/acceso');
    
    // Simular reconocimiento facial exitoso
    await page.click('[data-testid="simulate-recognition"]');
    
    // Verificar que se registra el acceso
    await expect(page.locator('[data-testid="access-granted"]')).toBeVisible();
  });
});
```

## 🚀 Ejecutar Pruebas

### Pruebas Unitarias y de Integración
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar con cobertura
npm run test:coverage

# Ejecutar en modo watch
npm run test:watch
```

### Pruebas E2E
```bash
# Instalar navegadores
npx playwright install

# Ejecutar pruebas E2E
npm run test:e2e

# Ejecutar con interfaz gráfica
npm run test:e2e:ui
```

### Pruebas de Python
```bash
cd face_recognition_service

# Instalar pytest
pip install pytest pytest-asyncio

# Ejecutar pruebas
pytest tests/ -v

# Con cobertura
pytest tests/ --cov=main --cov-report=html
```

## 📊 Métricas de Calidad

### Cobertura de Código
- **Objetivo**: >80% cobertura
- **Frontend**: Jest + Istanbul
- **Backend API**: Jest + Supertest
- **Python Service**: pytest-cov

### Rendimiento
- **Reconocimiento facial**: <500ms
- **API response time**: <200ms
- **Page load time**: <2s

### Criterios de Aceptación

#### Funcionalidad
- ✅ Registro de usuarios exitoso
- ✅ Reconocimiento facial preciso (>90% accuracy)
- ✅ Generación automática de alertas
- ✅ Dashboard en tiempo real
- ✅ Exportación de reportes

#### Seguridad
- ✅ Encriptación de embeddings faciales
- ✅ Validación de entrada en APIs
- ✅ Prevención de ataques de spoofing
- ✅ Audit logging completo

#### Usabilidad
- ✅ Interfaz intuitiva
- ✅ Tiempo de respuesta aceptable
- ✅ Manejo de errores claro
- ✅ Feedback visual apropiado

## 🐛 Debugging y Troubleshooting

### Logs de Aplicación
```bash
# Ver logs de Next.js
npm run dev

# Ver logs de Python service
cd face_recognition_service
python main.py --log-level debug

# Ver logs de Docker
docker-compose logs -f
```

### Herramientas de Debug
- **Frontend**: React Developer Tools
- **API**: Postman/Insomnia
- **Database**: pgAdmin/DBeaver
- **Python**: pdb/debugpy

### Problemas Comunes

1. **Error de conexión a base de datos**
   - Verificar DATABASE_URL en .env
   - Confirmar que PostgreSQL está ejecutándose

2. **Reconocimiento facial lento**
   - Verificar recursos del sistema
   - Optimizar tamaño de imágenes
   - Considerar GPU acceleration

3. **Errores de CORS**
   - Configurar headers en Next.js
   - Verificar URLs en variables de entorno

## 📈 Monitoreo Continuo

### Métricas a Monitorear
- Tiempo de respuesta de APIs
- Precisión del reconocimiento facial
- Tasa de falsos positivos/negativos
- Uso de recursos del sistema
- Errores y excepciones

### Alertas Automáticas
- Caída del servicio
- Tiempo de respuesta elevado
- Errores críticos
- Uso excesivo de memoria/CPU
