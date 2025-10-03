import { Router } from 'express';
import { getAmbassadorById, createAmbassador, getAllAmbassadors } from '../controllers/ambassador.controller';

const router = Router();

router.get('/', getAllAmbassadors);
router.get('/:id', getAmbassadorById);
router.post('/', createAmbassador);

export default router;