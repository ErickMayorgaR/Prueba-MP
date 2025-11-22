-- =============================================
-- Procedimientos Almacenados
-- DICRI Evidence Management System
-- =============================================

USE DICRI_DB;
GO

-- =============================================
-- PROCEDIMIENTOS PARA USERS
-- =============================================

-- Crear usuario
CREATE OR ALTER PROCEDURE sp_CreateUser
    @username NVARCHAR(100),
    @email NVARCHAR(255),
    @password_hash NVARCHAR(255),
    @role NVARCHAR(50),
    @full_name NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Users (username, email, password_hash, role, full_name)
    VALUES (@username, @email, @password_hash, @role, @full_name);

    SELECT * FROM Users WHERE id = SCOPE_IDENTITY();
END
GO

-- Obtener usuario por email
CREATE OR ALTER PROCEDURE sp_GetUserByEmail
    @email NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Users WHERE email = @email AND is_active = 1;
END
GO

-- Obtener usuario por ID
CREATE OR ALTER PROCEDURE sp_GetUserById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Users WHERE id = @id;
END
GO

-- Listar usuarios
CREATE OR ALTER PROCEDURE sp_ListUsers
    @role NVARCHAR(50) = NULL,
    @is_active BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM Users
    WHERE (@role IS NULL OR role = @role)
    AND (@is_active IS NULL OR is_active = @is_active)
    ORDER BY created_at DESC;
END
GO

-- Actualizar usuario
CREATE OR ALTER PROCEDURE sp_UpdateUser
    @id INT,
    @username NVARCHAR(100),
    @email NVARCHAR(255),
    @role NVARCHAR(50),
    @full_name NVARCHAR(255),
    @is_active BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET username = @username,
        email = @email,
        role = @role,
        full_name = @full_name,
        is_active = @is_active,
        updated_at = GETDATE()
    WHERE id = @id;

    SELECT * FROM Users WHERE id = @id;
END
GO

-- =============================================
-- PROCEDIMIENTOS PARA EXPEDIENTES
-- =============================================

-- Crear expediente
CREATE OR ALTER PROCEDURE sp_CreateExpediente
    @case_number NVARCHAR(50),
    @title NVARCHAR(255),
    @description NVARCHAR(MAX),
    @technician_id INT,
    @location NVARCHAR(500),
    @incident_date DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Expedientes (case_number, title, description, status, technician_id, location, incident_date)
    VALUES (@case_number, @title, @description, 'EN_REGISTRO', @technician_id, @location, @incident_date);

    SELECT * FROM Expedientes WHERE id = SCOPE_IDENTITY();
END
GO

-- Obtener expediente por ID con información del técnico y coordinador
CREATE OR ALTER PROCEDURE sp_GetExpedienteById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.*,
        t.username as technician_username,
        t.full_name as technician_name,
        c.username as coordinator_username,
        c.full_name as coordinator_name,
        (SELECT COUNT(*) FROM Indicios WHERE expediente_id = e.id) as indicios_count
    FROM Expedientes e
    LEFT JOIN Users t ON e.technician_id = t.id
    LEFT JOIN Users c ON e.coordinator_id = c.id
    WHERE e.id = @id;
END
GO

-- Listar expedientes con filtros
CREATE OR ALTER PROCEDURE sp_ListExpedientes
    @status NVARCHAR(50) = NULL,
    @technician_id INT = NULL,
    @coordinator_id INT = NULL,
    @start_date DATETIME2 = NULL,
    @end_date DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.*,
        t.full_name as technician_name,
        c.full_name as coordinator_name,
        (SELECT COUNT(*) FROM Indicios WHERE expediente_id = e.id) as indicios_count
    FROM Expedientes e
    LEFT JOIN Users t ON e.technician_id = t.id
    LEFT JOIN Users c ON e.coordinator_id = c.id
    WHERE
        (@status IS NULL OR e.status = @status)
        AND (@technician_id IS NULL OR e.technician_id = @technician_id)
        AND (@coordinator_id IS NULL OR e.coordinator_id = @coordinator_id)
        AND (@start_date IS NULL OR e.created_at >= @start_date)
        AND (@end_date IS NULL OR e.created_at <= @end_date)
    ORDER BY e.created_at DESC;
END
GO

-- Actualizar expediente
CREATE OR ALTER PROCEDURE sp_UpdateExpediente
    @id INT,
    @title NVARCHAR(255),
    @description NVARCHAR(MAX),
    @location NVARCHAR(500),
    @incident_date DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Expedientes
    SET title = @title,
        description = @description,
        location = @location,
        incident_date = @incident_date,
        updated_at = GETDATE()
    WHERE id = @id AND status = 'EN_REGISTRO';

    SELECT * FROM Expedientes WHERE id = @id;
END
GO

