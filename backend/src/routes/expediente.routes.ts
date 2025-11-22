import { Router } from 'express';
import { ExpedienteController } from '../controllers/expediente.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { CreateExpedienteDTO, UpdateExpedienteDTO, RejectExpedienteDTO } from '../dto/expediente.dto';
import { UserRole } from '../entities/User';

const router = Router();
const expedienteController = new ExpedienteController();

/**
 * @swagger
 * tags:
 *   name: Expedientes
 *   description: Gestión de expedientes DICRI
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Expediente:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         case_number:
 *           type: string
 *           example: "EXP-2024-001"
 *         title:
 *           type: string
 *           example: "Caso de hurto en zona 10"
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [EN_REGISTRO, EN_REVISION, APROBADO, RECHAZADO]
 *         technician_id:
 *           type: integer
 *         coordinator_id:
 *           type: integer
 *         rejection_reason:
 *           type: string
 *         location:
 *           type: string
 *         incident_date:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

router.use(authenticate);

/**
 * @swagger
 * /expedientes:
 *   post:
 *     summary: Crear un nuevo expediente
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - case_number
 *               - title
 *               - location
 *               - incident_date
 *             properties:
 *               case_number:
 *                 type: string
 *                 example: "EXP-2024-001"
 *               title:
 *                 type: string
 *                 example: "Caso de hurto en zona 10"
 *               description:
 *                 type: string
 *                 example: "Descripción detallada del incidente"
 *               location:
 *                 type: string
 *                 example: "Zona 10, Ciudad de Guatemala"
 *               incident_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-11-23T10:00:00Z"
 *     responses:
 *       201:
 *         description: Expediente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expediente'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere TECNICO)
 */
router.post(
  '/',
  authorize(UserRole.TECNICO),
  validateBody(CreateExpedienteDTO),
  expedienteController.createExpediente
);

/**
 * @swagger
 * /expedientes:
 *   get:
 *     summary: Listar todos los expedientes
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [EN_REGISTRO, EN_REVISION, APROBADO, RECHAZADO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: technician_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de técnico
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista de expedientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expediente'
 *       401:
 *         description: No autorizado
 */
router.get('/', expedienteController.getAllExpedientes);

/**
 * @swagger
 * /expedientes/{id}:
 *   get:
 *     summary: Obtener un expediente por ID
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Expediente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expediente'
 *       404:
 *         description: Expediente no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', expedienteController.getExpedienteById);

/**
 * @swagger
 * /expedientes/{id}:
 *   put:
 *     summary: Actualizar un expediente
 *     description: Solo puede actualizar expedientes en estado EN_REGISTRO
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               incident_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Expediente actualizado exitosamente
 *       400:
 *         description: No se puede actualizar (estado inválido)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere TECNICO)
 *       404:
 *         description: Expediente no encontrado
 */
router.put(
  '/:id',
  authorize(UserRole.TECNICO),
  validateBody(UpdateExpedienteDTO),
  expedienteController.updateExpediente
);

/**
 * @swagger
 * /expedientes/{id}/submit:
 *   post:
 *     summary: Enviar expediente a revisión
 *     description: Cambia el estado del expediente de EN_REGISTRO a EN_REVISION
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Expediente enviado a revisión exitosamente
 *       400:
 *         description: Expediente no tiene indicios o estado inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere TECNICO)
 *       404:
 *         description: Expediente no encontrado
 */
router.post(
  '/:id/submit',
  authorize(UserRole.TECNICO),
  expedienteController.submitForReview
);

/**
 * @swagger
 * /expedientes/{id}/approve:
 *   post:
 *     summary: Aprobar un expediente
 *     description: Cambia el estado del expediente de EN_REVISION a APROBADO
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Expediente aprobado exitosamente
 *       400:
 *         description: Estado inválido (debe estar EN_REVISION)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere COORDINADOR)
 *       404:
 *         description: Expediente no encontrado
 */
router.post(
  '/:id/approve',
  authorize(UserRole.COORDINADOR),
  expedienteController.approveExpediente
);

/**
 * @swagger
 * /expedientes/{id}/reject:
 *   post:
 *     summary: Rechazar un expediente
 *     description: Cambia el estado del expediente de EN_REVISION a RECHAZADO
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejection_reason
 *             properties:
 *               rejection_reason:
 *                 type: string
 *                 example: "Faltan indicios requeridos en el expediente"
 *     responses:
 *       200:
 *         description: Expediente rechazado exitosamente
 *       400:
 *         description: Estado inválido o razón de rechazo faltante
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere COORDINADOR)
 *       404:
 *         description: Expediente no encontrado
 */
router.post(
  '/:id/reject',
  authorize(UserRole.COORDINADOR),
  validateBody(RejectExpedienteDTO),
  expedienteController.rejectExpediente
);

/**
 * @swagger
 * /expedientes/{id}/reopen:
 *   post:
 *     summary: Reabrir un expediente rechazado
 *     description: Cambia el estado del expediente de RECHAZADO a EN_REGISTRO para correcciones
 *     tags: [Expedientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Expediente reabierto exitosamente
 *       400:
 *         description: Estado inválido (debe estar RECHAZADO)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere TECNICO)
 *       404:
 *         description: Expediente no encontrado
 */
router.post(
  '/:id/reopen',
  authorize(UserRole.TECNICO),
  expedienteController.reopenExpediente
);

export default router;