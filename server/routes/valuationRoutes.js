const express = require('express');
const valuationController = require('../controllers/valuationController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/predict', (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        authenticate(req, res, next);
    } else {
        next();
    }
}, valuationController.predict);

router.get('/history', authenticate, valuationController.getHistory);

module.exports = router;
