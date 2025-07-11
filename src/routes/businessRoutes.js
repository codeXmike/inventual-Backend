import express from 'express';
import {
  getBusiness,
  updateBusiness,
  getAllStores
} from '../controllers/businessController.js';

const router = express.Router();

router.get('/', getBusiness);
router.put('/update', updateBusiness);
router.get('/stores', getAllStores);

export default router;
