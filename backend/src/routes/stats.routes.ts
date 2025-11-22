import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../entities/User';

const router = Router();
const statsController = new StatsController();

/**
 * @swagger
 * tags:
 *   name: Estadísticas
 *   description: Reportes y estadísticas del sistema
 */

router.use(authenticate);
router.use(authorize(UserRole.ADMIN, UserRole.COORDINADOR));

/**
 * @swagger
 * /stats/general:
 *   get:
 *     summary: Obtener estadísticas generales del sistema
 *     description: Retorna conteo total de expedientes por estado e indicios
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar (YYYY-MM-DD)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Estadísticas generales obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_expedientes:
 *                       type: integer
 *                       example: 150
 *                     en_registro:
 *                       type: integer
 *                       example: 45
 *                     en_revision:
 *                       type: integer
 *                       example: 30
 *                     aprobados:
 *                       type: integer
 *                       example: 60
 *                     rechazados:
 *                       type: integer
 *                       example: 15
 *                     total_indicios:
 *                       type: integer
 *                       example: 450
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere ADMIN o COORDINADOR)
 */
router.get('/general', statsController.getGeneralStats);

/**
 * @swagger
 * /stats/technicians:
 *   get:
 *     summary: Obtener estadísticas por técnico
 *     description: Retorna estadísticas de expedientes e indicios por cada técnico
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar (YYYY-MM-DD)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Estadísticas por técnico obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       full_name:
 *                         type: string
 *                         example: "Juan Pérez"
 *                       total_expedientes:
 *                         type: integer
 *                         example: 25
 *                       aprobados:
 *                         type: integer
 *                         example: 18
 *                       rechazados:
 *                         type: integer
 *                         example: 3
 *                       en_proceso:
 *                         type: integer
 *                         example: 4
 *                       total_indicios:
 *                         type: integer
 *                         example: 75
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere ADMIN o COORDINADOR)
 */
router.get('/technicians', statsController.getStatsByTechnician);

/**
 * @swagger
 * /stats/by-status:
 *   get:
 *     summary: Obtener conteo de expedientes por estado
 *     description: Retorna el número de expedientes agrupados por su estado actual
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expedientes por estado obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     EN_REGISTRO:
 *                       type: integer
 *                       example: 45
 *                     EN_REVISION:
 *                       type: integer
 *                       example: 30
 *                     APROBADO:
 *                       type: integer
 *                       example: 60
 *                     RECHAZADO:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere ADMIN o COORDINADOR)
 */
router.get('/by-status', statsController.getExpedientesByStatus);

/**
 * @swagger
 * /stats/monthly/{year}:
 *   get:
 *     summary: Obtener expedientes creados por mes
 *     description: Retorna el número de expedientes creados en cada mes del año especificado
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *         description: Año para consultar (por defecto año actual)
 *         example: 2024
 *     responses:
 *       200:
 *         description: Estadísticas mensuales obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     monthly_data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: integer
 *                             example: 1
 *                           month_name:
 *                             type: string
 *                             example: "Enero"
 *                           total:
 *                             type: integer
 *                             example: 12
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere ADMIN o COORDINADOR)
 */
router.get('/monthly/:year?', statsController.getMonthlyExpedientes);

export default router;