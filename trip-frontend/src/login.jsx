import React, { useState } from 'react';
import { Compass, Eye, EyeOff } from 'lucide-react';

export default function Login({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate('forgot-password');
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate('register');
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')`,
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
      
      {/* CARD LOGIN */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        maxHeight: '90vh',
        backgroundColor: 'rgba(255, 255, 255, 0.68)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '20px',
        padding: '22px 28px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto'
      }}>
        
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '50%', display: 'flex', color: '#f97316' }}>
            <Compass size={20} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Trip<span style={{ color: '#f97316' }}>Buddy</span>
          </h1>
        </div>

        <p style={{ fontSize: '10px', color: '#334155', margin: '0 0 12px 0', textAlign: 'center', fontWeight: '500' }}>
          Sistem Rekomendasi Destinasi Wisata<br />dan Penjadwalan Perjalanan Otomatis
        </p>

        <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0', textAlign: 'center' }}>
          Selamat Datang Kembali, Penjelajah!
        </h2>
        <p style={{ fontSize: '10px', color: '#475569', margin: '0 0 14px 0', textAlign: 'center' }}>
          Masuk untuk mulai merencanakan perjalanan Anda.
        </p>

        {/* FORM INPUT */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10px', fontWeight: '600', color: '#1e293b' }}>Email atau Username</label>
            <input 
              type="text" 
              placeholder="Masukkan email Anda" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(203, 213, 225, 0.8)', backgroundColor: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10px', fontWeight: '600', color: '#1e293b' }}>Kata Sandi</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Masukkan kata sandi Anda" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 32px 8px 10px', borderRadius: '6px', border: '1px solid rgba(203, 213, 225, 0.8)', backgroundColor: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', outline: 'none' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', marginTop: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Ingat Saya
            </label>
            
            {/* TOMBOL LUPA PASSWORD (TANPA HREF) */}
            <button 
              type="button"
              onClick={handleForgotPasswordClick} 
              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: '600', fontSize: '10px', padding: 0 }}
            >
              Lupa Kata Sandi?
            </button>
          </div>

          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '9px',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: '#f97316',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '4px',
              boxShadow: '0 3px 10px rgba(249, 115, 22, 0.3)'
            }}
          >
            Masuk
          </button>
        </form>

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '12px 0 10px 0' }}>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(148, 163, 184, 0.4)' }}></div>
          <span style={{ padding: '0 6px', fontSize: '9px', color: '#475569', fontWeight: '500' }}>Atau masuk dengan</span>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(148, 163, 184, 0.4)' }}></div>
        </div>

        {/* HANYA GOOGLE */}
        <button 
          type="button" 
          onClick={onLoginSuccess}
          style={{
            width: '100%',
            padding: '7px',
            borderRadius: '8px',
            border: '1px solid rgba(203, 213, 225, 0.8)',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '12px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/></svg>
          Masuk dengan Google
        </button>

        {/* TOMBOL DAFTAR (TANPA HREF) */}
        <div style={{ fontSize: '10px', color: '#1e293b' }}>
          Belum punya akun?{' '}
          <button 
            type="button"
            onClick={handleRegisterClick} 
            style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', fontSize: '10px', padding: 0 }}
          >
            Daftar Sekarang
          </button>
        </div>

      </div>

      <footer style={{ position: 'absolute', bottom: '10px', fontSize: '10px', color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
        © 2024 TripBuddy Smart Travel Planner. All Rights Reserved.
      </footer>

    </div>
  );
}