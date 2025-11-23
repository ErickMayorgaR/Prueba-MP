# Sistema de Gestión de Evidencias DICRI

**Ministerio Público de Guatemala - Dirección de Investigación Criminalística**

Sistema integral para la gestión, registro y aprobación de expedientes criminalísticos y sus indicios asociados.

## Características

- Gestión completa de expedientes DICRI
- Registro detallado de indicios con validaciones
- Flujo de aprobación de expedientes (Técnico → Coordinador)
- Sistema de roles y permisos (ADMIN, TECNICO, COORDINADOR)
- Reportes y estadísticas en tiempo real
- API RESTful documentada con Swagger
- Interfaz minimalista y profesional
- Arquitectura escalable con Docker
- Seguridad implementada siguiendo mejores prácticas

## Tecnologías

### Backend
- Node.js 18 + Express + TypeScript
- TypeORM + SQL Server 2022
- JWT Authentication
- Swagger/OpenAPI
- Jest para testing

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Router
- Axios
- Formik + Yup

### Infraestructura
- Docker + Docker Compose
- Nginx
- SQL Server 2022

## Instalación Rápida

### Prerequisitos

- Docker y Docker Compose
- Git

### Pasos

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd Prueba_Erick
```

2. **Configurar variables de entorno**

Crear archivo `backend/.env`:

```env
 environment:
      NODE_ENV: production
      PORT: 5000
      API_VERSION: v1
      DB_HOST: database
      DB_PORT: 1433
      DB_USERNAME: sa
      DB_PASSWORD: 'DICRI_MP_Guatemala_2024!'
      DB_DATABASE: DICRI_DB
      DB_ENCRYPT: 'false'
      DB_TRUST_SERVER_CERTIFICATE: 'true'
      JWT_SECRET: 'd1cr1_mp_gt_s3cr3t_k3y_pr0duct10n_2024_s3cur3'
      JWT_REFRESH_SECRET: 'd1cr1_mp_gt_r3fr3sh_s3cr3t_k3y_pr0duct10n_2024'
      JWT_EXPIRES_IN: '24h'
      JWT_REFRESH_EXPIRES_IN: '7d'
      CORS_ORIGIN: 'http://localhost:3000'
      RATE_LIMIT_WINDOW_MS: '900000'
      RATE_LIMIT_MAX_REQUESTS: '100'
      LOG_LEVEL: 'info'
      LOG_DIR: 'logs'
```

3. **Iniciar la aplicación**

```bash
docker-compose up -d
```

5. **Acceder a la aplicación**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

## Usuarios por Defecto

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| admin | admin@dicri.gob.gt | Admin123! | ADMIN |
| tecnico1 | tecnico1@dicri.gob.gt | Tecnico123! | TECNICO |
| coordinador1 | coordinador1@dicri.gob.gt | Coord123! | COORDINADOR |

**IMPORTANTE:** Cambiar las contraseñas en producción.

## Flujo de Trabajo

### 1. Creación de Expediente
1. Técnico inicia sesión
2. Crea un nuevo expediente (estado: EN_REGISTRO)
3. Agrega indicios al expediente

### 2. Envío a Revisión
1. Técnico completa el registro de todos los indicios
2. Envía el expediente a revisión (estado: EN_REVISION)

### 3. Aprobación/Rechazo
1. Coordinador revisa el expediente
2. Aprueba o rechaza con justificación
3. Si es rechazado, técnico puede reabrirlo

## Seguridad

- JWT Authentication
- Bcrypt password hashing
- Helmet security headers
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention
- Audit logging

## Docker Commands

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir
docker-compose build
```

---
