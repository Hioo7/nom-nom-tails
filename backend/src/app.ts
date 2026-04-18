import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import AppConfig from './config/AppConfig';
import { API_PREFIX } from './config/constants';
import router from './routes/index';
import { errorHandler } from './middleware/errorHandler';

function createApp(): Express {
  const app = express();
  const { corsOrigins } = AppConfig.getInstance();

  app.use(helmet());
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json());

  app.use(API_PREFIX, router);
  app.use((_req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(404).json({ error: { message: 'Route not found' } });
  });
  app.use(errorHandler);

  return app;
}

export default createApp;
