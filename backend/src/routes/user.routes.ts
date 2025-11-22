import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { CreateUserDTO, UpdateUserDTO } from '../dto/user.dto';
import { UserRole } from '../entities/User';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *           example: "jperez"
 *         email:
 *           type: string
 *           format: email
 *           example: "jperez@dicri.gob.gt"
 *         role:
 *           type: string
 *           enum: [ADMIN, TECNICO, COORDINADOR]
 *           example: "TECNICO"
 *         full_name:
 *           type: string
 *           example: "Juan Pérez"
 *         is_active:
 *           type: boolean
 *           example: true
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
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     description: Solo administradores pueden crear usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *               - full_name
 *             properties:
 *               username:
 *                 type: string
 *                 example: "jperez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jperez@dicri.gob.gt"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *                 description: Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos
 *               role:
 *                 type: string
 *                 enum: [ADMIN, TECNICO, COORDINADOR]
 *                 example: "TECNICO"
 *               full_name:
 *                 type: string
 *                 example: "Juan Pérez"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos o usuario ya existe
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere ADMIN)
 */
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validateBody(CreateUserDTO),
  userController.createUser
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos los usuarios
 *     description: Administradores pueden ver todos los usuarios, Coordinadores pueden ver técnicos
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, TECNICO, COORDINADOR]
 *         description: Filtrar por rol
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
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
 *         description: Lista de usuarios
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
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere ADMIN o COORDINADOR)
 */
router.get('/', authorize(UserRole.ADMIN, UserRole.COORDINADOR), userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     description: Cualquier usuario autenticado puede ver información de usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     description: Solo administradores pueden actualizar usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "jperez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jperez@dicri.gob.gt"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, TECNICO, COORDINADOR]
 *                 example: "COORDINADOR"
 *               full_name:
 *                 type: string
 *                 example: "Juan Pérez García"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Solo si se desea cambiar la contraseña
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere ADMIN)
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validateBody(UpdateUserDTO),
  userController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (desactivar)
 *     description: Solo administradores pueden eliminar usuarios. El usuario se marca como inactivo
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *       400:
 *         description: No se puede eliminar (usuario tiene expedientes asignados)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente (requiere ADMIN)
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', authorize(UserRole.ADMIN), userController.deleteUser);

export default router;