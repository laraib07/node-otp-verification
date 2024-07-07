import { Router } from 'express';
import {
    login,
    logout,
    register,
    resendOTP,
    verifyAccount
} from '../controllers/auth.controller.js';
import { verifyAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/signup').post(register);
router.route('/login').post(login);
router.route('/logout').get(verifyAuth, logout);
router.route('/verify').post(verifyAuth, verifyAccount);
router.route('/resend-verification-mail').get(verifyAuth, resendOTP);


export default router;
