import express from 'express';
import {
  sync,
  getStatus,
  getPing,
  checkInternet,
  queueOfflineSync,
  processQueuedSyncs
} from '../controllers/pwaController.js';

const router = express.Router();

router.post('/sync', sync);
router.get('/status', getStatus);
router.get('/ping', getPing);
router.get('/check-internet', checkInternet);
router.post('/queue', queueOfflineSync);
router.get('/process-queue', processQueuedSyncs);

export default router;
