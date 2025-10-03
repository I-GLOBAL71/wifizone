import { Router } from 'express';
import { handleCampayWebhook, handleFlutterwaveWebhook } from '../controllers/webhook.controller';

const router = Router();

router.post('/webhook/campay', handleCampayWebhook);
router.post('/webhook/flutterwave', handleFlutterwaveWebhook);

export default router;