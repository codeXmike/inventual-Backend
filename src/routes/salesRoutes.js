import express from 'express';
import {
  getSales,
  addSale,
  getSale,
  syncOfflineSales,
  getTotalSold
} from '../controllers/salesController.js';

const router = express.Router();

router.get('/', getSales);
router.post('/', addSale);
router.get('/:id', getSale);
router.post('/sync-offline', syncOfflineSales);
router.get('/total-sold', getTotalSold);

export default router;
