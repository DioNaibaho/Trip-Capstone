const express = require('express');
const router = express.Router();
const { optimizeRoute } = require('../controllers/aiController');

router.post('/optimize-route', optimizeRoute);

module.exports = router;