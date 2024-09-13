import express from 'express';
import { authApiRouter } from './auth';

const router = express.Router();

router.use('/auth', authApiRouter);
export { router as apiRouter };