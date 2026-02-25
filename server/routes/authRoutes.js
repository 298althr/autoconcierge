const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);

router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.getMe);
router.post('/kyc/submit', authenticate, authController.submitKYC);

module.exports = router;
