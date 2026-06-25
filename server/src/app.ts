import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { globalLimiter } from './middleware/rate-limit.js';
import { healthRouter } from './modules/health/health.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { walletsRouter } from './modules/wallets/wallets.routes.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { transactionsRouter } from './modules/transactions/transactions.routes.js';
import { transfersRouter } from './modules/transfers/transfers.routes.js';
import { goalsRouter } from './modules/goals/goals.routes.js';
import { budgetsRouter } from './modules/budgets/budgets.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { gamificationRouter } from './modules/gamification/gamification.routes.js';
import { advisorRouter } from './modules/advisor/advisor.routes.js';

export function createApp() {
  const app = express();

  // Behind a hosting proxy (Railway/Render/Fly) in production, trust the first
  // proxy hop so secure cookies and per-IP rate limiting see the real client IP
  // from X-Forwarded-For instead of the proxy's address.
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  // credentials:true lets the browser send/receive the auth cookie. It only
  // works with an explicit origin (not "*"), which env.CORS_ORIGIN provides.
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  // Cap body size — a finance API never needs large payloads, and the limit
  // blocks oversized-request denial-of-service.
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Broad per-IP ceiling across the whole API. Health check is mounted before
  // it so uptime probes are never rate-limited.
  app.use('/api/health', healthRouter);
  app.use(globalLimiter);
  app.use('/api/auth', authRouter);
  app.use('/api/wallets', walletsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/transfers', transfersRouter);
  app.use('/api/goals', goalsRouter);
  app.use('/api/budgets', budgetsRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/gamification', gamificationRouter);
  app.use('/api/advisor', advisorRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found.',
      },
    });
  });

  app.use(errorHandler);

  return app;
}
