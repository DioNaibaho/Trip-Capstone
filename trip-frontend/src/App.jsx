import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Compass, Clock, Share2, User, Sparkles, Download, Plus, Info, 
  GripVertical, CloudSun, Eye, EyeOff, Send, CheckCircle, ArrowLeft, 
  X, Calendar, MapPin, DollarSign, Users, Bot, Settings, LogOut, Heart, Map, Wallet, Building2, Utensils, AlertTriangle
} from 'lucide-react';
import L from 'leaflet';
import axios from 'axios';
import LoginView from './login';
import CityDetail from './CityDetail'; 

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const createNumberIcon = (number) => {
  return L.divIcon({
    html: `<div style="background-color: #f97316; color: white; font-weight: bold; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.25); font-size: 12px;">${number}</div>`,
    className: '', iconSize: [26, 26], iconAnchor: [13, 13]
  });
};

// ==========================================
// 🛡️ ERROR BOUNDARY (Jaring Pengaman Error Runtime)
// ==========================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary menangkap kegagalan:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', padding: '24px', backgroundColor: '#f8fafc', zIndex: 10000, position: 'fixed', top: 0, left: 0, boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 16px auto' }}>
              <AlertTriangle size={32} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Yah, Ada Sedikit Masalah!</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              Tampilan mengalami kesalahan runtime (biasanya akibat koneksi map / API terganggu). Coba segarkan halaman.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '700', fontSize: '13px', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%' }}
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// ✨ STYLE & KEYFRAMES SKELETON (Injected)
// ==========================================
const skeletonStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  .skeleton-item {
    animation: pulse 1.5s infinite ease-in-out;
    background-color: #e2e8f0;
  }
