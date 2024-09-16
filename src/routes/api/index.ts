import express from 'express';
import { authApiRouter } from './auth';
import { postsApiRouter } from './posts';

const router = express.Router();

router.use('/auth', authApiRouter);
router.use('/posts', postsApiRouter);

export { router as apiRouter };