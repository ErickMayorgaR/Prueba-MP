import { Router } from 'express';
import { IndicioController } from '../controllers/indicio.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { CreateIndicioDTO, UpdateIndicioDTO } from '../dto/indicio.dto';
import { UserRole } from '../entities/User';

const router = Router();
const indicioController = new IndicioController();

/**
 * @swagger
 * tags:
 *   name: Indicios
 *   description: Gestión de indicios criminales
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Indicio:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         expediente_id:
 *           type: integer
 *         code:
 *           type: string
 *           example: "IND-001"
 *         description:
 *           type: string
 *           example: "Arma blanca encontrada en la escena"
 *         color:
 *           type: string
 *           example: "Plateado"
 *         size:
 *           type: string
 *           example: "20cm x 3cm"
 *         weight:
 *           type: string
 *           example: "150g"
 *         location:
 *           type: string
 *           example: "Cocina, junto al refrigerador"
 *         technician_id:
 *           type: integer
 *         observations:
 *           type: string
 *           example: "Posibles huellas dactilares en el mango"
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
 * /indicios:
 *   post:
 *     summary: Crear un nuevo indicio
 *     description: Solo puede agregar indicios a expedientes en estado EN_REGISTRO
 *     tags: [Indicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expediente_id
 *               - code
 *               - description
 *             properties:
 *               expediente_id:
 *                 type: integer
 *                 example: 1
 *               code:
 *                 type: string
 *                 example: "IND-001"
 *               description:
 *                 type: string
 *                 example: "Arma blanca encontrada en la escena"
 *               color:
 *                 type: string
 *                 example: "Plateado"
 *               size:
 *                 type: string
 *                 example: "20cm x 3cm"
 *               weight:
 *                 type: string
 *                 example: "150g"
 *               location:
 *                 type: string
 *                 example: "Cocina, junto al refrigerador"
 *               observations:
 *                 type: string
 *                 example: "Posibles huellas dactilares en el mango"
 *     responses:
 *       201:
 *         description: Indicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Indicio'
 *       400:
 *         description: Datos inválidos o expediente en estado incorrecto
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere TECNICO)
 *       404:
 *         description: Expediente no encontrado
 */
router.post(
  '/',
  authorize(UserRole.TECNICO, UserRole.ADMIN),
  validateBody(CreateIndicioDTO),
  indicioController.createIndicio
);

/**
 * @swagger
 * /indicios/{id}:
 *   get:
 *     summary: Obtener un indicio por ID
 *     tags: [Indicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del indicio
 *     responses:
 *       200:
 *         description: Indicio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Indicio'
 *       404:
 *         description: Indicio no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', indicioController.getIndicioById);

/**
 * @swagger
 * /indicios/expediente/{expedienteId}:
 *   get:
 *     summary: Obtener todos los indicios de un expediente
 *     tags: [Indicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expedienteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del expediente
 *     responses:
 *       200:
 *         description: Lista de indicios del expediente
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
 *                     $ref: '#/components/schemas/Indicio'
 *       404:
 *         description: Expediente no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/expediente/:expedienteId', indicioController.getIndiciosByExpediente);

/**
 * @swagger
 * /indicios/{id}:
 *   put:
 *     summary: Actualizar un indicio
 *     description: Solo puede actualizar indicios de expedientes en estado EN_REGISTRO
 *     tags: [Indicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del indicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *               size:
 *                 type: string
 *               weight:
 *                 type: string
 *               location:
 *                 type: string
 *               observations:
 *                 type: string
 *     responses:
 *       200:
 *         description: Indicio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Indicio'
 *       400:
 *         description: No se puede actualizar (expediente en estado incorrecto)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere TECNICO)
 *       404:
 *         description: Indicio no encontrado
 */
router.put(
  '/:id',
  authorize(UserRole.TECNICO, UserRole.ADMIN),
  validateBody(UpdateIndicioDTO),
  indicioController.updateIndicio
);

/**
 * @swagger
 * /indicios/{id}:
 *   delete:
 *     summary: Eliminar un indicio
 *     description: Solo puede eliminar indicios de expedientes en estado EN_REGISTRO
 *     tags: [Indicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del indicio
 *     responses:
 *       200:
 *         description: Indicio eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Indicio eliminado exitosamente"
 *       400:
 *         description: No se puede eliminar (expediente en estado incorrecto)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere TECNICO)
 *       404:
 *         description: Indicio no encontrado
 */
router.delete('/:id', authorize(UserRole.TECNICO, UserRole.ADMIN), indicioController.deleteIndicio);

export default router;