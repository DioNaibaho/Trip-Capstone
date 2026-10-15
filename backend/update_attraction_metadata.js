require('dotenv').config();
const pool = require('./config/db');

// Fungsi pembantu untuk memilih harga acak dari opsi yang tersedia
function getRandomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Fungsi pembantu untuk membuat rating acak dalam bentuk Float
function getRandomRating(min, max) {
    const randomVal = Math.random() * (max - min) + min;
    return parseFloat(randomVal.toFixed(1));
}

async function updateAttractionMetadata() {
    try {
        console.log('Mengambil data destinasi wisata dari tabel attractions...');

        // Menggunakan nama tabel 'attractions'
        const queryText = `
      SELECT id, name, city 
      FROM attractions 
      WHERE (city ILIKE '%bandung%' 
         OR city ILIKE '%jogja%' 
         OR city ILIKE '%yogyakarta%')
        AND name IS NOT NULL;
    `;

        const { rows: attractions } = await pool.query(queryText);

        if (attractions.length === 0) {
            console.log('Tidak ada data destinasi wisata ditemukan di tabel attractions.');
            return;
        }

        console.log(`Ditemukan ${attractions.length} destinasi wisata. Memperbarui harga tiket dan rating...\n`);

        let updatedCount = 0;

        for (let i = 0; i < attractions.length; i++) {
            const item = attractions[i];
            const nameLower = item.name.toLowerCase();

            let price = '';
            let rating = 4.5;

            // 1. Kategori Gratis (Taman, Alun-alun, Tugu, Jalan, Masjid, Gereja)
            if (
                nameLower.includes('alun') ||
                nameLower.includes('tugu') ||
                nameLower.includes('jalan') ||
                nameLower.includes('malioboro') ||
                nameLower.includes('taman') ||
                nameLower.includes('masjid') ||
                nameLower.includes('gereja') ||
                nameLower.includes('titik 0') ||
                nameLower.includes('nol km')
            ) {
                price = 'Gratis';
                rating = getRandomRating(4.5, 4.8);
            }
            // 2. Kategori Alam / Hutan Pinus / Curug / Pantai / Bukit (Murah: 10rb - 25rb)
            else if (
                nameLower.includes('curug') ||
                nameLower.includes('pantai') ||
                nameLower.includes('bukit') ||
                nameLower.includes('pinus') ||
                nameLower.includes('hutan') ||
                nameLower.includes('puncak') ||
                nameLower.includes('tebing') ||
                nameLower.includes('embung') ||
                nameLower.includes('danau') ||
                nameLower.includes('kawah')
            ) {
                price = getRandomChoice(['Rp 10.000', 'Rp 15.000', 'Rp 20.000', 'Rp 25.000']);
                rating = getRandomRating(4.4, 4.8);
            }
            // 3. Kategori Sejarah / Candi / Museum (Terjangkau: 10rb - 50rb)
            else if (
                nameLower.includes('candi') ||
                nameLower.includes('museum') ||
                nameLower.includes('benteng') ||
                nameLower.includes('keraton') ||
                nameLower.includes('tamansari') ||
                nameLower.includes('monumen')
            ) {
                if (nameLower.includes('borobudur') || nameLower.includes('prambanan')) {
                    price = 'Rp 50.000';
                } else {
                    price = getRandomChoice(['Rp 10.000', 'Rp 15.000', 'Rp 25.000']);
                }
                rating = getRandomRating(4.5, 4.9);
            }
            // 4. Kategori Taman Rekreasi / Theme Park / Zoo (Menengah-Atas: 35rb - 150rb)
            else if (
                nameLower.includes('park') ||
                nameLower.includes('zoo') ||
                nameLower.includes('trans') ||
                nameLower.includes('farm') ||
                nameLower.includes('waterboom') ||
                nameLower.includes('waterpark') ||
                nameLower.includes('dusun') ||
                nameLower.includes('world')
            ) {
                price = getRandomChoice(['Rp 35.000', 'Rp 50.000', 'Rp 75.000', 'Rp 100.000']);
                rating = getRandomRating(4.3, 4.7);
            }
            // 5. Destinasi Wisata Umum / Lainnya
            else {
                price = getRandomChoice(['Gratis', 'Rp 15.000', 'Rp 25.000', 'Rp 30.000']);
                rating = getRandomRating(4.3, 4.7);
            }

            // Update price dan rating ke tabel attractions
            await pool.query(
                'UPDATE attractions SET price = $1, rating = $2 WHERE id = $3',
                [price, rating, item.id]
            );
            updatedCount++;

            console.log(`[${i + 1}/${attractions.length}] ${item.name} -> Tiket: ${price} | Rating: ${rating}`);
        }

        console.log(`\nSelesai! Berhasil memperbarui data wisata untuk ${updatedCount} tempat.`);
    } catch (err) {
        console.error('Terjadi kesalahan pada skrip/database:', err);
    } finally {
        pool.end();
    }
}

updateAttractionMetadata();