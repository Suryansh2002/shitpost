import express from 'express';
import { userApiRouter } from './user';

const router = express.Router();

router.use('/user', userApiRouter);
export { router as apiRouter };