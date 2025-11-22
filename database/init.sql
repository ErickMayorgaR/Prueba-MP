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
    -- Usuarios de prueba con contraseñas hasheadas
    -- Admin: admin@dicri.gob.gt / Admin123!
    -- Coordinador: coordinador1@dicri.gob.gt / Coord123!
    -- Tecnico: tecnico1@dicri.gob.gt / Tecnico123!
    
    INSERT INTO Users (username, email, password_hash, role, full_name)
    VALUES
        ('admin', 'admin@dicri.gob.gt', '$2a$10$kyqatbMufIhIu6cHMI1jEe9Ioqo6fRpkHM2dhebWzFoHd3O/H0Lja', 'ADMIN', 'Administrador del Sistema'),
        ('coordinador1', 'coordinador1@dicri.gob.gt', '$2a$10$3S2.jdXE4.GYUE7K0sOUvutHxByJZm7DAnT9K4e02IquMia.Wflh6', 'COORDINADOR', 'Coordinador Principal'),
        ('tecnico1', 'tecnico1@dicri.gob.gt', '$2a$10$3IHTn0sBNqlSUT9PWkn/xuFUCni1ccJO/Ro3JJxegW8FGHbWho0ja', 'TECNICO', 'Técnico de Campo 1');
END
GO

PRINT 'Base de datos DICRI_DB creada exitosamente';