-- Enviar expediente a revisión
CREATE OR ALTER PROCEDURE sp_SubmitExpedienteForReview
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    -- Verificar que el expediente tiene al menos un indicio
    DECLARE @indicios_count INT;
    SELECT @indicios_count = COUNT(*) FROM Indicios WHERE expediente_id = @id;

    IF @indicios_count = 0
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50001, 'El expediente debe tener al menos un indicio antes de enviarlo a revisión', 1;
    END

    UPDATE Expedientes
    SET status = 'EN_REVISION',
        submitted_at = GETDATE(),
        updated_at = GETDATE()
    WHERE id = @id AND status = 'EN_REGISTRO';

    COMMIT TRANSACTION;

    SELECT * FROM Expedientes WHERE id = @id;
END
GO

-- Aprobar expediente
CREATE OR ALTER PROCEDURE sp_ApproveExpediente
    @id INT,
    @coordinator_id INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Expedientes
    SET status = 'APROBADO',
        coordinator_id = @coordinator_id,
        reviewed_at = GETDATE(),
        approved_at = GETDATE(),
        updated_at = GETDATE(),
        rejection_reason = NULL
    WHERE id = @id AND status = 'EN_REVISION';

    SELECT * FROM Expedientes WHERE id = @id;
END
GO

-- Rechazar expediente
CREATE OR ALTER PROCEDURE sp_RejectExpediente
    @id INT,
    @coordinator_id INT,
    @rejection_reason NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    IF @rejection_reason IS NULL OR LEN(TRIM(@rejection_reason)) = 0
    BEGIN
        THROW 50002, 'Debe proporcionar una razón de rechazo', 1;
    END

    UPDATE Expedientes
    SET status = 'RECHAZADO',
        coordinator_id = @coordinator_id,
        rejection_reason = @rejection_reason,
        reviewed_at = GETDATE(),
        updated_at = GETDATE()
    WHERE id = @id AND status = 'EN_REVISION';

    SELECT * FROM Expedientes WHERE id = @id;
END
GO

-- Reabrir expediente rechazado para corrección
CREATE OR ALTER PROCEDURE sp_ReopenExpediente
    @id INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Expedientes
    SET status = 'EN_REGISTRO',
        updated_at = GETDATE()
    WHERE id = @id AND status = 'RECHAZADO';

    SELECT * FROM Expedientes WHERE id = @id;
END
GO

-- =============================================
-- PROCEDIMIENTOS PARA INDICIOS
-- =============================================

-- Crear indicio
CREATE OR ALTER PROCEDURE sp_CreateIndicio
    @expediente_id INT,
    @code NVARCHAR(50),
    @description NVARCHAR(MAX),
    @color NVARCHAR(100),
    @size NVARCHAR(100),
    @weight NVARCHAR(100),
    @location NVARCHAR(500),
    @technician_id INT,
    @observations NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    -- Verificar que el expediente está en estado EN_REGISTRO
    DECLARE @status NVARCHAR(50);
    SELECT @status = status FROM Expedientes WHERE id = @expediente_id;

    IF @status != 'EN_REGISTRO'
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50003, 'Solo se pueden agregar indicios a expedientes en estado EN_REGISTRO', 1;
    END

    INSERT INTO Indicios (expediente_id, code, description, color, size, weight, location, technician_id, observations)
    VALUES (@expediente_id, @code, @description, @color, @size, @weight, @location, @technician_id, @observations);

    -- Actualizar fecha de modificación del expediente
    UPDATE Expedientes SET updated_at = GETDATE() WHERE id = @expediente_id;

    COMMIT TRANSACTION;

    SELECT * FROM Indicios WHERE id = SCOPE_IDENTITY();
END
GO

-- Obtener indicio por ID
CREATE OR ALTER PROCEDURE sp_GetIndicioById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        i.*,
        t.full_name as technician_name
    FROM Indicios i
    LEFT JOIN Users t ON i.technician_id = t.id
    WHERE i.id = @id;
END
GO

-- Listar indicios de un expediente
CREATE OR ALTER PROCEDURE sp_ListIndiciosByExpediente
    @expediente_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        i.*,
        t.full_name as technician_name
    FROM Indicios i
    LEFT JOIN Users t ON i.technician_id = t.id
    WHERE i.expediente_id = @expediente_id
    ORDER BY i.created_at ASC;
END
GO

-- Actualizar indicio
CREATE OR ALTER PROCEDURE sp_UpdateIndicio
    @id INT,
    @code NVARCHAR(50),
    @description NVARCHAR(MAX),
    @color NVARCHAR(100),
    @size NVARCHAR(100),
    @weight NVARCHAR(100),
    @location NVARCHAR(500),
    @observations NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    -- Verificar que el expediente está en estado EN_REGISTRO
    DECLARE @expediente_id INT, @status NVARCHAR(50);

    SELECT @expediente_id = expediente_id FROM Indicios WHERE id = @id;
    SELECT @status = status FROM Expedientes WHERE id = @expediente_id;

    IF @status != 'EN_REGISTRO'
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50004, 'Solo se pueden modificar indicios de expedientes en estado EN_REGISTRO', 1;
    END

    UPDATE Indicios
    SET code = @code,
        description = @description,
        color = @color,
        size = @size,
        weight = @weight,
        location = @location,
        observations = @observations,
        updated_at = GETDATE()
    WHERE id = @id;

    -- Actualizar fecha de modificación del expediente
    UPDATE Expedientes SET updated_at = GETDATE() WHERE id = @expediente_id;

    COMMIT TRANSACTION;

    SELECT * FROM Indicios WHERE id = @id;
