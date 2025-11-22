# Diagrama Entidad-Relación - Base de Datos DICRI

## Diagrama ER

```
┌─────────────────────────────────────────┐
│              USERS                       │
├─────────────────────────────────────────┤
│ PK  id (INT)                            │
│     username (NVARCHAR(100)) UNIQUE     │
│     email (NVARCHAR(255)) UNIQUE        │
│     password_hash (NVARCHAR(255))       │
│     role (NVARCHAR(50))                 │
│       CHECK: ADMIN, TECNICO, COORDINADOR│
│     full_name (NVARCHAR(255))           │
│     is_active (BIT) DEFAULT 1           │
│     created_at (DATETIME2)              │
│     updated_at (DATETIME2)              │
└─────────────────────────────────────────┘
        │                    │
        │ 1                  │ 1
        │                    │
        │ technician_id      │ coordinator_id
        ▼                    ▼
┌─────────────────────────────────────────┐
│           EXPEDIENTES                    │
├─────────────────────────────────────────┤
│ PK  id (INT)                            │
│     case_number (NVARCHAR(50)) UNIQUE   │
│     title (NVARCHAR(255))               │
│     description (NVARCHAR(MAX))         │
│     status (NVARCHAR(50))               │
│       CHECK: EN_REGISTRO, EN_REVISION,  │
│              APROBADO, RECHAZADO        │
│ FK  technician_id (INT)                 │
│ FK  coordinator_id (INT) NULL           │
│     rejection_reason (NVARCHAR(MAX))    │
│     location (NVARCHAR(500))            │
│     incident_date (DATETIME2)           │
│     created_at (DATETIME2)              │
│     updated_at (DATETIME2)              │
│     submitted_at (DATETIME2) NULL       │
│     reviewed_at (DATETIME2) NULL        │
│     approved_at (DATETIME2) NULL        │
└─────────────────────────────────────────┘
        │
        │ 1
        │
        │
        ▼ N
┌─────────────────────────────────────────┐
│            INDICIOS                      │
├─────────────────────────────────────────┤
│ PK  id (INT)                            │
│ FK  expediente_id (INT)                 │
│     code (NVARCHAR(50))                 │
│     description (NVARCHAR(MAX))         │
│     color (NVARCHAR(100))               │
│     size (NVARCHAR(100))                │
│     weight (NVARCHAR(100))              │
│     location (NVARCHAR(500))            │
│ FK  technician_id (INT)                 │
│     observations (NVARCHAR(MAX))        │
│     created_at (DATETIME2)              │
│     updated_at (DATETIME2)              │
│ UNIQUE (expediente_id, code)            │
└─────────────────────────────────────────┘
        │
        │ N
        │
        │ technician_id
        ▼ 1
┌─────────────────────────────────────────┐
│              USERS                       │
│         (mismo de arriba)                │
└─────────────────────────────────────────┘


┌─────────────────────────────────────────┐
│           AUDIT_LOG                      │
├─────────────────────────────────────────┤
│ PK  id (INT)                            │
│ FK  user_id (INT) NULL                  │
│     action (NVARCHAR(100))              │
│     entity_type (NVARCHAR(100))         │
│     entity_id (INT)                     │
│     details (NVARCHAR(MAX))             │
│     ip_address (NVARCHAR(50))           │
│     created_at (DATETIME2)              │
└─────────────────────────────────────────┘
        │
        │ N
        │
        │ user_id
        ▼ 1
┌─────────────────────────────────────────┐
│              USERS                       │
│         (mismo de arriba)                │
└─────────────────────────────────────────┘
```

## Relaciones

### 1. USERS → EXPEDIENTES (como Técnico)
- **Tipo**: One-to-Many
- **Descripción**: Un técnico puede crear múltiples expedientes
- **Clave Foránea**: `technician_id` en EXPEDIENTES
- **Restricción**: ON DELETE NO ACTION

### 2. USERS → EXPEDIENTES (como Coordinador)
- **Tipo**: One-to-Many
- **Descripción**: Un coordinador puede revisar múltiples expedientes
- **Clave Foránea**: `coordinator_id` en EXPEDIENTES
- **Restricción**: ON DELETE NO ACTION

### 3. EXPEDIENTES → INDICIOS
- **Tipo**: One-to-Many
- **Descripción**: Un expediente puede tener múltiples indicios
- **Clave Foránea**: `expediente_id` en INDICIOS
- **Restricción**: ON DELETE CASCADE
- **Constraint Único**: (expediente_id, code) - No puede haber dos indicios con el mismo código en un expediente

### 4. USERS → INDICIOS
- **Tipo**: One-to-Many
- **Descripción**: Un técnico registra múltiples indicios
- **Clave Foránea**: `technician_id` en INDICIOS
- **Restricción**: ON DELETE NO ACTION

### 5. USERS → AUDIT_LOG
- **Tipo**: One-to-Many
- **Descripción**: Un usuario puede tener múltiples registros de auditoría
- **Clave Foránea**: `user_id` en AUDIT_LOG
- **Restricción**: ON DELETE SET NULL

## Índices

### USERS
- PRIMARY KEY: `id`
- UNIQUE INDEX: `username`
- UNIQUE INDEX: `email`
- INDEX: `role`

### EXPEDIENTES
- PRIMARY KEY: `id`
- UNIQUE INDEX: `case_number`
- INDEX: `status`
- INDEX: `technician_id`
- INDEX: `coordinator_id`
- INDEX: `created_at`

### INDICIOS
- PRIMARY KEY: `id`
- INDEX: `expediente_id`
- INDEX: `technician_id`
- UNIQUE INDEX: `(expediente_id, code)`

### AUDIT_LOG
- PRIMARY KEY: `id`
- INDEX: `user_id`
- INDEX: `created_at`
- INDEX: `entity_type`

## Reglas de Negocio Implementadas en Base de Datos

### Estados de Expediente
1. **EN_REGISTRO**: Estado inicial, permite agregar/modificar indicios
2. **EN_REVISION**: Enviado para revisión por coordinador
3. **APROBADO**: Aprobado por coordinador
4. **RECHAZADO**: Rechazado por coordinador con razón

### Transiciones de Estado Válidas
```
EN_REGISTRO → EN_REVISION → APROBADO
                         ↓
                    RECHAZADO → EN_REGISTRO
```

### Validaciones
1. Un expediente debe tener al menos 1 indicio antes de enviarse a revisión
2. Solo se pueden modificar expedientes en estado EN_REGISTRO
3. Solo coordinadores pueden aprobar/rechazar expedientes
4. Los rechazos requieren una justificación obligatoria
5. Los códigos de indicios deben ser únicos dentro de un expediente

## Procedimientos Almacenados Principales

1. **sp_CreateExpediente**: Crea un nuevo expediente
2. **sp_GetExpedienteById**: Obtiene expediente con relaciones
3. **sp_SubmitExpedienteForReview**: Envía expediente a revisión
4. **sp_ApproveExpediente**: Aprueba un expediente
5. **sp_RejectExpediente**: Rechaza un expediente
6. **sp_ReopenExpediente**: Reabre un expediente rechazado
7. **sp_CreateIndicio**: Crea un nuevo indicio
8. **sp_UpdateIndicio**: Actualiza un indicio existente
9. **sp_DeleteIndicio**: Elimina un indicio
10. **sp_GetGeneralStats**: Obtiene estadísticas generales
11. **sp_GetStatsByTechnician**: Estadísticas por técnico
12. **sp_CreateAuditLog**: Registra acciones de auditoría

## Consideraciones de Seguridad

1. **SQL Injection Prevention**: Uso de procedimientos almacenados y parámetros
2. **Password Security**: Almacenamiento de hash con bcrypt (nunca password plano)
3. **Audit Trail**: Todas las acciones importantes se registran en AUDIT_LOG
4. **Soft Delete**: Los usuarios se desactivan (is_active = 0) en lugar de eliminarse
5. **Integridad Referencial**: Foreign keys con restricciones apropiadas

## Optimización

1. **Índices**: Índices en columnas frecuentemente consultadas
2. **Stored Procedures**: Reducen round-trips y mejoran performance
3. **Transacciones**: Garantizan consistencia de datos
4. **Pool de Conexiones**: Configurado en TypeORM para mejor rendimiento

## Backup y Recuperación

Se recomienda:
1. Backup completo diario
2. Backup transaccional cada hora
3. Retención de backups por 30 días
4. Procedimientos de recuperación ante desastres documentados
