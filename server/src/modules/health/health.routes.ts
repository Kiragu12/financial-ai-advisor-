import { Router } from 'express';
import { env } from '../../config/env.js';
import type { HealthResponse } from '../../shared/http.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const response: HealthResponse = {
    status: 'ok',
    service: 'akiba-api',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
});
