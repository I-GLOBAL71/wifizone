import { Router } from 'express';
import { getTariffs, createTariff, updateTariff } from '../controllers/tariff.controller';

const router = Router();

router.get('/tariffs', getTariffs);
router.post('/tariffs', createTariff);
router.put('/tariffs/:id', updateTariff);

export default router;