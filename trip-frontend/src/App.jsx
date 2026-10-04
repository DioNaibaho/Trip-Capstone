import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Compass, Clock, Share2, User, Sparkles, Download, Plus, Info, 
  GripVertical, CloudSun, Eye, EyeOff, Send, CheckCircle, ArrowLeft, 
  X, Calendar, MapPin, DollarSign, Users, MessageSquare, Bot
} from 'lucide-react';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const createNumberIcon = (number) => {
  return L.divIcon({
    html: `<div style="
      background-color: #f97316; 
      color: white; 
      font-weight: bold; 
      border-radius: 50%; 
      width: 26px; 
      height: 26px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      border: 2px solid white; 
      box-shadow: 0 2px 5px rgba(0,0,0,0.25);
      font-size: 12px;
    ">${number}</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

// ==========================================
// 1. KOMPONEN FLOATING AI CHATBOT ASSISTANT
// ==========================================
function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Halo! Saya TripBuddy AI Assistant. Ada yang bisa saya bantu untuk liburanmu di Yogyakarta?' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');

    // Simulasi Jawaban AI
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'ai', 
          text: `Rekomendasi AI untuk "${userMsg}": Coba kunjungi Warung Kopi Klotok atau Jejamuran! Memiliki rating 4.7★ dan sepi di jam 15:00.` 
        }
      ]);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: '#f97316',
            color: '#ffffff',
            border: 'none',
            borderRadius: '30px',
            padding: '10px 18px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)'
          }}
        >
          <Bot size={18} /> Ask TripBuddy AI ✨
        </button>
      ) : (
        <div style={{
          width: '320px',
          height: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header Chat */}
          <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} color="#f97316" />
              <span style={{ fontSize: '13px', fontWeight: '700' }}>TripBuddy AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Isi Pesan Chat */}
          <div style={{ flexGrow: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafc' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'user' ? '#f97316' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  maxWidth: '80%',
                  border: msg.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Chat */}
          <form onSubmit={handleSend} style={{ padding: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', backgroundColor: '#fff' }}>
            <input
              type="text"
              placeholder="Tanya AI seputar tempat wisata..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ flexGrow: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }}
            />
            <button type="submit" style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. KOMPONEN LUPA PASSWORD
// ==========================================
function ForgotPasswordView({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: '16px', overflow: 'hidden'
    }}>
      <div style={{
        width: '100%', maxWidth: '380px', backgroundColor: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '20px', padding: '24px 28px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.5)',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '50%', display: 'flex', color: '#f97316' }}>
            <Compass size={20} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
            Trip<span style={{ color: '#f97316' }}>Buddy</span>
          </h1>
        </div>

        <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '12px 0 4px 0' }}>Lupa Kata Sandi?</h2>
        <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 16px 0', textAlign: 'center', lineHeight: '1.4' }}>
          Masukkan email terdaftar Anda untuk menerima link reset kata sandi.
        </p>

        {!isSubmitted ? (
          <form onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', fontWeight: '600', color: '#1e293b' }}>Email Terdaftar</label>
              <input 
                type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '9px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }}
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: '16px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Send size={14} /> Kirim Link Reset
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <CheckCircle size={36} color="#16a34a" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Email Berhasil Dikirim!</div>
            <p style={{ fontSize: '10px', color: '#475569', margin: '4px 0 14px 0' }}>Cek email <strong>{email}</strong> Anda.</p>
          </div>
        )}

        <button type="button" onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px' }}>
          <ArrowLeft size={13} /> Kembali ke Halaman Masuk
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 3. KOMPONEN REGISTER
// ==========================================
function RegisterView({ onNavigate, onRegisterSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Kata sandi tidak cocok!");
      return;
    }
    onRegisterSuccess();
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: '16px', overflow: 'hidden'
    }}>
      <div style={{
        width: '100%', maxWidth: '380px', backgroundColor: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '20px', padding: '20px 28px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.5)',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '50%', display: 'flex', color: '#f97316' }}>
            <Compass size={20} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
            Trip<span style={{ color: '#f97316' }}>Buddy</span>
          </h1>
        </div>

        <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px 0' }}>Buat Akun Baru</h2>
        <p style={{ fontSize: '10px', color: '#475569', margin: '0 0 12px 0' }}>Mulai liburan cerdas Anda hari ini.</p>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input type="text" placeholder="Nama Lengkap" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }} />
          
          <div style={{ position: 'relative', width: '100%' }}>
            <input type={showPassword ? "text" : "password"} placeholder="Kata Sandi" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '7px 32px 7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <input type="password" placeholder="Konfirmasi Kata Sandi" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }} />

          <button type="submit" style={{ width: '100%', padding: '9px', borderRadius: '16px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}>
            Daftar Sekarang
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '10px 0 8px 0' }}>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(148, 163, 184, 0.4)' }}></div>
          <span style={{ padding: '0 6px', fontSize: '9px', color: '#475569' }}>Atau daftar dengan</span>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(148, 163, 184, 0.4)' }}></div>
        </div>

        <button type="button" onClick={onRegisterSuccess} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: '#1e293b', marginBottom: '10px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/></svg>
          Daftar dengan Google
        </button>

        <div style={{ fontSize: '10px', color: '#1e293b' }}>
          Sudah punya akun?{' '}
          <button type="button" onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            Masuk Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. KOMPONEN LOGIN (BACKGROUND TUGU JOGJA)
// ==========================================
function LoginView({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: '16px', overflow: 'hidden'
    }}>
      <div style={{
        width: '100%', maxWidth: '380px', backgroundColor: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '20px', padding: '22px 28px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.5)',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '50%', display: 'flex', color: '#f97316' }}>
            <Compass size={20} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
            Trip<span style={{ color: '#f97316' }}>Buddy</span>
          </h1>
        </div>

        <p style={{ fontSize: '10px', color: '#334155', margin: '0 0 12px 0', textAlign: 'center' }}>
          Sistem Rekomendasi Destinasi Wisata<br />dan Penjadwalan Perjalanan Otomatis
        </p>

        <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>
          Selamat Datang Kembali, Penjelajah!
        </h2>
        <p style={{ fontSize: '10px', color: '#475569', margin: '0 0 14px 0' }}>Masuk untuk merencanakan perjalanan.</p>

        <form onSubmit={(e) => { e.preventDefault(); onLoginSuccess(); }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10px', fontWeight: '600', color: '#1e293b' }}>Email atau Username</label>
            <input type="text" placeholder="Masukkan email Anda" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '10px', fontWeight: '600', color: '#1e293b' }}>Kata Sandi</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input type={showPassword ? "text" : "password"} placeholder="Masukkan kata sandi Anda" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px 32px 8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Ingat Saya
            </label>
            
            <button type="button" onClick={() => onNavigate('forgot-password')} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: '600', fontSize: '10px', padding: 0 }}>
              Lupa Kata Sandi?
            </button>
          </div>

          <button type="submit" style={{ width: '100%', padding: '9px', borderRadius: '16px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}>
            Masuk
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '12px 0 10px 0' }}>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(148, 163, 184, 0.4)' }}></div>
          <span style={{ padding: '0 6px', fontSize: '9px', color: '#475569' }}>Atau masuk dengan</span>
          <div style={{ flex: 1, borderBottom: '1px solid rgba(148, 163, 184, 0.4)' }}></div>
        </div>

        <button type="button" onClick={onLoginSuccess} style={{ width: '100%', padding: '7px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 23z"/></svg>
          Masuk dengan Google
        </button>

        <div style={{ fontSize: '10px', color: '#1e293b' }}>
          Belum punya akun?{' '}
          <button type="button" onClick={() => onNavigate('register')} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', fontSize: '10px', padding: 0 }}>
            Daftar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. MODAL INPUT PERJALANAN
// ==========================================
function CreateTripModal({ isOpen, onClose, onSubmit }) {
  const [city, setCity] = useState('Yogyakarta');
  const [startDate, setStartDate] = useState('2024-12-10');
  const [endDate, setEndDate] = useState('2024-12-14');
  const [budget, setBudget] = useState('4500000');
  const [passengers, setPassengers] = useState('2 Dewasa');
  const [preferences, setPreferences] = useState(['Budaya', 'Kuliner', 'Alam']);

  if (!isOpen) return null;

  const handlePreferenceToggle = (pref) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter(p => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
    }}>
      <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '480px', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#f97316', padding: '6px', borderRadius: '50%', display: 'flex' }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Buat Rencana Perjalanan Baru</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ city, startDate, endDate, budget: parseInt(budget || '0').toLocaleString('id-ID'), passengers, preferences }); }} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="#f97316" /> Kota Tujuan Wisata
            </label>
            <select value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}>
              <option value="Yogyakarta">DIY Yogyakarta</option>
              <option value="Bandung">Bandung, Jawa Barat</option>
              <option value="Bali">Denpasar & Badung, Bali</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} color="#f97316" /> Tanggal Mulai</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} color="#f97316" /> Tanggal Selesai</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={13} color="#f97316" /> Budget (Rp)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={13} color="#f97316" /> Wisatawan</label>
              <input type="text" value={passengers} onChange={(e) => setPassengers(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', marginBottom: '6px', display: 'block' }}>Preferensi Wisata:</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['Budaya', 'Alam', 'Kuliner', 'Sejarah', 'Belanja'].map((item) => {
                const isSelected = preferences.includes(item);
                return (
                  <button key={item} type="button" onClick={() => handlePreferenceToggle(item)} style={{ padding: '4px 10px', borderRadius: '12px', border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1', backgroundColor: isSelected ? '#eff6ff' : '#fff', color: isSelected ? '#1d4ed8' : '#64748b', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    {isSelected ? '✓ ' : '+ '}{item}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Sparkles size={16} /> Generate Itinerary dengan AI
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 6. KOMPONEN UTAMA DASHBOARD APP
// ==========================================
const defaultDestinations = [
  { id: '1', name: 'Tiba di YIA', time: '09:00', category: 'Transportasi', lat: -7.9015, lng: 110.0573, crowdLevel: 'Sepi', crowdPercent: 20, crowdColor: '#16a34a', image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=300&q=80' },
  { id: '2', name: 'Transfer ke Hotel', time: '10:30', category: 'Akomodasi', lat: -7.7828, lng: 110.3671, crowdLevel: 'Normal', crowdPercent: 40, crowdColor: '#2563eb', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80' },
  { id: '3', name: 'Makan Siang Gudeg Pawon', time: '12:00', category: 'Kuliner', lat: -7.8055, lng: 110.3820, crowdLevel: 'Sedang', crowdPercent: 65, crowdColor: '#d97706', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80' },
  { id: '4', name: 'Candi Borobudur', time: '14:00', category: 'Wisata Sejarah', lat: -7.6079, lng: 110.2038, crowdLevel: 'Tinggi (Peak)', crowdPercent: 88, crowdColor: '#dc2626', image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=300&q=80' },
  { id: '5', name: 'Makan Malam Malioboro', time: '19:00', category: 'Kuliner & Belanja', lat: -7.7926, lng: 110.3658, crowdLevel: 'Sedang', crowdPercent: 70, crowdColor: '#d97706', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=300&q=80' }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [hasTrip, setHasTrip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [tripInfo, setTripInfo] = useState({
    city: 'Yogyakarta', budget: '4.500.000', passengers: '2 Dewasa', preferences: ['Budaya', 'Alam', 'Kuliner']
  });

  const [destinations, setDestinations] = useState(defaultDestinations);
  const [activeDay, setActiveDay] = useState(1);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(destinations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setDestinations(items);
  };

  const handleCreateTripSubmit = (data) => {
    setTripInfo({ city: data.city, budget: data.budget, passengers: data.passengers, preferences: data.preferences });
    setHasTrip(true);
    setIsModalOpen(false);
  };

  const routeCoordinates = destinations.map(item => [item.lat, item.lng]);
  const mapCenter = [-7.7800, 110.3600];

  if (!isLoggedIn) {
    if (authView === 'register') {
      return <RegisterView onNavigate={(view) => setAuthView(view)} onRegisterSuccess={() => setIsLoggedIn(true)} />;
    }
    if (authView === 'forgot-password') {
      return <ForgotPasswordView onNavigate={(view) => setAuthView(view)} />;
    }
    return <LoginView onNavigate={(view) => setAuthView(view)} onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={{ backgroundColor: '#e2e8f0', height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", color: '#1e293b', position: 'relative' }}>
      
      {/* FLOATING AI CHATBOT ASSISTANT WIDGET */}
      <AIChatbotWidget />

      <CreateTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateTripSubmit} />

      {/* TOP NAVBAR */}
      <header style={{ backgroundColor: '#ffffff', padding: '8px 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '7px', borderRadius: '50%', display: 'flex', color: '#f97316' }}>
            <Compass size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a', lineHeight: 1 }}>
              Trip<span style={{ color: '#f97316' }}>Buddy</span>
            </h1>
            <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>Sistem Rekomendasi Destinasi Wisata</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <nav style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: '600' }}>
            <span style={{ color: '#0f172a', borderBottom: '2px solid #0f172a', paddingBottom: '2px', cursor: 'pointer' }}>Dashboard</span>
            <span style={{ color: '#64748b', cursor: 'pointer' }}>My Trips</span>
            <span style={{ color: '#64748b', cursor: 'pointer' }}>Explore</span>
          </nav>

          <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f97316', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>
            <Sparkles size={13} /> + Buat Trip Baru
          </button>

          <div onClick={() => setIsLoggedIn(false)} title="Klik untuk Logout" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <User size={16} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>User ∨</span>
          </div>
        </div>
      </header>

      <div style={{ padding: '8px 24px 0 24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0f172a', flexShrink: 0 }}>
        <Compass size={15} color="#f97316" /> TripBuddy - Smart Travel Planner
      </div>

      {/* BELUM ADA TRIP */}
      {!hasTrip ? (
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '40px', textAlign: 'center', maxWidth: '520px', border: '1px solid #cbd5e1' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#f97316' }}>
              <Compass size={36} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Belum Ada Rencana Perjalanan</h2>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', margin: '0 0 24px 0' }}>Mulai rencanakan liburan impianmu! Biarkan AI optimasi rute secara otomatis.</p>
            <button onClick={() => setIsModalOpen(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} /> Buat Rencana Perjalanan Pertama
            </button>
          </div>
        </div>
      ) : (
        /* DASHBOARD 3 PANEL */
        <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr 310px', gap: '12px', padding: '10px 24px 14px 24px', flexGrow: 1, overflow: 'hidden' }}>
          {/* PANEL KIRI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 6px 0' }}>Ringkasan Perjalanan</h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0' }}>Sistem Rekomendasi Destinasi Otomatis.</p>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginBottom: '10px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Trip Preference:</div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {tripInfo.preferences.map(pref => (
                    <span key={pref} style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '8px', fontSize: '10px', fontWeight: '600' }}>{pref}</span>
                  ))}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Total Estimated Budget:</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>Rp {tripInfo.budget}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Cuaca Terkirim:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CloudSun size={26} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', lineHeight: 1 }}>28°C</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{tripInfo.city}</div>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL TENGAH */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, overflowY: 'auto' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 2px 0' }}>Rencana Perjalanan: {tripInfo.city}</h2>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{tripInfo.passengers}, 5 Hari 4 Malam</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontWeight: '600', fontSize: '11px', cursor: 'pointer' }}>Simpan Jadwal</button>
                  <button style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: '600', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Download size={12} /> Export PDF</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <button onClick={() => setActiveDay(1)} style={{ backgroundColor: activeDay === 1 ? '#0f172a' : '#f1f5f9', color: activeDay === 1 ? '#fff' : '#64748b', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>HARI 1 (Selasa, 10 Des)</button>
                <button onClick={() => setActiveDay(2)} style={{ backgroundColor: activeDay === 2 ? '#0f172a' : '#f1f5f9', color: activeDay === 2 ? '#fff' : '#64748b', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>Day 2 (Rabu, 11 Des)</button>
              </div>

              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="itinerary-list" direction="horizontal">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', alignItems: 'stretch', flexGrow: 1 }}>
                      {destinations.map((place, index) => (
                        <Draggable key={place.id} draggableId={place.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} style={{ minWidth: '150px', maxWidth: '160px', backgroundColor: snapshot.isDragging ? '#eff6ff' : '#ffffff', borderRadius: '10px', border: snapshot.isDragging ? '2px dashed #f97316' : '1px solid #e2e8f0', padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ...provided.draggableProps.style }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ backgroundColor: '#f97316', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '1px 6px', borderRadius: '8px' }}>#{index + 1}</span>
                                  <div {...provided.dragHandleProps} style={{ cursor: 'grab', color: '#94a3b8' }}><GripVertical size={14} /></div>
                                </div>
                                <img src={place.image} style={{ width: '100%', height: '60px', borderRadius: '6px', objectFit: 'cover', marginBottom: '6px' }} />
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', lineHeight: '1.2' }}>{place.name}</div>
                                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>{place.category}</div>
                              </div>
                              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {place.time}</div>
                                <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: '700', color: place.crowdColor, backgroundColor: '#f8fafc', padding: '2px 4px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>📊 AI Crowd: {place.crowdLevel} ({place.crowdPercent}%)</div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          {/* PANEL KANAN */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Map View (Rute Terhubung)</div>
              <div style={{ flexGrow: 1, minHeight: '160px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <MapContainer center={mapCenter} zoom={9} style={{ width: '100%', height: '100%' }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {destinations.map((place, idx) => (
                    <Marker key={place.id} position={[place.lat, place.lng]} icon={createNumberIcon(idx + 1)}>
                      <Popup><strong>#{idx + 1} {place.name}</strong><br />Jam: {place.time}<br />Crowd: {place.crowdLevel}</Popup>
                    </Marker>
                  ))}
                  <Polyline positions={routeCoordinates} color="#f97316" weight={3} dashArray="5, 7" />
                </MapContainer>
              </div>
              <button style={{ width: '100%', padding: '6px', marginTop: '8px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}><Plus size={13} /> Add Custom Stop</button>
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '8px', borderRadius: '6px', marginTop: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}><Info size={11} /> Recent Trip Changes (AI):</div>
                <p style={{ fontSize: '9px', color: '#0369a1', margin: '2px 0 0 0' }}>Candi Borobudur visit extended by 15 mins due to low crowd forecast.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}