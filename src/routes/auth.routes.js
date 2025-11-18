import express from 'express';
import UserController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile', UserController.getProfile);
router.post('/verify-token', UserController.verifyToken);

export default router;