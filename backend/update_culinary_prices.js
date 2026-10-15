require('dotenv').config();
const pool = require('./config/db');

// Fungsi pembantu untuk memilih range harga acak
function getRandomRange(rangesArray) {
    const randomIndex = Math.floor(Math.random() * rangesArray.length);
    return rangesArray[randomIndex];
}

// Fungsi pembantu untuk membuat rating acak dalam bentuk angka desimal (Float)
function getRandomRating(min, max) {
    const randomVal = Math.random() * (max - min) + min;
    return parseFloat(randomVal.toFixed(1));
}

async function updateCulinaryMetadata() {
    try {
        console.log('Mengambil data kuliner dari tabel culinaries...');

        const queryText = `
      SELECT id, name, city 
      FROM culinaries 
      WHERE (city ILIKE '%bandung%' 
         OR city ILIKE '%jogja%' 
         OR city ILIKE '%yogyakarta%')
        AND name IS NOT NULL;
    `;

        const { rows: culinaries } = await pool.query(queryText);

        if (culinaries.length === 0) {
            console.log('Tidak ada data kuliner ditemukan di database.');
            return;
        }

        console.log(`Ditemukan ${culinaries.length} tempat kuliner. Memperbarui range harga dan rating...\n`);

        let updatedCount = 0;

        for (let i = 0; i < culinaries.length; i++) {
            const item = culinaries[i];
            const nameLower = item.name.toLowerCase();

            let assignedRange = '';
            let rating = 4.3;

            // 1. Kategori Kaki Lima / Warung / Bakso / Mie / Seblak
            if (
                nameLower.includes('bakso') ||
                nameLower.includes('mie') ||
                nameLower.includes('soto') ||
                nameLower.includes('angkringan') ||
                nameLower.includes('warung') ||
                nameLower.includes('bubur') ||
                nameLower.includes('pecel') ||
                nameLower.includes('seblak') ||
                nameLower.includes('nasgor') ||
                nameLower.includes('nasi goreng')
            ) {
                const ranges = ['Rp 15.000 – Rp 30.000', 'Rp 20.000 – Rp 35.000', 'Rp 10.000 – Rp 25.000'];
                assignedRange = getRandomRange(ranges);
                rating = getRandomRating(4.2, 4.7); // Rating khas kuliner legendaris/kaki lima populer
            }
            // 2. Kategori Kafe / Coffee Shop / Roti / Bakery
            else if (
                nameLower.includes('coffee') ||
                nameLower.includes('kopi') ||
                nameLower.includes('cafe') ||
                nameLower.includes('roti') ||
                nameLower.includes('bakery') ||
                nameLower.includes('toast') ||
                nameLower.includes('boba')
            ) {
                const ranges = ['Rp 25.000 – Rp 50.000', 'Rp 30.000 – Rp 65.000', 'Rp 20.000 – Rp 45.000'];
                assignedRange = getRandomRange(ranges);
                rating = getRandomRating(4.3, 4.8); // Rating khas kafe cozy/aesthetic
            }
            // 3. Kategori Restoran / Iga / Steak / Seafood / Sunda / Padang
            else if (
                nameLower.includes('resto') ||
                nameLower.includes('iga') ||
                nameLower.includes('steak') ||
                nameLower.includes('seafood') ||
                nameLower.includes('padang') ||
                nameLower.includes('sunda') ||
                nameLower.includes('grill') ||
                nameLower.includes('bbq') ||
                nameLower.includes('sigarantang') ||
                nameLower.includes('restaurant')
            ) {
                const ranges = ['Rp 50.000 – Rp 90.000', 'Rp 75.000 – Rp 150.000', 'Rp 45.000 – Rp 80.000'];
                assignedRange = getRandomRange(ranges);
                rating = getRandomRating(4.4, 4.9); // Rating khas restoran besar/keluarga
            }
            // 4. Kategori Umum / Lainnya
            else {
                const ranges = ['Rp 20.000 – Rp 45.000', 'Rp 35.000 – Rp 70.000', 'Rp 25.000 – Rp 60.000'];
                assignedRange = getRandomRange(ranges);
                rating = getRandomRating(4.2, 4.6);
            }

            // Simpan price_range dan rating sekaligus ke database
            await pool.query(
                'UPDATE culinaries SET price_range = $1, rating = $2 WHERE id = $3',
                [assignedRange, rating, item.id]
            );
            updatedCount++;

            console.log(`[${i + 1}/${culinaries.length}] ${item.name} -> ${assignedRange} | Rating: ${rating}`);
        }

        console.log(`\nSelesai! Berhasil memperbarui range harga dan rating untuk ${updatedCount} kuliner.`);
    } catch (err) {
        console.error('Terjadi kesalahan pada skrip/database:', err);
    } finally {
        pool.end();
    }
}

updateCulinaryMetadata();