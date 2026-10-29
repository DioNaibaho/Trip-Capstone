const axios = require('axios');

const optimizeRoute = async (req, res) => {
    try {
        const { start_location_id, start_point, start_time, destinations, locations, travel_time_matrix_minutes, time_matrix } = req.body;

        // Validasi pengaman untuk memastikan data dari frontend tidak kosong
        const rawLocations = locations || destinations;
        const matrix = time_matrix || travel_time_matrix_minutes;

        if (!rawLocations || !Array.isArray(rawLocations) || rawLocations.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Data 'locations' atau 'destinations' wajib diisi dan berupa array."
            });
        }

        if (!matrix || !Array.isArray(matrix)) {
            return res.status(400).json({
                success: false,
                message: "Data 'time_matrix' wajib diisi dan berupa array 2 dimensi."
            });
        }

        // Ambil URL AI Engine dari environment variable (.env)
        const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'https://aloha-legible-flop.ngrok-free.dev';

        // Normalisasi data locations agar 'visit_duration_minutes' berubah jadi 'duration' sesuai FastAPI
        const formattedLocations = rawLocations.map(loc => ({
            id: loc.id,
            name: loc.name,
            lat: loc.lat,
            lng: loc.lng,
            duration: loc.duration !== undefined ? loc.duration : (loc.visit_duration_minutes || 0)
        }));

        const aiResponse = await axios.post(
            `${AI_ENGINE_URL}/optimize`,
            {
                start_point: start_point || start_location_id,
                start_time: start_time || "08:00",
                locations: formattedLocations,
                time_matrix: matrix
            },
            {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // Timeout 15 detik
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Rute berhasil dioptimasi',
            data: aiResponse.data
        });

    } catch (error) {
        console.error('Error memanggil AI Engine:', error.response ? error.response.data : error.message);
        return res.status(500).json({
            success: false,
            message: 'Gagal terhubung ke AI Engine',
            error: error.response ? error.response.data : error.message
        });
    }
};

module.exports = { optimizeRoute };