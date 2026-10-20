require('dotenv').config();
const pool = require('./config/db');

// Kumpulan link gambar Unsplash yang dikelompokkan secara spesifik per kategori
const specificImages = {
    culinaries: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', // Restoran/Kafe modern
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', // Suasana tempat makan
        'https://images.unsplash.com/photo-1552566626-52f8b828add9', // Interior restoran mewah
        'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae', // Kedai kopi / Cafe
        'https://images.unsplash.com/photo-1544025162-d76694265947'  // Kuliner/Makanan siap saji
    ],
    hotels: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945', // Kamar hotel mewah / exterior
        'https://images.unsplash.com/photo-1582719508461-905c673771fd', // Kasur hotel / Bedding
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39', // Hotel modern room
        'https://images.unsplash.com/photo-1590490360182-c33d57733427', // Lobby hotel / fasilitas
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d'  // Resort / Hotel kolam renang
    ],
    attractions: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', // Pemandangan alam / pantai
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1', // Wisata alam / danau
        'https://images.unsplash.com/photo-1519074069444-1ba4ea16d66c', // Tempat landmark / wisata
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // Gunung / bukit wisata
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'  // Perjalanan / destinasi wisata
    ]
};

async function updateSpecificImages() {
    try {
        console.log('🔄 Memperbarui kolom image_url dengan kategori yang lebih spesifik...');

        // Tambahkan 3 baris ini biar kolomnya otomatis dibuat jika belum ada
        await pool.query('ALTER TABLE culinaries ADD COLUMN IF NOT EXISTS image_url TEXT;');
        await pool.query('ALTER TABLE hotels ADD COLUMN IF NOT EXISTS image_url TEXT;');
        await pool.query('ALTER TABLE attractions ADD COLUMN IF NOT EXISTS image_url TEXT;');

        async function assignImages(tableName, imagesArray) {
            const result = await pool.query(`SELECT id, name FROM ${tableName}`);
            const rows = result.rows;

            console.log(`📌 Memperbarui ${rows.length} data untuk tabel ${tableName}...`);

            for (let i = 0; i < rows.length; i++) {
                // Memilih gambar secara bergiliran agar variatif namun tetap satu tema spesifik
                const selectedImage = imagesArray[i % imagesArray.length];
                await pool.query(`UPDATE ${tableName} SET image_url = $1 WHERE id = $2`, [selectedImage, rows[i].id]);
            }
        }

        // Jalankan pembaruan paksa untuk memperbarui semua data agar sesuai kategori
        await assignImages('culinaries', specificImages.culinaries);
        await assignImages('hotels', specificImages.hotels);
        await assignImages('attractions', specificImages.attractions);

        console.log('\n🎉 Berhasil! Semua gambar di tabel kuliner, hotel, dan wisata kini sudah dikelompokkan sesuai jenisnya.');
        process.exit();

    } catch (error) {
        console.error('❌ Terjadi kesalahan:', error);
        process.exit(1);
    }
}

updateSpecificImages();