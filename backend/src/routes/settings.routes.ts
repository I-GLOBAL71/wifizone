import { Router } from 'express';
import { getSetting, saveSetting, getPaymentProviders } from '../controllers/settings.controller';

const router = Router();

router.get('/settings/:key', getSetting);
router.post('/settings', saveSetting);
router.get('/payment-providers', getPaymentProviders);

export default router;