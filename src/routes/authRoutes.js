import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyOtp,
} from '../controllers/authController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register', upload.single('logo'), register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
