const express = require('express');
const router = express.Router();
const { saveTrip, getTripsByUser } = require('../controllers/tripController');

// Endpoint untuk menyimpan trip
router.post('/', saveTrip);

// Endpoint untuk mengambil riwayat trip user
router.get('/user/:user_id', getTripsByUser);

module.exports = router;