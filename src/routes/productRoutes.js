import express from 'express';
import {
  getProducts,
  addProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getStockAlert
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', addProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/alerts/low-stock', getStockAlert);

export default router;
