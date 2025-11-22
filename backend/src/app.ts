import express, { Application, Request, Response } from 'express'; // ← AGREGADO Request, Response
import dotenv from 'dotenv';
import morgan from 'morgan';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { initializeDatabase } from './config/database';
import logger from './config/logger';
import routes from './routes';
import path from 'path';

import {
  helmetMiddleware,
  corsMiddleware,
  rateLimiter,
  sanitizeMiddleware,
} from './middleware/security.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DICRI Evidence Management API',
      version: '1.0.0',
      description: 'API para el Sistema de Gestión de Evidencias de DICRI',
      contact: {
        name: 'Ministerio Público de Guatemala',
        email: 'soporte@dicri.gob.gt',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/${API_VERSION}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT (sin "Bearer")'
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), 'src', 'routes', '*.ts'),
    path.join(__dirname, 'routes', '*.js'),
  ],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeMiddleware);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'DICRI Evidence Management API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API está funcionando
 */
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'API is healthy' });
});

app.use(`/api/${API_VERSION}`, routes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;