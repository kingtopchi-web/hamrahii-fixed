import express from 'express';
import { startKycSession, getKycStatus, kycCallback, submitKycDetails } from '../controller/kyc.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', auth, getKycStatus);
router.post('/start', auth, startKycSession);
router.post('/submit', auth, submitKycDetails);

// Webhook endpoint (should be public but verified via signature in production)
router.post('/callback', kycCallback);

export default router;
