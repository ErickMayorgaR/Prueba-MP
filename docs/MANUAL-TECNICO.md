# Manual Técnico - Sistema de Gestión de Evidencias DICRI

## Ministerio Público de Guatemala

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [API Documentation](#api-documentation)
7. [Seguridad](#seguridad)
8. [Pruebas](#pruebas)
9. [Deployment](#deployment)
10. [Mantenimiento](#mantenimiento)

---

## Introducción

El Sistema de Gestión de Evidencias DICRI es una aplicación web diseñada para facilitar el registro, seguimiento y aprobación de expedientes criminalísticos y sus indicios asociados. El sistema implementa un flujo de trabajo completo desde la creación del expediente por parte de técnicos hasta su revisión y aprobación por coordinadores.

### Características Principales

- Gestión completa de expedientes y evidencias
- Sistema de autenticación y autorización basado en roles
- Flujo de aprobación de expedientes
- Reportes y estadísticas en tiempo real
- Interfaz intuitiva y minimalista
- API RESTful documentada con Swagger
- Arquitectura escalable y segura

---

## Arquitectura del Sistema

El sistema sigue una arquitectura de tres capas:

### 1. Frontend (Capa de Presentación)
- **Framework**: React 18 con TypeScript
- **Estilos**: Tailwind CSS
- **Gestión de Estado**: Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios

### 2. Backend (Capa de Aplicación)
- **Runtime**: Node.js 18
- **Framework**: Express.js con TypeScript
- **ORM**: TypeORM
- **Autenticación**: JWT
- **Validación**: Class-validator
- **Documentación**: Swagger/OpenAPI

### 3. Base de Datos (Capa de Persistencia)
- **DBMS**: Microsoft SQL Server 2022
- **Procedimientos Almacenados**: Optimización de consultas
- **Audit Log**: Registro de todas las operaciones

---

## Tecnologías Utilizadas

### Backend
```json
{
  "express": "^4.18.2",
  "typeorm": "^0.3.19",
  "mssql": "^10.0.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "class-validator": "^0.14.0",
  "winston": "^3.11.0",
  "swagger-jsdoc": "^6.2.8"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "axios": "^1.6.2",
  "formik": "^2.4.5",
  "yup": "^1.3.3",
  "tailwindcss": "^3.4.0"
}
```

---

## Instalación y Configuración

### Requisitos Previos

- Node.js 18+
- Docker y Docker Compose
- SQL Server 2022 (o usar el contenedor Docker)
- Git

### Configuración con Docker (Recomendado)

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Prueba_Erick
```

2. **Configurar variables de entorno**

Crear archivo `.env` en el directorio `backend/`:
```env
NODE_ENV=production
PORT=5000
DB_HOST=database
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrongPassword123!
DB_DATABASE=DICRI_DB
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

3. **Iniciar los contenedores**
```bash
docker-compose up -d
```

4. **Inicializar la base de datos**
```bash
docker exec -it dicri-database /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrongPassword123! \
  -i /docker-entrypoint-initdb.d/init.sql
```

5. **Verificar el deployment**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

### Instalación Manual (Desarrollo)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Estructura del Proyecto

```
Prueba_Erick/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración (DB, Logger)
│   │   ├── controllers/     # Controladores de API
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entities/        # Entidades TypeORM
│   │   ├── middleware/      # Middleware (Auth, Security)
│   │   ├── routes/          # Definición de rutas
│   │   ├── services/        # Lógica de negocio
│   │   ├── utils/           # Utilidades
│   │   └── app.ts           # Aplicación principal
│   ├── tests/               # Pruebas unitarias
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── contexts/        # Context API
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── services/        # Servicios API
│   │   ├── types/           # Tipos TypeScript
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── database/
│   ├── init.sql             # Script de inicialización
│   └── stored-procedures.sql
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE-ER.md
│   └── MANUAL-TECNICO.md
├── docker-compose.yml
└── README.md
```

---

## API Documentation

### Autenticación

#### POST /api/v1/auth/login
Iniciar sesión en el sistema.

**Request:**
```json
{
  "email": "tecnico1@dicri.gob.gt",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "tecnico1@dicri.gob.gt",
      "role": "TECNICO",
      "full_name": "Juan Pérez"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/v1/auth/me
Obtener información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

### Expedientes

#### POST /api/v1/expedientes
Crear un nuevo expediente (Solo TECNICO).

**Request:**
```json
{
  "case_number": "EXP-2024-001",
  "title": "Caso de robo con violencia",
  "description": "Descripción detallada del caso",
  "location": "Zona 1, Guatemala",
  "incident_date": "2024-01-15T10:00:00Z"
}
```

#### GET /api/v1/expedientes
Listar expedientes con filtros opcionales.

**Query Parameters:**
- `status`: EN_REGISTRO | EN_REVISION | APROBADO | RECHAZADO
- `technician_id`: ID del técnico
- `start_date`: Fecha de inicio
- `end_date`: Fecha de fin

#### POST /api/v1/expedientes/:id/submit
Enviar expediente a revisión (Solo TECNICO).

#### POST /api/v1/expedientes/:id/approve
Aprobar expediente (Solo COORDINADOR).

#### POST /api/v1/expedientes/:id/reject
Rechazar expediente (Solo COORDINADOR).

**Request:**
```json
{
  "rejection_reason": "Falta información en los indicios registrados"
}
```

### Indicios

#### POST /api/v1/indicios
Crear un nuevo indicio.

**Request:**
```json
{
  "expediente_id": 1,
  "code": "IND-001",
  "description": "Arma blanca tipo cuchillo",
  "color": "Metálico",
  "size": "20cm",
  "weight": "150g",
  "location": "Encontrado en la escena del crimen",
  "observations": "Presenta huellas dactilares"
}
```

#### GET /api/v1/indicios/expediente/:expedienteId
Obtener todos los indicios de un expediente.

### Estadísticas

#### GET /api/v1/stats/general
Obtener estadísticas generales del sistema.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_expedientes": 150,
    "en_registro": 30,
    "en_revision": 20,
    "aprobados": 85,
    "rechazados": 15,
    "total_indicios": 450
  }
}
```

#### GET /api/v1/stats/technicians
Obtener estadísticas por técnico.

**Documentación Completa:** http://localhost:5000/api-docs

---

## Seguridad

### Autenticación y Autorización

1. **JWT (JSON Web Tokens)**
   - Access Token: 24 horas de validez
   - Refresh Token: 7 días de validez
   - Almacenados de forma segura en localStorage

2. **Roles y Permisos**
   - **ADMIN**: Gestión de usuarios
   - **TECNICO**: Crear y gestionar expedientes e indicios
   - **COORDINADOR**: Aprobar/rechazar expedientes, ver estadísticas

### Medidas de Seguridad Implementadas

1. **Backend**
   - Helmet: Headers de seguridad HTTP
   - CORS: Control de orígenes permitidos
   - Rate Limiting: Prevención de ataques de fuerza bruta
   - Bcrypt: Hashing de contraseñas (10 rounds)
   - SQL Injection Prevention: Procedimientos almacenados y parámetros
   - XSS Protection: Sanitización de inputs
   - Validación de DTOs: Class-validator

2. **Frontend**
   - Validación de formularios: Formik + Yup
   - Sanitización de inputs
   - Protección de rutas
   - HTTPS en producción

3. **Base de Datos**
   - Procedimientos almacenados
   - Transacciones ACID
   - Audit Log
   - Backup automático

### Mejores Prácticas

1. Cambiar las contraseñas por defecto
2. Usar HTTPS en producción
3. Configurar firewalls apropiadamente
4. Mantener dependencias actualizadas
5. Revisar logs de auditoría regularmente

---

## Pruebas

### Pruebas Unitarias (Backend)

```bash
cd backend
npm test
```

### Cobertura de Pruebas

```bash
npm test -- --coverage
```

### Pruebas con Postman

Una colección de Postman está disponible en `postman/` con todos los endpoints configurados.

---

## Deployment

### Producción con Docker

1. **Build de imágenes**
```bash
docker-compose build
```

2. **Deploy**
```bash
docker-compose up -d
```

3. **Verificar estado**
```bash
docker-compose ps
docker-compose logs -f
```

### Configuración de Producción

1. Configurar variables de entorno de producción
2. Configurar HTTPS con certificados SSL
3. Configurar backup automático de base de datos
4. Configurar monitoreo y alertas
5. Implementar CDN para frontend

---

## Mantenimiento

### Backup de Base de Datos

```bash
docker exec dicri-database /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrongPassword123! \
  -Q "BACKUP DATABASE DICRI_DB TO DISK = '/var/opt/mssql/backup/DICRI_DB.bak'"
```

### Logs

```bash
# Backend logs
docker logs dicri-backend

# Base de datos logs
docker logs dicri-database

# Todos los logs
docker-compose logs -f
```

### Actualización del Sistema

```bash
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

---

## Contacto y Soporte

Para soporte técnico, contactar a:
- Email: soporte@dicri.gob.gt
- Documentación: Ver README.md

---

**Ministerio Público de Guatemala**
**Dirección de Investigación Criminalística (DICRI)**
Versión 1.0 - 2024
