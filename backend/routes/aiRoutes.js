const express = require('express');
const router = express.Router();
const { optimizeRoute } = require('../controllers/aiController');

router.post('/optimize', optimizeRoute);

module.exports = router;