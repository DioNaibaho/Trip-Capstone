const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// GET: Tes koneksi & ambil data semua user
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, created_at FROM users');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST: Registrasi Pengguna Baru
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }

    try {
        // Cek apakah email sudah terdaftar
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
        }

        // Hash kata sandi dengan bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan pengguna ke database
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
            [name, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: newUser.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST: Login Pengguna
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    try {
        // Cari pengguna berdasarkan email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Email atau password salah' });
        }

        const user = userResult.rows[0];

        // Verifikasi kata sandi
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: 'Email atau password salah' });
        }

        // Buat JWT Token (berlaku 1 hari)
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret_key_default',
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Login berhasil',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server aktif di http://localhost:${PORT}`);
});