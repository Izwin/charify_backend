import express from 'express';
import { verify, getUser } from '../controllers/authController.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/verify', verify);
router.get('/me', authenticateToken, getUser);

export default router;
