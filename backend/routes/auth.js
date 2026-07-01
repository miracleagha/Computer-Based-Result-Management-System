import express from 'express';
import { login, refreshToken, logout, getMe, changePassword, forgotPassword, resetPassword, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
