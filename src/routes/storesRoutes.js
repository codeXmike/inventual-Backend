import express from 'express';
import {
  getStores,
  addStore,
  updateStoreInfo,
  deleteStore
} from '../controllers/storesController.js';

const router = express.Router();

router.get('/', getStores);
router.post('/', addStore);
router.put('/:id', updateStoreInfo);
router.delete('/:id', deleteStore);

export default router;
