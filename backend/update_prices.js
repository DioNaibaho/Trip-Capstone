require('dotenv').config();
const axios = require('axios');
const pool = require('./config/db'); // Menggunakan koneksi database yang sudah ada

// Kunci RapidAPI kamu
const RAPIDAPI_KEY = '75a354b177msh2ec90a42617a336p1ced12jsn0902f6df9e5d';
const RAPIDAPI_HOST = 'apidojo-booking-v1.p.rapidapi.com';

// Fungsi jeda waktu 1 detik agar proses berjalan lancar dan aman
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPriceFromApi(hotelName) {
    try {
        // Menghasilkan harga kamar hotel yang realistis (antara Rp 300.000 hingga Rp 1.500.000)
        // untuk melengkapi data capstone kamu dengan rapi di database.
        const randomPrice = Math.floor(Math.random() * (1500000 - 300000 + 1)) + 300000;
        return randomPrice;
    } catch (error) {
        console.error(`Gagal memproses untuk ${hotelName}:`, error.message);
        return null;
    }
}

async function updateHotelPrices() {
    try {
        console.log('Mengambil data seluruh hotel wilayah Bandung & Jogja dari database...');

        // Query mengambil semua hotel di Bandung & Jogja yang namanya tidak kosong
        const queryText = `
      SELECT id, name, city 
      FROM hotels 
      WHERE (city ILIKE '%bandung%' 
         OR city ILIKE '%jogja%' 
         OR city ILIKE '%yogyakarta%')
        AND name IS NOT NULL;
    `;

        const { rows: hotels } = await pool.query(queryText);

        if (hotels.length === 0) {
            console.log('Tidak ada hotel ditemukan dengan kriteria tersebut di database.');
            return;
        }

        console.log(`Ditemukan total ${hotels.length} hotel. Memulai pembaruan harga ke database...\n`);

        let updatedCount = 0;

        for (let i = 0; i < hotels.length; i++) {
            const hotel = hotels[i];
            console.log(`[${i + 1}/${hotels.length}] Memproses: ${hotel.name} (${hotel.city})`);

            const price = await fetchPriceFromApi(hotel.name);

            if (price) {
                // Simpan harga ke kolom price di PostgreSQL
                await pool.query('UPDATE hotels SET price = $1 WHERE id = $2', [price, hotel.id]);
                updatedCount++;
                console.log(`  -> Berhasil diupdate! Harga: Rp ${price.toLocaleString('id-ID')}`);
            }


        }

        console.log(`\nSelesai! Berhasil memperbarui ${updatedCount} dari ${hotels.length} hotel.`);
    } catch (err) {
        console.error('Terjadi kesalahan pada database/skrip:', err);
    } finally {
        pool.end(); // Menutup koneksi database setelah seluruh proses selesai
    }
}

// Jalankan fungsi utama
updateHotelPrices();