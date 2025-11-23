-- =============================================
-- Base de Datos: DICRI Evidence Management System
-- Ministerio Público de Guatemala
-- =============================================

-- Crear base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'DICRI_DB')
BEGIN
    CREATE DATABASE DICRI_DB;
END
GO

USE DICRI_DB;
GO

-- =============================================
-- Tabla: Users
-- Descripción: Almacena los usuarios del sistema
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(100) NOT NULL UNIQUE,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'TECNICO', 'COORDINADOR')),
        full_name NVARCHAR(255) NOT NULL,
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );

    CREATE INDEX IX_Users_Role ON Users(role);
    CREATE INDEX IX_Users_Email ON Users(email);
END
GO

-- =============================================
-- Tabla: Expedientes
-- Descripción: Almacena los expedientes DICRI
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Expedientes')
BEGIN
    CREATE TABLE Expedientes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        case_number NVARCHAR(50) NOT NULL UNIQUE,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        status NVARCHAR(50) NOT NULL CHECK (status IN ('EN_REGISTRO', 'EN_REVISION', 'APROBADO', 'RECHAZADO')),
        technician_id INT NOT NULL,
        coordinator_id INT NULL,
        rejection_reason NVARCHAR(MAX) NULL,
        location NVARCHAR(500),
        incident_date DATETIME2,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        submitted_at DATETIME2 NULL,
        reviewed_at DATETIME2 NULL,
        approved_at DATETIME2 NULL,
        CONSTRAINT FK_Expedientes_Technician FOREIGN KEY (technician_id) REFERENCES Users(id),
        CONSTRAINT FK_Expedientes_Coordinator FOREIGN KEY (coordinator_id) REFERENCES Users(id)
    );

    CREATE INDEX IX_Expedientes_Status ON Expedientes(status);
    CREATE INDEX IX_Expedientes_Technician ON Expedientes(technician_id);
    CREATE INDEX IX_Expedientes_CaseNumber ON Expedientes(case_number);
    CREATE INDEX IX_Expedientes_CreatedAt ON Expedientes(created_at);
END
GO

-- =============================================
-- Tabla: Indicios
-- Descripción: Almacena los indicios de cada expediente
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Indicios')
BEGIN
    CREATE TABLE Indicios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        expediente_id INT NOT NULL,
        code NVARCHAR(50) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        color NVARCHAR(100),
        size NVARCHAR(100),
        weight NVARCHAR(100),
        location NVARCHAR(500),
        technician_id INT NOT NULL,
        observations NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_Indicios_Expediente FOREIGN KEY (expediente_id) REFERENCES Expedientes(id) ON DELETE CASCADE,
        CONSTRAINT FK_Indicios_Technician FOREIGN KEY (technician_id) REFERENCES Users(id),
        CONSTRAINT UQ_Indicios_Code_Expediente UNIQUE (expediente_id, code)
    );

    CREATE INDEX IX_Indicios_Expediente ON Indicios(expediente_id);
    CREATE INDEX IX_Indicios_Technician ON Indicios(technician_id);
END
GO

-- =============================================
-- Tabla: AuditLog
-- Descripción: Registro de auditoría de acciones del sistema
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLog')
BEGIN
    CREATE TABLE AuditLog (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NULL,
        action NVARCHAR(100) NOT NULL,
        entity_type NVARCHAR(100) NOT NULL,
        entity_id INT NULL,
        details NVARCHAR(MAX),
        ip_address NVARCHAR(50),
        created_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_AuditLog_User FOREIGN KEY (user_id) REFERENCES Users(id)
    );

    CREATE INDEX IX_AuditLog_User ON AuditLog(user_id);
    CREATE INDEX IX_AuditLog_CreatedAt ON AuditLog(created_at);
    CREATE INDEX IX_AuditLog_EntityType ON AuditLog(entity_type);
END
GO

-- =============================================
-- Insertar usuarios por defecto
-- =============================================
IF NOT EXISTS (SELECT * FROM Users WHERE username = 'admin')
BEGIN
    INSERT INTO Users (username, email, password_hash, role, full_name)
    VALUES
        ('admin', 'admin@dicri.gob.gt', '$2a$10$kyqatbMufIhIu6cHMI1jEe9Ioqo6fRpkHM2dhebWzFoHd3O/H0Lja', 'ADMIN', 'Administrador del Sistema'),
        ('coordinador1', 'coordinador1@dicri.gob.gt', '$2a$10$3S2.jdXE4.GYUE7K0sOUvutHxByJZm7DAnT9K4e02IquMia.Wflh6', 'COORDINADOR', 'Coordinador Principal'),
        ('tecnico1', 'tecnico1@dicri.gob.gt', '$2a$10$3IHTn0sBNqlSUT9PWkn/xuFUCni1ccJO/Ro3JJxegW8FGHbWho0ja', 'TECNICO', 'Técnico de Campo 1');
    
    PRINT 'Usuarios de prueba creados exitosamente';
END
ELSE
BEGIN
    PRINT 'Los usuarios de prueba ya existen, omitiendo creación';
END
GO

PRINT 'Base de datos DICRI_DB creada exitosamente';

