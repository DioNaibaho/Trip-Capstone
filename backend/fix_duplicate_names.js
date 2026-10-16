require('dotenv').config();
const pool = require('./config/db'); // Sesuaikan dengan path file koneksi db kamu
const axios = require('axios');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function updateDuplicateNamesWithStreet() {
    try {
        console.log(' Mencari data dengan nama duplikat...');

        // Query untuk mengambil data yang punya nama duplikat di tabel culinaries
        const findDuplicatesQuery = `
            SELECT id, name, latitude, longitude 
            FROM culinaries 
            WHERE name IN (
                SELECT name FROM culinaries GROUP BY name HAVING COUNT(*) > 1
            )
            ORDER BY name;
        `;

        const res = await pool.query(findDuplicatesQuery);
        const duplicates = res.rows;

        console.log(` Ditemukan ${duplicates.length} data duplikat. Memulai proses pencarian nama jalan...\n`);

        for (let i = 0; i < duplicates.length; i++) {
            const item = duplicates[i];
            
            // Bersihkan nama dari tag (ID: xx) atau (Bandung) jika sebelumnya sudah tertempel
            let baseName = item.name.replace(/\s*\(ID:\s*\d+\)/gi, '').replace(/\s*\(Bandung\)/gi, '').trim();

            try {
                // Request ke Nominatim OpenStreetMap (Reverse Geocoding)
                const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${item.latitude}&lon=${item.longitude}`;
                const response = await axios.get(url, {
                    headers: { 'User-Agent': 'TripBuddyApp/1.0 (capstone-project)' }
                });

                const address = response.data.address;
                // Prioritaskan nama jalan (road), jalan setapak (footway), atau daerah (suburb)
                const roadName = address.road || address.pedestrian || address.suburb || address.neighbourhood || 'Jawa Barat';

                const newName = `${baseName} (${roadName})`;

                // Update ke database
                await pool.query('UPDATE culinaries SET name = $1 WHERE id = $2', [newName, item.id]);

                console.log(`[${i + 1}/${duplicates.length}] ID ${item.id}: ${item.name} ➡️ "${newName}"`);

            } catch (err) {
                console.error(` Gagal update ID ${item.id}:`, err.message);
            }

            // Jeda 1.2 detik per request agar tidak kena rate-limit dari API gratis OpenStreetMap
            await sleep(1200);
        }

        console.log('\n Selesai! Semua nama tempat duplikat berhasil diperbarui dengan nama jalan.');
        process.exit();

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateDuplicateNamesWithStreet();