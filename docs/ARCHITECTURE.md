# Diagrama de Arquitectura - Sistema de Gestión de Evidencias DICRI

## Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                            │
│              (Técnicos, Coordinadores, Administradores)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN                        │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Frontend (React + TypeScript)                  │ │
│  │                                                              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Login   │  │Dashboard │  │Expedientes│ │  Stats   │   │ │
│  │  │   Page   │  │   Page   │  │   Page    │ │   Page   │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │    Context API (AuthContext, AppContext)            │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │    Services (apiService, authService)               │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  Tecnologías:                                                │ │
│  │  - React 18                                                  │ │
│  │  - TypeScript                                                │ │
│  │  - Tailwind CSS                                              │ │
│  │  - React Router                                              │ │
│  │  - Axios                                                     │ │
│  │  - Formik + Yup                                              │ │
│  └──────────────────────────────────────────────────────────── │ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/HTTP
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CAPA DE APLICACIÓN                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Backend API (Node.js + Express)                   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │          Middleware de Seguridad                     │   │ │
│  │  │  - Helmet (Security Headers)                         │   │ │
│  │  │  - CORS                                               │   │ │
│  │  │  - Rate Limiting                                      │   │ │
│  │  │  - JWT Authentication                                 │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │                  Routes (API Endpoints)              │   │ │
│  │  │  - /auth    (Autenticación)                          │   │ │
│  │  │  - /users   (Gestión de usuarios)                    │   │ │
│  │  │  - /expedientes (Gestión de expedientes)             │   │ │
│  │  │  - /indicios (Gestión de indicios)                   │   │ │
│  │  │  - /stats   (Reportes y estadísticas)                │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │             Controllers (Lógica de Control)          │   │ │
│  │  │  - AuthController                                     │   │ │
│  │  │  - UserController                                     │   │ │
│  │  │  - ExpedienteController                               │   │ │
│  │  │  - IndicioController                                  │   │ │
│  │  │  - StatsController                                    │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │         Services (Lógica de Negocio)                 │   │ │
│  │  │  - AuthService                                        │   │ │
│  │  │  - UserService                                        │   │ │
│  │  │  - ExpedienteService                                  │   │ │
│  │  │  - IndicioService                                     │   │ │
│  │  │  - StatsService                                       │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │        DTOs (Validación de Datos)                    │   │ │
│  │  │  - Class Validator                                    │   │ │
│  │  │  - Class Transformer                                  │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  Tecnologías:                                                │ │
│  │  - Node.js 18                                                │ │
│  │  - Express.js                                                │ │
│  │  - TypeScript                                                │ │
│  │  - TypeORM                                                   │ │
│  │  - JWT                                                       │ │
│  │  - Bcrypt                                                    │ │
│  └──────────────────────────────────────────────────────────── │ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ TypeORM
                              │ Stored Procedures
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE PERSISTENCIA                        │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              SQL Server 2022                                │ │
│  │                                                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │   Users     │  │ Expedientes │  │   Indicios  │        │ │
│  │  │  (Tabla)    │  │   (Tabla)   │  │   (Tabla)   │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │          Stored Procedures                           │   │ │
│  │  │  - sp_CreateExpediente                               │   │ │
│  │  │  - sp_GetExpedienteById                              │   │ │
│  │  │  - sp_ApproveExpediente                              │   │ │
│  │  │  - sp_RejectExpediente                               │   │ │
│  │  │  - sp_CreateIndicio                                  │   │ │
│  │  │  - sp_GetGeneralStats                                │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │              Audit Log                               │   │ │
│  │  │  (Registro de todas las acciones)                    │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────── │ │
└─────────────────────────────────────────────────────────────────┘

```

## Flujo de Datos

### 1. Autenticación
```
Usuario → Frontend → POST /api/v1/auth/login → AuthController
  → AuthService → Database → Generar JWT → Frontend → Storage (localStorage)
```

### 2. Creación de Expediente
```
Técnico → Frontend → POST /api/v1/expedientes → JWT Validation
  → ExpedienteController → ExpedienteService → Database (sp_CreateExpediente)
  → Response → Frontend
```

### 3. Aprobación de Expediente
```
Coordinador → Frontend → POST /api/v1/expedientes/:id/approve
  → JWT + Role Validation (COORDINADOR) → ExpedienteController
  → ExpedienteService → Database (sp_ApproveExpediente) → Audit Log
  → Response → Frontend
```

## Seguridad Implementada

### Frontend
- Validación de formularios con Formik + Yup
- Sanitización de inputs
- Protección de rutas
- Almacenamiento seguro de tokens

### Backend
- Helmet (Security Headers)
- CORS configurado
- Rate Limiting
- JWT para autenticación
- Bcrypt para hashing de passwords
- Validación de DTOs con class-validator
- Autorización basada en roles
- Audit logging

### Base de Datos
- Procedimientos almacenados (prevención SQL injection)
- Constraints y validaciones
- Índices para optimización
- Transacciones ACID

## Contenerización (Docker)

```
┌──────────────────────────────────────────────────┐
│             Docker Compose                        │
│                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐ │
│  │   Frontend   │  │   Backend    │  │   DB   │ │
│  │   (Nginx)    │◄─┤  (Node.js)   │◄─┤  (SQL) │ │
│  │   Port 3000  │  │  Port 5000   │  │  1433  │ │
│  └──────────────┘  └──────────────┘  └────────┘ │
│                                                   │
│        Network: dicri-network                     │
│        Volumes: mssql-data                        │
└──────────────────────────────────────────────────┘
```

## Escalabilidad

El sistema está diseñado para ser escalable:

1. **Frontend**: Puede ser servido por CDN
2. **Backend**: Stateless, puede ser escalado horizontalmente
3. **Base de Datos**: Puede configurarse con réplicas y clustering
4. **Docker**: Permite deployment en Kubernetes para auto-scaling

## Monitoreo y Logs

- Winston para logging estructurado
- Health checks en todos los contenedores
- Audit log en base de datos
- Metrics disponibles para integración con Prometheus/Grafana
