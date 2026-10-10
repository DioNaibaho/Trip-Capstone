import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Compass, Clock, Share2, User, Sparkles, Download, Plus, Info, 
  GripVertical, CloudSun, Eye, EyeOff, Send, CheckCircle, ArrowLeft, 
  X, Calendar, MapPin, DollarSign, Users, Bot, Settings, LogOut, Heart, Map, Wallet, Building2, Utensils
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
      const response = await axios.post('http://localhost:8000/api/chat', { message: userMsg });
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
        <div style={{ width: '320px', height: '420px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bot size={18} color="#f97316" /><span style={{ fontSize: '13px', fontWeight: '700' }}>TripBuddy AI</span></div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          <div style={{ flexGrow: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f8fafc' }}>
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
// KOMPONEN HALAMAN: MY TRIPS & EXPLORE
// ==========================================
function MyTripsView({ hasTrip, tripInfo, setCurrentTab }) {
  return (
    <div style={{ padding: '24px', flexGrow: 1, overflowY: 'auto' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>Perjalanan Saya</h2>
      
      {!hasTrip ? (
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <Map size={40} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Belum ada trip tersimpan</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Buat itinerary pertamamu sekarang!</p>
          <button onClick={() => setCurrentTab('dashboard')} style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Kembali ke Dashboard</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <img src="https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>Liburan {tripInfo.city}</h3>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700' }}>Aktif</span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12}/> 10 Des - 14 Des 2024
              </p>
              <button onClick={() => setCurrentTab('dashboard')} style={{ width: '100%', padding: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#0f172a' }}>Lihat Detail</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExploreView() {
  const destinations = [
    { 
      name: 'Yogyakarta', 
      desc: 'Kota budaya, candi megah, dan surga kuliner tradisional.', 
      img: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      name: 'Bandung', 
      desc: 'Kota kembang dengan suasana sejuk, kuliner lezat, dan megahnya Gedung Sate.', 
      img: 'https://unsplash.com/id/foto/orang-orang-yang-berjalan-di-jalan-o4tUA3yxuH4?auto=format&fit=crop&w=400&q=80'
    }
  ];
  
  const [selectedCity, setSelectedCity] = useState(null);
  
  if (selectedCity) {
    return (
      <div style={{ flexGrow: 1, overflowY: 'auto', width: '100%', height: '100%' }}>
        <CityDetail cityName={selectedCity} onBack={() => setSelectedCity(null)} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', flexGrow: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Eksplor Destinasi</h2>
        <div style={{ position: 'relative' }}>
          <input type="text" placeholder="Cari kota atau tempat..." style={{ padding: '8px 12px', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '12px', width: '200px', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
        {destinations.map((dest, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedCity(dest.name)}
            style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', cursor: 'pointer' }}
          >
            <img src={dest.img} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '6px', borderRadius: '50%', color: '#ef4444' }}>
              <Heart size={14} />
            </div>
            <div style={{ padding: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 4px 0' }}>{dest.name}</h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{dest.desc}</p>
            </div>
          </div>
        ))}
      </div>
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
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#f97316', padding: '6px', borderRadius: '8px', display: 'flex' }}><Sparkles size={18} color="#fff" /></div>
            Buat Rencana Baru
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={22} /></button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}><MapPin size={18} color="#f97316" /> Kota Tujuan</label>
            <select style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', color: '#0f172a', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}>
              <option value="Bandung, Jawa Barat">Bandung, Jawa Barat</option>
              <option value="Yogyakarta, DIY">Yogyakarta, DIY</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}><Calendar size={18} color="#f97316" /> Durasi (Hari)</label>
              <input type="number" min="1" style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} value={formData.days} onChange={(e) => setFormData({...formData, days: e.target.value})} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}><Users size={18} color="#f97316" /> Jml Orang</label>
              <input type="number" min="1" style={{ width: '100%', padding: '12px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} value={formData.passengers} onChange={(e) => setFormData({...formData, passengers: e.target.value})} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}><Wallet size={18} color="#f97316" /> Estimasi Budget</label>
              <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '700' }}>{formatRupiah(formData.budget)}</span>
            </div>
            <input type="range" min="0" max="20000000" step="250000" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '10px', appearance: 'none', cursor: 'pointer', accentColor: '#f97316' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginTop: '8px', fontWeight: '600' }}>
              <span>Rp 0</span><span>Rp 20 Juta</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '20px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={() => onSubmit(formData)} style={{ width: '100%', backgroundColor: '#f97316', color: '#ffffff', fontWeight: 'bold', fontSize: '16px', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)' }}>
            <Sparkles size={20} /> Mulai Rencanakan Manual
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
      fetch(`http://localhost:5000/api/destinations/${cityName}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success) setData(resData.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, city]);

  if (!isOpen) return null;

  const currentList = data[activeTab] || [];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Pilih Tempat di {city.split(',')[0]}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: '10px', padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {['attractions', 'hotels', 'culinaries'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '12px',
                backgroundColor: activeTab === tab ? '#0f172a' : '#e2e8f0',
                color: activeTab === tab ? '#fff' : '#475569'
              }}
            >
              {tab === 'attractions' ? 'Wisata' : tab === 'hotels' ? 'Hotel' : 'Kuliner'}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b' }}>Memuat data...</div>
          ) : currentList.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>Tidak ada data tersedia.</div>
          ) : (
            currentList.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700' }}>{item.name}</h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Kategori: {item.tourism || item.amenity || 'Umum'}</span>
                </div>
                <button 
                  onClick={() => onAdd(item, activeTab)}
                  style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Tambah
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
// MAIN APP
// ==========================================
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [hasTrip, setHasTrip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false); // State buat buka modal picker manual
  
  const [tripInfo, setTripInfo] = useState({ city: 'Yogyakarta', budget: '0', passengers: '2', preferences: [] });
  const [destinations, setDestinations] = useState([]); // Default array kosong
  
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(destinations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setDestinations(items);
  };

  // Fungsi saat form "Buat Trip" disubmit (Mengosongkan Itinerary untuk diisi manual)
  const handleCreateTripSubmit = (data) => {
    const formattedBudget = new Intl.NumberFormat('id-ID').format(data.budget);
    setTripInfo({ city: data.city, budget: formattedBudget, passengers: data.passengers, preferences: data.preferences });
    setDestinations([]); // Kosongkan biar user bisa ngisi manual
    setHasTrip(true);
    setIsModalOpen(false);
    setCurrentTab('dashboard'); 
  };

  // Fungsi masukin tempat dari Modal ke Daftar Rencana
  const handleAddDestination = (item, tabType) => {
    const newItem = {
      id: Date.now().toString(), // Bikin ID unik biar nggak error pas ditarik Drop&Drop
      name: item.name,
      category: tabType === 'hotels' ? 'Akomodasi' : tabType === 'culinaries' ? 'Kuliner' : 'Wisata',
      lat: parseFloat(item.latitude),
      lng: parseFloat(item.longitude),
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80'
    };
    setDestinations([...destinations, newItem]);
    setIsPickerOpen(false); 
  };

  // Logika Pembuatan Rute Peta
  const routeCoordinates = destinations.map(item => [item.lat, item.lng]);
  
  let currentMapCenter = [-6.9175, 107.6191]; // Default Bandung
  if (destinations.length > 0) {
    currentMapCenter = [destinations[0].lat, destinations[0].lng];
  } else if (tripInfo.city.includes('Yogyakarta')) {
    currentMapCenter = [-7.7970, 110.3705];
  }

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={{ backgroundColor: '#e2e8f0', height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", color: '#1e293b', position: 'relative' }}>
      
      <AIChatbotWidget />
      
      {/* MODAL COMPONENTS */}
      <CreateTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateTripSubmit} />
      <DestinationPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} city={tripInfo.city} onAdd={handleAddDestination} />

      {/* TOP NAVBAR */}
      <header style={{ backgroundColor: '#ffffff', padding: '8px 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '7px', borderRadius: '50%', display: 'flex', color: '#f97316' }}>
            <Compass size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a', lineHeight: 1 }}>Trip<span style={{ color: '#f97316' }}>Buddy</span></h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <nav style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: '600' }}>
            <span onClick={() => setCurrentTab('dashboard')} style={{ color: currentTab === 'dashboard' ? '#0f172a' : '#64748b', borderBottom: currentTab === 'dashboard' ? '2px solid #0f172a' : 'none', paddingBottom: '2px', cursor: 'pointer' }}>Dashboard</span>
            <span onClick={() => setCurrentTab('mytrips')} style={{ color: currentTab === 'mytrips' ? '#0f172a' : '#64748b', borderBottom: currentTab === 'mytrips' ? '2px solid #0f172a' : 'none', paddingBottom: '2px', cursor: 'pointer' }}>My Trips</span>
            <span onClick={() => setCurrentTab('explore')} style={{ color: currentTab === 'explore' ? '#0f172a' : '#64748b', borderBottom: currentTab === 'explore' ? '2px solid #0f172a' : 'none', paddingBottom: '2px', cursor: 'pointer' }}>Explore</span>
          </nav>

          <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f97316', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>
            <Sparkles size={13} /> + Buat Trip Baru
          </button>

          <div style={{ position: 'relative' }}>
            <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px', borderRadius: '20px', backgroundColor: isProfileOpen ? '#f1f5f9' : 'transparent' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <User size={16} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600' }}>User ∨</span>
            </div>
            {isProfileOpen && (
              <div style={{ position: 'absolute', top: '45px', right: '0', backgroundColor: '#fff', width: '160px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 999, overflow: 'hidden' }}>
                <div onClick={() => { setIsLoggedIn(false); setIsProfileOpen(false); }} style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: '#fef2f2' }}>
                  <LogOut size={14} color="#ef4444" /> <span style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>Keluar (Logout)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* RENDER KONTEN BERDASARKAN TAB AKTIF */}
      {currentTab === 'mytrips' && <MyTripsView hasTrip={hasTrip} tripInfo={tripInfo} setCurrentTab={setCurrentTab} />}
      {currentTab === 'explore' && <ExploreView />}
      
      {currentTab === 'dashboard' && (
        !hasTrip ? (
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '40px', textAlign: 'center', maxWidth: '520px', border: '1px solid #cbd5e1' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#f97316' }}><Compass size={36} /></div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>Belum Ada Rencana Perjalanan</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>Mulai rencanakan liburan impianmu!</p>
              <button onClick={() => setIsModalOpen(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#f97316', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Buat Rencana Sekarang</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr 310px', gap: '12px', padding: '10px 24px 14px 24px', flexGrow: 1, overflow: 'hidden' }}>
            
            {/* KIRI - Info Trip */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              <div style={{ backgroundColor: '#fff', padding: '14px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 10px 0' }}>Ringkasan Perjalanan</h3>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Estimasi Budget:</div>
                <div style={{ fontSize: '16px', fontWeight: '800' }}>Rp {tripInfo.budget}</div>
              </div>
            </div>

            {/* TENGAH - Drag & Drop Itinerary & Tombol Manual */}
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', overflowY: 'auto' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Rencana: {tripInfo.city}</h2>
                <button 
                  onClick={() => setIsPickerOpen(true)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  <Plus size={14} /> Tambah Tempat
                </button>
              </div>

              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="itinerary-list" direction="horizontal">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', minHeight: '100px' }}>
                      
                      {destinations.length === 0 && (
                        <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8', fontSize: '12px', padding: '20px 0', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>
                          Rencana masih kosong. Klik tombol "Tambah Tempat" untuk menyusun Itinerary!
                        </div>
                      )}

                      {destinations.map((place, index) => (
                        <Draggable key={place.id} draggableId={place.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ minWidth: '150px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '8px', ...provided.draggableProps.style }}>
                              <img src={place.image} style={{ width: '100%', height: '60px', borderRadius: '6px', objectFit: 'cover', marginBottom: '6px' }} />
                              <div style={{ fontSize: '11px', fontWeight: '700' }}>{place.name}</div>
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

            {/* KANAN - Leaflet Map */}
            <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Map View</div>
              <div style={{ flexGrow: 1, minHeight: '160px', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer key={currentMapCenter.toString()} center={currentMapCenter} zoom={12} style={{ width: '100%', height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {destinations.map((p, i) => (
                    <Marker key={p.id} position={[p.lat, p.lng]} icon={createNumberIcon(i+1)}>
                      <Popup><b>{p.name}</b></Popup>
                    </Marker>
                  ))}
                  <Polyline positions={routeCoordinates} color="#f97316" weight={3} />
                </MapContainer>
              </div>
            </div>

          </div>
        )
      )}
    </div>
  );
}