`;

// ==========================================
// 📦 KOMPONEN SKELETON PLACEHOLDERS
// ==========================================
function DestinationPickerSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #f1f5f9', borderRadius: '10px', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '70%' }}>
            <div className="skeleton-item" style={{ height: '14px', width: '80%', borderRadius: '4px' }} />
            <div className="skeleton-item" style={{ height: '10px', width: '40%', borderRadius: '4px' }} />
          </div>
          <div className="skeleton-item" style={{ height: '28px', width: '70px', borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  );
}

function ExploreSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
      {[1, 2].map((i) => (
        <div key={i} style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
          <div className="skeleton-item" style={{ width: '100%', height: '140px' }} />
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton-item" style={{ height: '16px', width: '50%', borderRadius: '4px' }} />
            <div className="skeleton-item" style={{ height: '12px', width: '90%', borderRadius: '4px' }} />
            <div className="skeleton-item" style={{ height: '12px', width: '75%', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// KOMPONEN: AI CHATBOT WIDGET
// ==========================================
function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Halo! Saya TripBuddy AI Assistant. Ada yang bisa saya bantu?' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');

    try {
      const response = await axios.post('/api/chat', { message: userMsg });
      setMessages((prev) => [...prev, { sender: 'ai', text: response.data.reply }]);
    } catch (error) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'ai', text: `Rekomendasi AI untuk "${userMsg}": Coba kunjungi daerah Malioboro atau Prawirotaman.` }]);
      }, 1000);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} style={{ backgroundColor: '#f97316', color: '#ffffff', border: 'none', borderRadius: '30px', padding: '10px 18px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)' }}>
          <Bot size={18} /> Ask TripBuddy AI ✨
        </button>
      ) : (
        <div style={{ width: '320px', height: '420px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid rgba(255, 255, 255, 0.6)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bot size={18} color="#f97316" /><span style={{ fontSize: '13px', fontWeight: '700' }}>TripBuddy AI</span></div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          <div style={{ flexGrow: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'rgba(248, 250, 252, 0.7)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.sender === 'user' ? '#f97316' : '#ffffff', color: msg.sender === 'user' ? '#ffffff' : '#1e293b', padding: '8px 12px', borderRadius: '12px', fontSize: '11px', maxWidth: '80%', border: msg.sender === 'ai' ? '1px solid #e2e8f0' : 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} style={{ padding: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', backgroundColor: '#fff' }}>
            <input type="text" placeholder="Tanya rekomendasi..." value={inputText} onChange={(e) => setInputText(e.target.value)} style={{ flexGrow: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }} />
            <button type="submit" style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer' }}><Send size={14} /></button>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// KOMPONEN HALAMAN: MY TRIPS & EXPLORE (With Skeleton)
// ==========================================
function MyTripsView({ savedTrips, onSelectTrip, setIsModalOpen }) {
  return (
    <div style={{ padding: '16px', flexGrow: 1, overflowY: 'auto' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Riwayat Perjalanan Saya</h2>
      
      {savedTrips.length === 0 ? (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '30px 16px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <Map size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>Belum ada trip tersimpan</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Buat itinerary pertamamu sekarang!</p>
          <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Buat Trip Baru</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {savedTrips.map((trip) => (
            <div key={trip.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }}>
              <img src={trip.image || "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80"} style={{ width: '100%', height: '140px', objectFit: 'cover' }} alt={trip.city} />
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Liburan {trip.city}</h3>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700' }}>{trip.destinations.length} Destinasi</span>
                </div>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12}/> {trip.days} Hari • {trip.passengers} Orang
                </p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wallet size={12}/> Budget: Rp {trip.budget}
                </p>
                <button onClick={() => onSelectTrip(trip)} style={{ width: '100%', padding: '8px', backgroundColor: '#f97316', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#ffffff' }}>Lihat & Edit Detail</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExploreView({ onAddPlace, hasTrip }) {
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);

  const destinations = [
    { 
      name: 'Yogyakarta', 
      desc: 'Kota budaya, candi megah, dan surga kuliner tradisional.', 
      img: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      name: 'Bandung', 
      desc: 'Kota kembang dengan suasana sejuk, kuliner lezat, dan megahnya Gedung Sate.', 
      img: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=400&q=80'
    }
  ];

  // Simulasi Loading Skeleton di awal muat view
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  if (selectedCity) {
    return (
      <div style={{ flexGrow: 1, overflowY: 'auto', width: '100%', height: '100%' }}>
        {/* Sisipkan onAddPlace dan hasTrip di sini biar tembus ke CityDetail */}
        <CityDetail 
          cityName={selectedCity} 
          onBack={() => setSelectedCity(null)} 
          onAddPlace={onAddPlace}
          hasTrip={hasTrip}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', flexGrow: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Eksplor Destinasi</h2>
        <div style={{ position: 'relative' }}>
          <input type="text" placeholder="Cari kota..." style={{ padding: '6px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', fontSize: '11px', width: '140px', outline: 'none' }} />
        </div>
      </div>

      {loading ? (
        <ExploreSkeleton />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {destinations.map((dest, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedCity(dest.name)}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(12px)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.6)', position: 'relative', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
            >
              <img src={dest.img} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '6px', borderRadius: '50%', color: '#ef4444' }}>
                <Heart size={14} />
              </div>
              <div style={{ padding: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a' }}>{dest.name}</h3>
                <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>{dest.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODAL INPUT PERJALANAN (CREATE TRIP)
// ==========================================
function CreateTripModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ 
    city: 'Bandung, Jawa Barat', 
    days: 3, 
    passengers: 2, 
    budget: '5000000',
    preferences: ['Alam', 'Kuliner']
  });

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderRadius: '16px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#f97316', padding: '5px', borderRadius: '8px', display: 'flex' }}><Sparkles size={16} color="#fff" /></div>
            Buat Rencana Baru
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={20} /></button>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}><MapPin size={16} color="#f97316" /> Kota Tujuan</label>
            <select style={{ width: '100%', padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#0f172a', outline: 'none' }} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}>
              <option value="Bandung, Jawa Barat">Bandung, Jawa Barat</option>
              <option value="Yogyakarta, DIY">Yogyakarta, DIY</option>
              <option value="Bali">Bali</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}><Calendar size={16} color="#f97316" /> Durasi (Hari)</label>
              <input type="number" min="1" style={{ width: '100%', padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} value={formData.days} onChange={(e) => setFormData({...formData, days: e.target.value})} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}><Users size={16} color="#f97316" /> Jml Orang</label>
              <input type="number" min="1" style={{ width: '100%', padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} value={formData.passengers} onChange={(e) => setFormData({...formData, passengers: e.target.value})} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569' }}><Wallet size={16} color="#f97316" /> Estimasi Budget</label>
              <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>{formatRupiah(formData.budget)}</span>
            </div>
            <input type="range" min="0" max="20000000" step="250000" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }} />
          </div>
        </div>
        <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={() => onSubmit(formData)} style={{ width: '100%', backgroundColor: '#f97316', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} /> Mulai Rencanakan Manual
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODAL PILIH DESTINASI MANUAL DARI DATABASE
// ==========================================
function DestinationPickerModal({ isOpen, onClose, city, onAdd }) {
  const [activeTab, setActiveTab] = useState('attractions');
  const [data, setData] = useState({ hotels: [], attractions: [], culinaries: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && city) {
      setLoading(true);
      const cityName = city.split(',')[0]; 
      fetch(`/api/destinations/${cityName}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success) setData(resData.data);
          // Simulasi sedikit waktu loading agar skeleton terlihat natural
          setTimeout(() => setLoading(false), 500);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, city]);

  if (!isOpen) return null;

  const currentList = data[activeTab] || [];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Pilih Tempat di {city.split(',')[0]}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {['attractions', 'hotels', 'culinaries'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 12px', borderRadius: '20px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '11px',
                backgroundColor: activeTab === tab ? '#0f172a' : '#e2e8f0',
                color: activeTab === tab ? '#fff' : '#475569'
              }}
            >
              {tab === 'attractions' ? 'Wisata' : tab === 'hotels' ? 'Hotel' : 'Kuliner'}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <DestinationPickerSkeleton />
          ) : currentList.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', padding: '24px' }}>Tidak ada data tersedia.</div>
          ) : (
            currentList.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff' }}>
                <div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{item.name}</h3>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Kategori: {item.tourism || item.amenity || 'Umum'}</span>
                </div>
                <button 
                  onClick={() => onAdd(item, activeTab)}
                  style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> Tambah
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

// ==========================================
// MAIN APP WITH ERROR BOUNDARY & SKELETON
// ==========================================
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [hasTrip, setHasTrip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  
  // Deteksi Layar HP
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animasi Peta Loader
  useEffect(() => {
    if (hasTrip) {
      setMapLoading(true);
      const timer = setTimeout(() => setMapLoading(false), 700);
      return () => clearTimeout(timer);
    }
  }, [hasTrip, currentTab]);
  
  const [savedTrips, setSavedTrips] = useState([]);
  const [tripInfo, setTripInfo] = useState({ id: null, city: '', budget: '0', passengers: '2', days: 3, preferences: [] });
  const [destinations, setDestinations] = useState([]);
  
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(destinations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setDestinations(items);
    setSavedTrips(prev => prev.map(t => t.id === tripInfo.id ? { ...t, destinations: items } : t));
  };

  const handleCreateTripSubmit = (data) => {
    const formattedBudget = new Intl.NumberFormat('id-ID').format(data.budget);
    
    const newTrip = {
      id: Date.now().toString(),
      city: data.city,
      budget: formattedBudget,
      passengers: data.passengers,
      days: data.days,
      preferences: data.preferences,
      destinations: [],
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80'
    };

    setSavedTrips([newTrip, ...savedTrips]);
    setTripInfo(newTrip);
    setDestinations([]);
    setHasTrip(true);
    setIsModalOpen(false);
    setCurrentTab('dashboard');
  };

  const handleSelectTripFromHistory = (selectedTrip) => {
    setTripInfo(selectedTrip);
    setDestinations(selectedTrip.destinations || []);
    setHasTrip(true);
    setCurrentTab('dashboard');
  };

  const handleAddDestination = (item, tabType) => {
    const newItem = {
      id: Date.now().toString(),
      name: item.name,
      category: tabType === 'hotels' ? 'Akomodasi' : tabType === 'culinaries' ? 'Kuliner' : 'Wisata',
      lat: parseFloat(item.latitude),
      lng: parseFloat(item.longitude),
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80'
    };
    
    const updatedDestinations = [...destinations, newItem];
    setDestinations(updatedDestinations);
    setSavedTrips(prev => prev.map(t => t.id === tripInfo.id ? { ...t, destinations: updatedDestinations } : t));
    setIsPickerOpen(false); 
  };

  const routeCoordinates = destinations.map(item => [item.lat, item.lng]);
  
  let currentMapCenter = [-6.9175, 107.6191];
  if (destinations.length > 0) {
    currentMapCenter = [destinations[0].lat, destinations[0].lng];
  } else if (tripInfo.city.includes('Yogyakarta')) {
    currentMapCenter = [-7.7970, 110.3705];
  }

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <ErrorBoundary>
      {/* Inject Style Animasi Skeleton ke Dokumen */}
      <style>{skeletonStyles}</style>

      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", color: '#1e293b', position: 'relative' }}>
        
        {/* BACKGROUND IMAGE BLUR */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.55)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          transform: 'scale(1.08)',
          zIndex: 0
        }} />

        {/* KONTEN UTAMA */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
          
          <AIChatbotWidget />
          
          <CreateTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateTripSubmit} />
          <DestinationPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} city={tripInfo.city} onAdd={handleAddDestination} />

          {/* TOP NAVBAR */}
          <header style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.88)', 
            backdropFilter: 'blur(12px)', 
            padding: isMobile ? '8px 12px' : '8px 24px', 
            height: isMobile ? 'auto' : '52px', 
            minHeight: '52px',
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: isMobile ? '8px' : '0px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.5)', 
            flexShrink: 0 
          }}>
            {/* Baris Atas di HP (Logo & User) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: isMobile ? '100%' : 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '5px', borderRadius: '50%', display: 'flex', color: '#f97316' }}>
                  <Compass size={18} />
                </div>
                <h1 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f172a', lineHeight: 1 }}>Trip<span style={{ color: '#f97316' }}>Buddy</span></h1>
              </div>

              {/* Tombol Buat Trip & Profil khusus tampilan Mobile */}
              {isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f97316', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '16px', fontWeight: '700', fontSize: '10px', cursor: 'pointer' }}>
                    <Sparkles size={11} /> + Trip
                  </button>
                  <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                    <User size={14} />
                  </div>
                </div>
              )}
            </div>

            {/* Menu Navigasi Tengah */}
            <nav style={{ display: 'flex', gap: isMobile ? '12px' : '16px', fontSize: isMobile ? '11px' : '13px', fontWeight: '600' }}>
              <span onClick={() => setCurrentTab('dashboard')} style={{ color: currentTab === 'dashboard' ? '#0f172a' : '#475569', borderBottom: currentTab === 'dashboard' ? '2px solid #0f172a' : 'none', paddingBottom: '2px', cursor: 'pointer' }}>Dashboard</span>
              <span onClick={() => setCurrentTab('mytrips')} style={{ color: currentTab === 'mytrips' ? '#0f172a' : '#475569', borderBottom: currentTab === 'mytrips' ? '2px solid #0f172a' : 'none', paddingBottom: '2px', cursor: 'pointer' }}>My Trips ({savedTrips.length})</span>
              <span onClick={() => setCurrentTab('explore')} style={{ color: currentTab === 'explore' ? '#0f172a' : '#475569', borderBottom: currentTab === 'explore' ? '2px solid #0f172a' : 'none', paddingBottom: '2px', cursor: 'pointer' }}>Explore</span>
            </nav>

            {/* Tombol Desktop */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f97316', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>
                  <Sparkles size={13} /> + Buat Trip Baru
                </button>

                <div style={{ position: 'relative' }}>
                  <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px', borderRadius: '20px', backgroundColor: isProfileOpen ? 'rgba(255,255,255,0.8)' : 'transparent' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <User size={16} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>User ∨</span>
                  </div>
                </div>
              </div>
            )}

            {/* Dropdown Logout */}
            {isProfileOpen && (
              <div style={{ position: 'absolute', top: isMobile ? '80px' : '45px', right: '16px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', width: '160px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.6)', zIndex: 999, overflow: 'hidden' }}>
                <div onClick={() => { setIsLoggedIn(false); setIsProfileOpen(false); }} style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: '#fef2f2' }}>
                  <LogOut size={14} color="#ef4444" /> <span style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>Keluar (Logout)</span>
                </div>
              </div>
            )}
          </header>

          {/* RENDER KONTEN */}
          {currentTab === 'mytrips' && (
            <MyTripsView 
              savedTrips={savedTrips} 
              onSelectTrip={handleSelectTripFromHistory} 
              setIsModalOpen={setIsModalOpen} 
            />
          )}
          
          {currentTab === 'explore' && <ExploreView onAddPlace={handleAddDestination} hasTrip={hasTrip} />}
          
          {currentTab === 'dashboard' && (
            !hasTrip ? (
              <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(12px)', borderRadius: '20px', padding: '30px 20px', textAlign: 'center', maxWidth: '420px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#f97316' }}><Compass size={30} /></div>
                  <h2 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a' }}>Belum Ada Rencana Aktif</h2>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '20px' }}>Mulai rencanakan liburan impianmu!</p>
                  <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Buat Rencana Sekarang</button>
                </div>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '230px 1fr 310px', 
                gap: '10px', 
                padding: isMobile ? '10px 12px' : '10px 24px 14px 24px', 
                flexGrow: 1, 
                overflowY: isMobile ? 'auto' : 'hidden' 
              }}>
                
                {/* KIRI - Info Trip */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(12px)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '700', margin: '0 0 6px 0', color: '#0f172a' }}>Ringkasan Perjalanan</h3>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Estimasi Budget:</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Rp {tripInfo.budget}</div>
                  </div>
                </div>

                {/* TENGAH - Drag & Drop Itinerary */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(12px)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>Rencana: {tripInfo.city}</h2>
                    <button 
                      onClick={() => setIsPickerOpen(true)} 
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      <Plus size={12} /> Tambah Tempat
                    </button>
                  </div>

                  <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="itinerary-list" direction="horizontal">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', minHeight: '90px' }}>
                          
                          {destinations.length === 0 && (
                            <div style={{ width: '100%', textAlign: 'center', color: '#64748b', fontSize: '11px', padding: '16px 0', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                              Rencana masih kosong. Klik "Tambah Tempat"!
                            </div>
                          )}

                          {destinations.map((place, index) => (
                            <Draggable key={place.id} draggableId={place.id} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ minWidth: '140px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...provided.draggableProps.style }}>
                                  <img src={place.image} style={{ width: '100%', height: '55px', borderRadius: '6px', objectFit: 'cover', marginBottom: '4px' }} />
                                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.name}</div>
                                  <div style={{ fontSize: '9px', color: '#64748b' }}>{place.category}</div>
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

                {/* KANAN - Leaflet Map dengan Skeleton Fallback */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(12px)', padding: '10px', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#0f172a' }}>Map View</div>
                  
                  {/* Pintu Pengaman Map loading / Crash di level lokal component */}
                  <div style={{ flexGrow: 1, minHeight: isMobile ? '280px' : '160px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    {mapLoading ? (
                      <div className="skeleton-item" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                        <span style={{ color: '#475569', fontSize: '11px', fontWeight: '700' }}>Menyiapkan Peta Lokasi...</span>
                      </div>
                    ) : (
                      <ErrorBoundary>
                        <MapContainer key={currentMapCenter.toString()} center={currentMapCenter} zoom={12} style={{ width: '100%', height: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          {destinations.map((p, i) => (
                            <Marker key={p.id} position={[p.lat, p.lng]} icon={createNumberIcon(i+1)}>
                              <Popup><b>{p.name}</b></Popup>
                            </Marker>
                          ))}
                          <Polyline positions={routeCoordinates} color="#f97316" weight={3} />
                        </MapContainer>
                      </ErrorBoundary>
                    )}
                  </div>
                </div>

              </div>
            )
          )}
        </div>

      </div>
    </ErrorBoundary>
  );
}