IF NOT EXISTS (SELECT * FROM Expedientes WHERE case_number = 'DICRI-2024-001')
BEGIN
    PRINT 'Insertando datos de prueba...';

    DECLARE @TecnicoId INT = (SELECT id FROM Users WHERE username = 'tecnico1');
    DECLARE @CoordinadorId INT = (SELECT id FROM Users WHERE username = 'coordinador1');

    INSERT INTO Expedientes (
        case_number, 
        title, 
        description, 
        status, 
        technician_id, 
        coordinator_id, 
        location, 
        incident_date,
        created_at,
        submitted_at,
        reviewed_at,
        approved_at
    )
    VALUES (
        'DICRI-2024-001',
        'Hurto agravado en zona comercial',
        'Sustracción de mercadería de establecimiento comercial en horario nocturno. Se recuperaron evidencias en el lugar.',
        'APROBADO',
        @TecnicoId,
        @CoordinadorId,
        'Zona 10, Ciudad de Guatemala - Centro Comercial Oakland',
        DATEADD(DAY, -15, GETDATE()),
        DATEADD(DAY, -15, GETDATE()),
        DATEADD(DAY, -13, GETDATE()),
        DATEADD(DAY, -12, GETDATE()),
        DATEADD(DAY, -12, GETDATE())
    );

    DECLARE @Expediente1Id INT = SCOPE_IDENTITY();

    INSERT INTO Indicios (expediente_id, code, description, color, size, weight, location, technician_id, observations, created_at)
    VALUES 
    (@Expediente1Id, 'IND-001-A', 'Destornillador tipo paleta', 'Gris metálico', '20cm x 2cm', '150g', 'Encontrado junto a puerta de acceso trasero', @TecnicoId, 'Presenta marcas de uso reciente. Posibles huellas dactilares en mango.', DATEADD(DAY, -15, GETDATE())),
    (@Expediente1Id, 'IND-001-B', 'Fragmentos de vidrio', 'Transparente', 'Varios fragmentos pequeños', '50g', 'Dispersos en el piso cerca de la caja registradora', @TecnicoId, 'Vidrio templado, consistente con el de la vitrina rota.', DATEADD(DAY, -15, GETDATE())),
    (@Expediente1Id, 'IND-001-C', 'Guante de látex', 'Azul', 'Talla M', '5g', 'Encontrado en el área de bodega', @TecnicoId, 'Guante quirúrgico desechable, marca reconocible.', DATEADD(DAY, -15, GETDATE()));

    INSERT INTO Expedientes (
        case_number, 
        title, 
        description, 
        status, 
        technician_id, 
        coordinator_id,
        rejection_reason,
        location, 
        incident_date,
        created_at,
        submitted_at,
        reviewed_at
    )
    VALUES (
        'DICRI-2024-002',
        'Robo de vehículo en estacionamiento privado',
        'Vehículo reportado como sustraído de estacionamiento de residencial.',
        'RECHAZADO',
        @TecnicoId,
        @CoordinadorId,
        'Faltan fotografías de la escena del crimen. La descripción de los indicios es incompleta y no se especifica la cadena de custodia. Favor de completar la documentación fotográfica y revisar los procedimientos de recolección.',
        'Zona 15, Ciudad de Guatemala - Residencial Las Luces',
        DATEADD(DAY, -10, GETDATE()),
        DATEADD(DAY, -10, GETDATE()),
        DATEADD(DAY, -8, GETDATE()),
        DATEADD(DAY, -7, GETDATE())
    );

    DECLARE @Expediente2Id INT = SCOPE_IDENTITY();

    INSERT INTO Indicios (expediente_id, code, description, color, size, weight, location, technician_id, observations, created_at)
    VALUES 
    (@Expediente2Id, 'IND-002-A', 'Cable de cobre cortado', 'Cobre', '15cm', '80g', 'Junto al portón de acceso', @TecnicoId, 'Cable utilizado aparentemente para manipular cerradura eléctrica.', DATEADD(DAY, -10, GETDATE())),
    (@Expediente2Id, 'IND-002-B', 'Colilla de cigarro', 'Blanco con filtro naranja', '3cm', '2g', 'En el suelo del estacionamiento', @TecnicoId, 'Marca comercial identificable.', DATEADD(DAY, -10, GETDATE()));

    INSERT INTO Expedientes (
        case_number, 
        title, 
        description, 
        status, 
        technician_id,
        location, 
        incident_date,
        created_at,
        submitted_at
    )
    VALUES (
        'DICRI-2024-003',
        'Lesiones graves por arma blanca',
        'Agresión con arma blanca en vía pública. Víctima trasladada a hospital. Se recolectaron evidencias en la escena.',
        'EN_REVISION',
        @TecnicoId,
        'Zona 18, Ciudad de Guatemala - Avenida Petapa',
        DATEADD(DAY, -5, GETDATE()),
        DATEADD(DAY, -5, GETDATE()),
        DATEADD(DAY, -2, GETDATE())
    );

    DECLARE @Expediente3Id INT = SCOPE_IDENTITY();

    INSERT INTO Indicios (expediente_id, code, description, color, size, weight, location, technician_id, observations, created_at)
    VALUES 
    (@Expediente3Id, 'IND-003-A', 'Cuchillo tipo cocina', 'Mango negro, hoja plateada', '25cm x 4cm', '200g', 'Encontrado a 5 metros del lugar de la agresión', @TecnicoId, 'Presenta manchas de sustancia rojiza compatible con sangre. Hoja con filo de un solo lado.', DATEADD(DAY, -5, GETDATE())),
    (@Expediente3Id, 'IND-003-B', 'Prenda de vestir (camisa)', 'Roja', 'Talla L', '150g', 'Abandonada en el lugar', @TecnicoId, 'Camisa tipo polo con manchas de sangre y rasgadura en área frontal.', DATEADD(DAY, -5, GETDATE())),
    (@Expediente3Id, 'IND-003-C', 'Muestra de sangre en pavimento', 'Rojo oscuro', 'Mancha de 10cm diámetro', 'N/A', 'En el punto exacto donde ocurrió la agresión', @TecnicoId, 'Muestra recolectada para análisis de ADN. Coordenadas GPS registradas.', DATEADD(DAY, -5, GETDATE()));

    INSERT INTO Expedientes (
        case_number, 
        title, 
        description, 
        status, 
        technician_id,
        location, 
        incident_date,
        created_at
    )
    VALUES (
        'DICRI-2024-004',
        'Allanamiento de morada',
        'Ingreso no autorizado a vivienda. Se reporta sustracción de objetos de valor. Investigación en curso.',
        'EN_REGISTRO',
        @TecnicoId,
        'Zona 7, Ciudad de Guatemala - Colonia Centroamérica',
        DATEADD(DAY, -3, GETDATE()),
        DATEADD(DAY, -3, GETDATE())
    );

    DECLARE @Expediente4Id INT = SCOPE_IDENTITY();

    INSERT INTO Indicios (expediente_id, code, description, color, size, weight, location, technician_id, observations, created_at)
    VALUES 
    (@Expediente4Id, 'IND-004-A', 'Huella de calzado', 'Marca de suela en polvo', '28cm x 10cm', 'N/A', 'Entrada principal de la vivienda', @TecnicoId, 'Huella compatible con calzado deportivo. Patrón de suela fotografiado y moldeado.', DATEADD(DAY, -3, GETDATE())),
    (@Expediente4Id, 'IND-004-B', 'Marco de ventana forzado', 'Madera color café', '80cm x 60cm', '2kg', 'Ventana lateral de la vivienda', @TecnicoId, 'Presenta marcas de herramienta tipo palanca. Pintura descascarada en punto de fuerza.', DATEADD(DAY, -3, GETDATE()));

    INSERT INTO Expedientes (
        case_number, 
        title, 
        description, 
        status, 
        technician_id, 
        coordinator_id,
        location, 
        incident_date,
        created_at,
        submitted_at,
        reviewed_at,
        approved_at
    )
    VALUES (
        'DICRI-2024-005',
        'Falsificación de documentos públicos',
        'Se detectó la circulación de documentos de identificación falsificados. Se decomisaron especímenes para análisis.',
        'APROBADO',
        @TecnicoId,
        @CoordinadorId,
        'Zona 1, Ciudad de Guatemala - Centro Histórico',
        DATEADD(DAY, -20, GETDATE()),
        DATEADD(DAY, -20, GETDATE()),
        DATEADD(DAY, -18, GETDATE()),
        DATEADD(DAY, -17, GETDATE()),
        DATEADD(DAY, -17, GETDATE())
    );

    DECLARE @Expediente5Id INT = SCOPE_IDENTITY();

    INSERT INTO Indicios (expediente_id, code, description, color, size, weight, location, technician_id, observations, created_at)
    VALUES 
    (@Expediente5Id, 'IND-005-A', 'DPI falsificado', 'Plástico con impresión', '8.5cm x 5.5cm', '10g', 'Incautado durante operativo', @TecnicoId, 'Documento con holograma de baja calidad. Número de serie irregular. Fotografía aplicada con método no oficial.', DATEADD(DAY, -20, GETDATE())),
    (@Expediente5Id, 'IND-005-B', 'Impresora térmica', 'Negro', '30cm x 20cm x 15cm', '3kg', 'Encontrada en local comercial', @TecnicoId, 'Impresora especializada para tarjetas plásticas. Contiene memoria con archivos de diseño.', DATEADD(DAY, -20, GETDATE())),
    (@Expediente5Id, 'IND-005-C', 'Láminas de plástico PVC', 'Blanco', '21cm x 30cm', '500g (paquete de 100)', 'En bodega del local', @TecnicoId, 'Material compatible con el utilizado en documentos oficiales. 100 láminas sin usar.', DATEADD(DAY, -20, GETDATE()));

    PRINT 'Datos de prueba insertados exitosamente:';
    PRINT '- 5 expedientes creados';
    PRINT '- APROBADOS: 2 expedientes';
    PRINT '- RECHAZADO: 1 expediente';
    PRINT '- EN_REVISION: 1 expediente';
    PRINT '- EN_REGISTRO: 1 expediente';
    PRINT '- Total indicios: 13';
END
ELSE
BEGIN
    PRINT 'Los datos de prueba ya existen, omitiendo inserción';
    PRINT 'Para reiniciar datos de prueba, elimine el volumen con: docker-compose down -v';
END
GO