import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';
import { asyncHandler } from '../../shared/async-handler.js';
import * as gamificationController from './gamification.controller.js';

export const gamificationRouter = Router();

gamificationRouter.use(requireAuth);

gamificationRouter.get('/summary', asyncHandler(gamificationController.summary));
