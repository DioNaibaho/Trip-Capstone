const pool = require('../config/db'); // Sesuaikan dengan path file koneksi database kamu

// 1. Menyimpan Trip / Itinerary baru milik User
const saveTrip = async (req, res) => {
    try {
        const { user_id, trip_name, start_date, end_date, itinerary_data } = req.body;

        const query = `
            INSERT INTO trips (user_id, trip_name, start_date, end_date, itinerary_data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        
        const values = [user_id, trip_name, start_date, end_date, itinerary_data];
        const newTrip = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: 'Trip berhasil disimpan!',
            data: newTrip.rows[0]
        });
    } catch (error) {
        console.error('Error saat menyimpan trip:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 2. Mengambil daftar riwayat trip berdasarkan user_id
const getTripsByUser = async (req, res) => {
    try {
        const { user_id } = req.params;

        const query = `SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC;`;
        const userTrips = await pool.query(query, [user_id]);

        res.status(200).json({
            success: true,
            data: userTrips.rows
        });
    } catch (error) {
        console.error('Error saat mengambil data trip:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    saveTrip,
    getTripsByUser
};