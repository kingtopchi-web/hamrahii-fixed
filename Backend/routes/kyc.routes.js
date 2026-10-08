import express from 'express';
import { startKycSession, getKycStatus, kycCallback, mockCompleteKyc } from '../controller/kyc.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', auth, getKycStatus);
router.post('/start', auth, startKycSession);

// Webhook endpoint (should be public but verified via signature in production)
router.post('/callback', kycCallback);

// Mock route for testing/development
router.post('/mock-complete', auth, mockCompleteKyc);

export default router;
