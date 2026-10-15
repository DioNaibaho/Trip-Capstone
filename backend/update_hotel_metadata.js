require('dotenv').config();
const pool = require('./config/db');

// Fungsi pembantu untuk membuat rating acak dalam bentuk Number (Float)
function getRandomRating(min, max) {
    const randomVal = Math.random() * (max - min) + min;
    return parseFloat(randomVal.toFixed(1));
}

async function updateHotelMetadata() {
    try {
        console.log('Mengambil data hotel dari database...');

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
            console.log('Tidak ada data hotel ditemukan.');
            return;
        }

        console.log(`Menyesuaikan kategori dan rating untuk ${hotels.length} hotel...\n`);

        let updatedCount = 0;

        for (let i = 0; i < hotels.length; i++) {
            const hotel = hotels[i];
            const nameLower = hotel.name.toLowerCase();

            let category = '';
            let rating = 4.0;

            // Logika Penentuan Kategori & Rating Berdasarkan Kata Kunci
            if (nameLower.includes('villa') || nameLower.includes('cottage')) {
                category = 'Villa & Cottage';
                rating = getRandomRating(4.3, 4.9);
            } else if (nameLower.includes('resort') || nameLower.includes('spa')) {
                category = 'Resort & Spa';
                rating = getRandomRating(4.5, 5.0);
            } else if (
                nameLower.includes('grand') ||
                nameLower.includes('luxury') ||
                nameLower.includes('bintang 5') ||
                nameLower.includes('bintang 4') ||
                nameLower.includes('suites') ||
                nameLower.includes('palace')
            ) {
                category = 'Hotel Bintang 4/5';
                rating = getRandomRating(4.4, 4.8);
            } else if (
                nameLower.includes('hostel') ||
                nameLower.includes('backpacker') ||
                nameLower.includes('dormitory') ||
                nameLower.includes('capsule')
            ) {
                category = 'Hostel & Backpacker';
                rating = getRandomRating(4.0, 4.5);
            } else if (
                nameLower.includes('guest house') ||
                nameLower.includes('homestay') ||
                nameLower.includes('inn') ||
                nameLower.includes('losmen') ||
                nameLower.includes('house')
            ) {
                category = 'Guest House / Inn';
                rating = getRandomRating(4.1, 4.6);
            } else {
                // Standar Hotel Bintang 3
                category = 'Hotel Bintang 3';
                rating = getRandomRating(4.1, 4.7);
            }

            // Update ke database
            await pool.query(
                'UPDATE hotels SET category = $1, rating = $2 WHERE id = $3',
                [category, rating, hotel.id]
            );
            updatedCount++;

            console.log(`[${i + 1}/${hotels.length}] ${hotel.name} -> [${category}] Rating: ${rating}`);
        }

        console.log(`\nSelesai! Berhasil memperbarui metadata untuk ${updatedCount} hotel.`);
    } catch (err) {
        console.error('Terjadi kesalahan pada skrip/database:', err);
    } finally {
        pool.end();
    }
}

updateHotelMetadata();