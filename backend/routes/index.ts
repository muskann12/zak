import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { getDashboard, downloadExtension } from '../controllers/userController';
import { analyzeProducts } from '../controllers/xrayController';
import { requireAuth } from '../auth/middleware';

const router = Router();

// Public Auth
router.post('/auth/login', login);
router.post('/auth/register', register);

// Protected User API
router.get('/user/dashboard', requireAuth, getDashboard);
router.get('/user/extension/download', requireAuth, downloadExtension);

// Xray Tool API
router.post('/xray/analyze', requireAuth, analyzeProducts);

export default router;
