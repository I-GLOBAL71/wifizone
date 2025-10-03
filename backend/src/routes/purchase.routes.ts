import { Router } from 'express';
import { createPurchaseSession, getPurchaseStatus, applyReferral } from '../controllers/purchase.controller';

const router = Router();

router.post('/create-session', createPurchaseSession);
router.get('/purchase/status/:session_id', getPurchaseStatus);
router.post('/apply-referral', applyReferral);

export default router;