END
GO

-- Eliminar indicio
CREATE OR ALTER PROCEDURE sp_DeleteIndicio
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    -- Verificar que el expediente está en estado EN_REGISTRO
    DECLARE @expediente_id INT, @status NVARCHAR(50);

    SELECT @expediente_id = expediente_id FROM Indicios WHERE id = @id;
    SELECT @status = status FROM Expedientes WHERE id = @expediente_id;

    IF @status != 'EN_REGISTRO'
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50005, 'Solo se pueden eliminar indicios de expedientes en estado EN_REGISTRO', 1;
    END

    DELETE FROM Indicios WHERE id = @id;

    -- Actualizar fecha de modificación del expediente
    UPDATE Expedientes SET updated_at = GETDATE() WHERE id = @expediente_id;

    COMMIT TRANSACTION;
END
GO

-- =============================================
-- PROCEDIMIENTOS PARA REPORTES Y ESTADÍSTICAS
-- =============================================

-- Estadísticas generales
CREATE OR ALTER PROCEDURE sp_GetGeneralStats
    @start_date DATETIME2 = NULL,
    @end_date DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(*) as total_expedientes,
        SUM(CASE WHEN status = 'EN_REGISTRO' THEN 1 ELSE 0 END) as en_registro,
        SUM(CASE WHEN status = 'EN_REVISION' THEN 1 ELSE 0 END) as en_revision,
        SUM(CASE WHEN status = 'APROBADO' THEN 1 ELSE 0 END) as aprobados,
        SUM(CASE WHEN status = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados,
        (SELECT COUNT(*) FROM Indicios i
         INNER JOIN Expedientes e ON i.expediente_id = e.id
         WHERE (@start_date IS NULL OR e.created_at >= @start_date)
         AND (@end_date IS NULL OR e.created_at <= @end_date)) as total_indicios
    FROM Expedientes
    WHERE (@start_date IS NULL OR created_at >= @start_date)
    AND (@end_date IS NULL OR created_at <= @end_date);
END
GO

-- Estadísticas por técnico
CREATE OR ALTER PROCEDURE sp_GetStatsByTechnician
    @start_date DATETIME2 = NULL,
    @end_date DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.id,
        u.full_name,
        COUNT(e.id) as total_expedientes,
        SUM(CASE WHEN e.status = 'APROBADO' THEN 1 ELSE 0 END) as aprobados,
        SUM(CASE WHEN e.status = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados,
        (SELECT COUNT(*) FROM Indicios WHERE technician_id = u.id) as total_indicios
    FROM Users u
    LEFT JOIN Expedientes e ON u.id = e.technician_id
        AND (@start_date IS NULL OR e.created_at >= @start_date)
        AND (@end_date IS NULL OR e.created_at <= @end_date)
    WHERE u.role = 'TECNICO' AND u.is_active = 1
    GROUP BY u.id, u.full_name
    ORDER BY total_expedientes DESC;
END
GO

-- Auditoría: Registrar acción
CREATE OR ALTER PROCEDURE sp_CreateAuditLog
    @user_id INT,
    @action NVARCHAR(100),
    @entity_type NVARCHAR(100),
    @entity_id INT,
    @details NVARCHAR(MAX),
    @ip_address NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO AuditLog (user_id, action, entity_type, entity_id, details, ip_address)
    VALUES (@user_id, @action, @entity_type, @entity_id, @details, @ip_address);
END
GO

-- Obtener logs de auditoría
CREATE OR ALTER PROCEDURE sp_GetAuditLogs
    @user_id INT = NULL,
    @entity_type NVARCHAR(100) = NULL,
    @start_date DATETIME2 = NULL,
    @end_date DATETIME2 = NULL,
    @limit INT = 100
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@limit)
        a.*,
        u.full_name as user_name,
        u.role as user_role
    FROM AuditLog a
    LEFT JOIN Users u ON a.user_id = u.id
    WHERE
        (@user_id IS NULL OR a.user_id = @user_id)
        AND (@entity_type IS NULL OR a.entity_type = @entity_type)
        AND (@start_date IS NULL OR a.created_at >= @start_date)
        AND (@end_date IS NULL OR a.created_at <= @end_date)
    ORDER BY a.created_at DESC;
END
GO

PRINT 'Procedimientos almacenados creados exitosamente';
