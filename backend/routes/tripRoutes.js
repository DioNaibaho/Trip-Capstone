const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { saveTrip, getTripsByUser } = require('../controllers/tripController');

// Endpoint untuk menyimpan trip
router.post('/', saveTrip);

// Endpoint untuk mengambil riwayat trip user
router.get('/user/:user_id', getTripsByUser);

module.exports = router;

// Endpoint untuk menghapus trip berdasarkan ID
// SESUDAH DIPERBAIKI:
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Jalankan query delete ke PostgreSQL
    // Sesuaikan 'trips' dengan nama tabel lu yang bener kalau beda
    const deleteQuery = 'DELETE FROM trips WHERE id = $1 RETURNING *';
    const result = await db.query(deleteQuery, [id]);

    // Cek apakah data yang mau dihapus beneran ada
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Itinerary tidak ditemukan.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Itinerary berhasil dihapus.' 
    });

  } catch (error) {
    console.error('Gagal menghapus trip dari database:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server saat menghapus data.' 
    });
  }
});