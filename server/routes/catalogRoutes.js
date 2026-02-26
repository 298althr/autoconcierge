const express = require('express');
const catalogController = require('../controllers/catalogController');

const router = express.Router();

router.get('/brands', catalogController.getBrands);
router.get('/models', catalogController.getModels);
router.get('/engines', catalogController.getEngines);
router.get('/compare', catalogController.compare);

module.exports = router;
