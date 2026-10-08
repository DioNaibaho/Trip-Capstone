import React, { useState } from 'react';
import { Compass, Eye, EyeOff, User } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Login({ onLoginSuccess }) {
  // Mode: true = Halaman Daftar, false = Halaman Login
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // State Input
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Fungsi Submit (Menangani Login & Register sekaligus)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Tentukan URL dan Data berdasarkan mode (Login atau Register)
    const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
    const bodyData = isRegisterMode ? { name, email, password } : { email, password };

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const result = await response.json();

      if (result.success) {
        if (isRegisterMode) {
          // Kalau sukses daftar
          Swal.fire({
            title: 'Berhasil!',
            text: 'Pendaftaran berhasil! Silakan login dengan akun baru Anda.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          }).then((res) => {
            if (res.isConfirmed) {
              setIsRegisterMode(false); // BALIK KE TAMPILAN LOGIN AUTOMATIS
              setPassword('');          // Kosongin password
              setName('');              // Kosongin nama
            }
          });
        } else {
          // Kalau sukses login
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          onLoginSuccess();
        }
      } else {
        alert(result.message); // Munculin pesan error dari backend
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal terhubung ke server backend');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => alert("Fitur lupa password sedang dikembangkan");

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '16px',
      overflow: 'hidden'
    }}>
      
      <div style={{
        width: '100%',
        maxWidth: '380px',
        maxHeight: '90vh',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '20px',
        padding: '24px 28px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto'
      }}>
        
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '50%', display: 'flex', color: '#f97316' }}>
            <Compass size={22} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Trip<span style={{ color: '#f97316' }}>Buddy</span>
          </h1>
        </div>

        <p style={{ fontSize: '11px', color: '#334155', margin: '0 0 16px 0', textAlign: 'center', fontWeight: '500' }}>
          Sistem Rekomendasi Destinasi Wisata Otomatis
        </p>

        {/* JUDUL BERUBAH SESUAI MODE */}
        <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0', textAlign: 'center' }}>
          {isRegisterMode ? 'Buat Akun Baru' : 'Selamat Datang Kembali!'}
        </h2>
        <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 16px 0', textAlign: 'center' }}>
          {isRegisterMode ? 'Daftar untuk mulai merencanakan liburanmu.' : 'Masuk untuk mulai merencanakan perjalanan Anda.'}
        </p>

        {/* FORM INPUT */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* INPUT NAMA (HANYA MUNCUL SAAT REGISTER) */}
          {isRegisterMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>Nama Lengkap</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type="text" 
                  placeholder="Masukkan nama Anda" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegisterMode}
                  style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: '8px', border: '1px solid rgba(203, 213, 225, 0.9)', backgroundColor: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                />
                <User size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          {/* INPUT EMAIL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>Email</label>
            <input 
              type="email" 
              placeholder="Masukkan email Anda" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(203, 213, 225, 0.9)', backgroundColor: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* INPUT PASSWORD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>Kata Sandi</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Masukkan kata sandi Anda" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 32px 9px 12px', borderRadius: '8px', border: '1px solid rgba(203, 213, 225, 0.9)', backgroundColor: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* CHECKBOX & LUPA PASSWORD (HANYA MUNCUL SAAT LOGIN) */}
          {!isRegisterMode && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Ingat Saya
              </label>
              
              <button 
                type="button"
                onClick={handleForgotPasswordClick} 
                style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: '600', fontSize: '11px', padding: 0 }}
              >
                Lupa Kata Sandi?
              </button>
            </div>
          )}

          {/* TOMBOL UTAMA BERUBAH SESUAI MODE */}
          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: loading ? '#cbd5e1' : '#f97316',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '6px',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Memproses...' : (isRegisterMode ? 'Daftar Sekarang' : 'Masuk')}
          </button>
        </form>

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '16px 0 12px 0' }}>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(148, 163, 184, 0.4)' }}></div>
          <span style={{ padding: '0 8px', fontSize: '10px', color: '#475569', fontWeight: '500' }}>Atau</span>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(148, 163, 184, 0.4)' }}></div>
        </div>

        {/* TOMBOL SWITCH MODE (Daftar / Login) */}
        <div style={{ fontSize: '11px', color: '#1e293b' }}>
          {isRegisterMode ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <button 
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)} 
            style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', fontSize: '11px', padding: 0 }}
          >
            {isRegisterMode ? 'Masuk di sini' : 'Daftar Sekarang'}
          </button>
        </div>

      </div>

      <footer style={{ position: 'absolute', bottom: '12px', fontSize: '11px', color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
        © 2024 TripBuddy Smart Travel Planner. All Rights Reserved.
      </footer>

    </div>
  );
}