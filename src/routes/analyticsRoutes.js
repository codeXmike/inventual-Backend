import express from 'express';
import {
  saleSum,
  productPerformance,
  inventoryStatus,
  lowStock,
  overView,
  categoryStats
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/sale-summary', saleSum);
router.get('/product-performance', productPerformance);
router.get('/inventory-status', inventoryStatus);
router.get('/low-stock', lowStock);
router.get('/overview', overView);
router.get('/category-stats', categoryStats);

export default router;
