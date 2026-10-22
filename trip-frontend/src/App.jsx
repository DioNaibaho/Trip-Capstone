import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Compass, Clock, Share2, User, Sparkles, Download, Plus, Info, 
  GripVertical, CloudSun, Eye, EyeOff, Send, CheckCircle, ArrowLeft, 
  X, Calendar, MapPin, DollarSign, Users, Bot, Settings, LogOut, Heart, Map, Wallet, Building2, Utensils, AlertTriangle, Trash2, Search
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
// FUNGSI HELPER
// ==========================================
const extractNumericPrice = (priceStr) => {
  if (!priceStr) return 0;
  if (typeof priceStr === 'number') return priceStr; 
  if (typeof priceStr === 'string') {
    if (priceStr.toLowerCase().includes('gratis')) return 0;
    const cleanStr = priceStr.replace(/\./g, ''); 
    const numbers = cleanStr.match(/\d+/g); 
    if (!numbers) return 0;
    if (numbers.length === 1) return parseInt(numbers[0], 10); 
    if (numbers.length >= 2) {
      const min = parseInt(numbers[0], 10);
      const max = parseInt(numbers[1], 10);
      return Math.round((min + max) / 2);
    }
  }
  return 0;
};

const getDisplayPriceHelper = (item, tab) => {
  if (tab === 'culinaries') return item.price_range || 'Harga belum tersedia';
  if (tab === 'hotels') return item.price ? `Rp ${Number(item.price).toLocaleString('id-ID')} / malam` : 'Harga belum tersedia';
  return item.price || 'Harga belum tersedia';
};

const formatDateText = (dateStr) => {
  if (!dateStr) return '';
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('id-ID', options);
};

const getDayDate = (startDate, dayIndex) => {
  if (!startDate) return '';
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

// ==========================================
// ERROR BOUNDARY & SKELETON
// ==========================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: "" };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("ErrorBoundary menangkap kegagalan:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', padding: '24px', backgroundColor: '#f8fafc', zIndex: 10000, position: 'fixed', top: 0, left: 0 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px 24px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}><AlertTriangle size={32} /></div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Yah, Ada Sedikit Masalah!</h2>
            <button onClick={() => window.location.reload()} style={{ backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '700', fontSize: '13px', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '20px' }}>Muat Ulang Halaman</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const skeletonStyles = `@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } } .skeleton-item { animation: pulse 1.5s infinite ease-in-out; background-color: #e2e8f0; }`;

function DestinationPickerSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '12px', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '70%' }}>
            <div className="skeleton-item" style={{ height: '14px', width: '80%', borderRadius: '4px' }} />
            <div className="skeleton-item" style={{ height: '12px', width: '50%', borderRadius: '4px' }} />
          </div>
          <div className="skeleton-item" style={{ height: '30px', width: '70px', borderRadius: '8px' }} />
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
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Halo! Saya TripBuddy AI Assistant. Ada yang bisa saya bantu?' }]);
  const [inputText, setInputText] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const userMsg = inputText;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setTimeout(() => setMessages((prev) => [...prev, { sender: 'ai', text: `Rekomendasi AI untuk "${userMsg}": Coba kunjungi daerah Malioboro atau Prawirotaman.` }]), 1000);
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
// MODAL PILIH DESTINASI MANUAL (WITH SEARCH & SORT)
// ==========================================
function DestinationPickerModal({ isOpen, onClose, city, onAdd }) {
  const [activeTab, setActiveTab] = useState('attractions');
  const [data, setData] = useState({ hotels: [], attractions: [], culinaries: [] });
  const [loading, setLoading] = useState(true);

  // STATE BARU: SEARCH & SORT
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    if (isOpen && city) {
      setLoading(true);
      const cityName = city.split(',')[0]; 
      fetch(`/api/destinations/${cityName}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success) setData(resData.data);
          setTimeout(() => setLoading(false), 500);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, city]);

  if (!isOpen) return null;

  const currentList = data[activeTab] || [];

  // LOGIKA FILTER BERDASARKAN SEARCH QUERY
  const filteredList = currentList.filter((item) => {
    const name = (item.name || '').toLowerCase();
    const category = (item.category || item.tourism || item.amenity || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || category.includes(query);
  });

  // LOGIKA SORTING (RATING & HARGA)
  const processedList = [...filteredList].sort((a, b) => {
    if (sortBy === 'rating') {
      const rateA = parseFloat(a.rating || 0);
      const rateB = parseFloat(b.rating || 0);
      return rateB - rateA; // Rating Tertinggi -> Terendah
    }
    if (sortBy === 'price_asc') {
      const priceA = extractNumericPrice(activeTab === 'culinaries' ? a.price_range : a.price);
      const priceB = extractNumericPrice(activeTab === 'culinaries' ? b.price_range : b.price);
      return priceA - priceB; // Termurah -> Termahal
    }
    if (sortBy === 'price_desc') {
      const priceA = extractNumericPrice(activeTab === 'culinaries' ? a.price_range : a.price);
      const priceB = extractNumericPrice(activeTab === 'culinaries' ? b.price_range : b.price);
      return priceB - priceA; // Termahal -> Termurah
    }
    return 0;
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* HEADER MODAL */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Pilih Tempat di {city.split(',')[0]}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* TAB WISATA, HOTEL, KULINER */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px 8px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {['attractions', 'hotels', 'culinaries'].map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(''); }} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '11px', backgroundColor: activeTab === tab ? '#0f172a' : '#e2e8f0', color: activeTab === tab ? '#fff' : '#475569', transition: 'all 0.2s ease' }}>
              {tab === 'attractions' ? 'Wisata' : tab === 'hotels' ? 'Hotel' : 'Kuliner'}
            </button>
          ))}
        </div>

        {/* CONTROLS BARU: SEARCH BAR & DROPDOWN SORTING */}
        <div style={{ display: 'flex', gap: '8px', padding: '10px 20px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Cari nama tempat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
            />
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: '600', color: '#334155', backgroundColor: '#f8fafc', outline: 'none', cursor: 'pointer' }}
          >
            <option value="default">Urutkan: Default</option>
            <option value="rating">Rating Tertinggi ⭐</option>
            <option value="price_asc">Harga Termurah 📉</option>
            <option value="price_desc">Harga Termahal 📈</option>
          </select>
        </div>

        {/* DAFTAR TEMPAT */}
        <div style={{ padding: '16px', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <DestinationPickerSkeleton />
          ) : processedList.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', padding: '24px' }}>
              {searchQuery ? `Tidak ditemukan tempat dengan kata kunci "${searchQuery}"` : 'Tidak ada data tersedia.'}
            </div>
          ) : (
            processedList.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name || 'Nama Lokasi Belum Tersedia'}
                    </h3>
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'} alt={item.name} style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                     onError={(e) => {
                         e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e';
                     }}
                   />
                    {item.rating && (
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#f59e0b', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                        ⭐ {item.rating}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Kategori: {item.category || item.tourism || item.amenity || 'Umum'}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Wallet size={12} /> {getDisplayPriceHelper(item, activeTab)}
                  </span>
                </div>
                <button onClick={() => onAdd(item, activeTab)} style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, boxShadow: '0 2px 8px rgba(249, 115, 22, 0.2)' }}>
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
// KOMPONEN HALAMAN: MY TRIPS 
// ==========================================
function MyTripsView({ savedTrips, onSelectTrip, setIsModalOpen }) {
  return (
    <div style={{ padding: '16px', flexGrow: 1, overflowY: 'auto' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Riwayat Perjalanan Saya</h2>
      {savedTrips.length === 0 ? (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '30px 16px', borderRadius: '16px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>Belum ada trip tersimpan</h3>
          <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Buat Trip Baru</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {savedTrips.map((trip) => (
            <div key={trip.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={trip.image || "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80"} style={{ width: '100%', height: '140px', objectFit: 'cover' }} alt={trip.city} />
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a' }}>Liburan {trip.city}</h3>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px 0' }}>
                  <Calendar size={10} style={{ display: 'inline', marginRight: '4px' }} /> 
                  {formatDateText(trip.startDate)} - {formatDateText(trip.endDate)}
                </p>
                <p style={{ fontSize: '12px', color: '#f97316', fontWeight: 'bold', margin: '0 0 12px 0' }}>
                  {trip.days} Hari • {trip.passengers} Orang
                </p>
                <button onClick={() => onSelectTrip(trip)} style={{ width: '100%', padding: '8px', backgroundColor: '#f97316', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#ffffff' }}>Lihat Detail</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODAL BUAT RENCANA 
// ==========================================
function CreateTripModal({ isOpen, onClose, onSubmit }) {
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getFutureDate = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({ 
    city: 'Bandung, Jawa Barat', 
    startDate: getTodayDate(),
    endDate: getFutureDate(2), 
    days: 3, 
    passengers: 2, 
    budget: '5000000', 
    preferences: ['Alam'] 
  });

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  const handleDateChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    const start = new Date(newFormData.startDate);
    const end = new Date(newFormData.endDate);
    
    if (end >= start) {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      newFormData.days = diffDays;
    } else {
      newFormData.days = 1;
    }
    setFormData(newFormData);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderRadius: '16px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', position: 'sticky', top: 0, zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Buat Rencana Baru</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}><MapPin size={16} color="#f97316" /> Kota Tujuan</label>
            <select style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}>
              <option value="Bandung, Jawa Barat">Bandung, Jawa Barat</option>
              <option value="Yogyakarta, DIY">Yogyakarta, DIY</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
              <Calendar size={16} color="#f97316" /> Tanggal Perjalanan
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Berangkat</span>
                <input type="date" value={formData.startDate} onChange={(e) => handleDateChange('startDate', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '12px', color: '#0f172a' }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Pulang</span>
                <input type="date" min={formData.startDate} value={formData.endDate} onChange={(e) => handleDateChange('endDate', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '12px', color: '#0f172a' }} />
              </div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#0ea5e9', fontWeight: '700', textAlign: 'right' }}>
               Total Durasi: {formData.days} Hari
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
              <Users size={16} color="#f97316" /> Jumlah Peserta
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setFormData({...formData, passengers: Math.max(1, formData.passengers - 1)})} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>-</button>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{formData.passengers} Orang</span>
              <button onClick={() => setFormData({...formData, passengers: Math.min(20, formData.passengers + 1)})} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>+</button>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              *Estimasi tiket wisata & kuliner akan dikalikan sesuai jumlah peserta
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569' }}><Wallet size={16} color="#f97316" /> Estimasi Budget</label>
              <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>{formatRupiah(formData.budget)}</span>
            </div>
            <input type="range" min="0" max="20000000" step="250000" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} style={{ width: '100%', accentColor: '#f97316' }} />
          </div>

        </div>

        <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <button onClick={() => onSubmit(formData)} style={{ width: '100%', backgroundColor: '#f97316', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
            Mulai Rencanakan Manual
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasTrip, setHasTrip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedExploreCity, setSelectedExploreCity] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mapLoading, setMapLoading] = useState(true);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (hasTrip) {
      setMapLoading(true);
      const timer = setTimeout(() => setMapLoading(false), 700);
      return () => clearTimeout(timer);
    }
  }, [hasTrip, currentTab, selectedDay]); // Map reload jika pindah hari
  
  const [savedTrips, setSavedTrips] = useState([]);
  const [tripInfo, setTripInfo] = useState({ id: null, city: '', startDate: '', endDate: '', budget: '0', rawBudget: 0, passengers: 2, days: 3 });
  
  const [destinations, setDestinations] = useState({});

  //  LOAD DATA DARI DATABASE SAAT WEB DIBUKA
  useEffect(() => {
    const fetchSavedTrips = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/trips');
        if (response.data.success) {
          // Masukin data dari database ke state My Trips
          setSavedTrips(response.data.data); 
        }
      } catch (error) {
        console.error('Gagal mengambil history trip dari database:', error);
      }
    };

    // Kita ambil datanya cuma kalau usernya udah berhasil login ya
    if (isLoggedIn) {
      fetchSavedTrips();
    }
  }, [isLoggedIn]);
  
  // ==============================================================
  // 🚀 COPY DARI SINI: LOGIKA SMART BACK BUTTON
  // ==============================================================
  
  // 1. Simpan state terakhir biar gampang dicek sama tombol back
  const appStateRef = useRef({ isModalOpen, isPickerOpen, selectedExploreCity, currentTab });
  useEffect(() => {
    appStateRef.current = { isModalOpen, isPickerOpen, selectedExploreCity, currentTab };
  }, [isModalOpen, isPickerOpen, selectedExploreCity, currentTab]);

  // 2. Bajak tombol back browser/HP
  useEffect(() => {
    // Injeksi 'history' palsu saat web pertama kali diload
    window.history.pushState(null, "", window.location.href);

    const handleBackButton = (e) => {
      const state = appStateRef.current;
      
      // Cek apakah user lagi buka sesuatu yang bisa di-back
      if (state.isModalOpen || state.isPickerOpen || state.selectedExploreCity || state.currentTab !== 'dashboard') {
        
        // TAHAN! Jangan biarkan user keluar dari web
        window.history.pushState(null, "", window.location.href);

        // Eksekusi aksi back sesuai urutan hierarki
        if (state.isPickerOpen) {
          setIsPickerOpen(false); // Tutup modal pilih tempat dulu
        } else if (state.isModalOpen) {
          setIsModalOpen(false);  // Tutup modal buat trip
        } else if (state.selectedExploreCity) {
          setSelectedExploreCity(''); // Balik ke katalog kota Explore
        } else if (state.currentTab !== 'dashboard') {
          setCurrentTab('dashboard'); // Balik ke menu Dashboard utama
        }
        
      } else {
        // Kalau user udah di Dashboard bersih tanpa modal, biarkan keluar web
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, []);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    
    const dayItems = Array.from(destinations[selectedDay] || []);
    const [reorderedItem] = dayItems.splice(result.source.index, 1);
    dayItems.splice(result.destination.index, 0, reorderedItem);
    
    const updatedDestinations = { ...destinations, [selectedDay]: dayItems };
    setDestinations(updatedDestinations);
    setSavedTrips(prev => prev.map(t => t.id === tripInfo.id ? { ...t, destinations: updatedDestinations } : t));
  };

  const handleCreateTripSubmit = (data) => {
    const newTrip = {
      id: Date.now().toString(),
      city: data.city,
      startDate: data.startDate, 
      endDate: data.endDate,     
      budget: new Intl.NumberFormat('id-ID').format(data.budget), 
      rawBudget: parseInt(data.budget, 10), 
      passengers: data.passengers, 
      days: data.days,
      destinations: {}, 
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80'
    };
    setSavedTrips([newTrip, ...savedTrips]);
    setTripInfo(newTrip);
    setDestinations({});
    setSelectedDay(1); 
    setHasTrip(true);
    setIsModalOpen(false);
    setCurrentTab('dashboard');
  };

  const handleSelectTripFromHistory = (selectedTrip) => {
    setTripInfo(selectedTrip);
    setDestinations(selectedTrip.destinations || {});
    setSelectedDay(1);
    setHasTrip(true);
    setCurrentTab('dashboard');
  };

  const handleAddDestination = (item, tabType) => {
    const rawPrice = tabType === 'culinaries' ? item.price_range : item.price;
    const newItem = {
      id: Date.now().toString(),
      name: item.name,
      category: tabType === 'hotels' ? 'Akomodasi' : tabType === 'culinaries' ? 'Kuliner' : 'Wisata',
      lat: parseFloat(item.latitude),
      lng: parseFloat(item.longitude),
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80',
      numericPrice: extractNumericPrice(rawPrice),
      displayPriceText: getDisplayPriceHelper(item, tabType),
      nights: 1,
      isClone: false 
    };
    
    const currentDayList = destinations[selectedDay] || [];
    const updatedDestinations = {
      ...destinations,
      [selectedDay]: [...currentDayList, newItem]
    };

    setDestinations(updatedDestinations);
    setSavedTrips(prev => prev.map(t => t.id === tripInfo.id ? { ...t, destinations: updatedDestinations } : t));
    setIsPickerOpen(false); 
  };

  // LOGIKA PINTAR PENGATUR JUMLAH MALAM HOTEL (AUTO-CLONE)
  const handleUpdateNights = (idToUpdate, delta) => {
    // 1. Cari Original Hotel nya ada di hari apa
    let originalHotel = null;
    let originalDay = null;

    for (let d = 1; d <= tripInfo.days; d++) {
      const found = (destinations[d] || []).find(item => item.id === idToUpdate && !item.isClone);
      if (found) {
        originalHotel = found;
        originalDay = d;
        break;
      }
    }

    if (!originalHotel) return;

    // Hitung malam baru (jangan sampai ngelebihin sisa hari trip)
    const currentNights = originalHotel.nights || 1;
    const newNights = Math.max(1, Math.min(tripInfo.days - originalDay + 1, currentNights + delta));

    if (newNights === currentNights) return; // Kalo mentok, gausah ngapa-ngapain

    let newDestinations = { ...destinations };

    // 2. Update nights di item aslinya
    newDestinations[originalDay] = newDestinations[originalDay].map(item => 
      item.id === idToUpdate ? { ...item, nights: newNights } : item
    );

    // 3. Inject "Clone Hotel" ke hari-hari berikutnya sesuai durasi malam
    for (let d = originalDay + 1; d <= tripInfo.days; d++) {
      let dayItems = newDestinations[d] || [];
      
      if (d < originalDay + newNights) {
        // Harus ada clone di hari ini
        const hasClone = dayItems.some(item => item.originalId === idToUpdate);
        if (!hasClone) {
          const clone = { 
            ...originalHotel, 
            id: `${idToUpdate}-clone-${d}`, 
            isClone: true, 
            originalId: idToUpdate,
            numericPrice: 0, // Dikosongin biar budget ga dobel
            nights: 1 
          };
          // Masukin clone di paling atas hari tersebut
          dayItems = [clone, ...dayItems];
        }
      } else {
        // Harus dihapus dari hari ini (kalau user mengurangi durasi malam)
        dayItems = dayItems.filter(item => item.originalId !== idToUpdate);
      }
      newDestinations[d] = dayItems;
    }

    setDestinations(newDestinations);
    setSavedTrips(prev => prev.map(t => t.id === tripInfo.id ? { ...t, destinations: newDestinations } : t));
  };

  // LOGIKA HAPUS YANG BISA BEDAIN MANA ORI DAN MANA CLONE
  const handleRemoveDestination = (idToRemove) => {
    let newDestinations = { ...destinations };
    
    // Cari tau ini item asli atau cuma clone bayangan
    let itemToRemove = null;
    for (let d = 1; d <= tripInfo.days; d++) {
      const found = (newDestinations[d] || []).find(item => item.id === idToRemove);
      if (found) { itemToRemove = found; break; }
    }

    if (itemToRemove?.isClone) {
      // Kalo user hapus clone-nya, kita kurangi malam di hotel aslinya
      handleUpdateNights(itemToRemove.originalId, -1);
      return;
    } else if (itemToRemove?.category === 'Akomodasi') {
      // Kalo hotel asli dihapus, semua clone di hari berikutnya juga wajib hangus
      for (let d = 1; d <= tripInfo.days; d++) {
        newDestinations[d] = (newDestinations[d] || []).filter(item => item.id !== idToRemove && item.originalId !== idToRemove);
      }
    } else {
      // Hapus wisata/kuliner biasa
      newDestinations[selectedDay] = (newDestinations[selectedDay] || []).filter(item => item.id !== idToRemove);
    }
    
    setDestinations(newDestinations);
    setSavedTrips(prev => prev.map(t => t.id === tripInfo.id ? { ...t, destinations: newDestinations } : t));
  };

 const handleSaveTrip = async () => {
    // Validasi: Jangan kasih save kalau jadwalnya masih kosong melompong
    const isDestinationsEmpty = Object.keys(destinations).length === 0;
    if (isDestinationsEmpty) {
      alert('Isi minimal 1 tempat dulu dong di jadwalnya sebelum disimpan! 😅');
      return;
    }

    // Bungkus semua data trip yang lagi aktif
    const tripToSave = {
      ...tripInfo, 
      id: tripInfo.id || Date.now(), 
      destinations: destinations, /* 🚨 FIX-NYA DI SINI: Kemarin 'itinerary', sekarang ganti jadi 'destinations' biar sinkron pas diload ulang */
      savedAt: new Date().toISOString() 
    };

    await axios.post('http://localhost:5000/api/trips', tripToSave);
    
    setSavedTrips((prevTrips) => {
      const existingIndex = prevTrips.findIndex(t => t.id === tripToSave.id);
      if (existingIndex >= 0) {
        const updatedTrips = [...prevTrips];
        updatedTrips[existingIndex] = tripToSave;
        return updatedTrips;
      }
      return [tripToSave, ...prevTrips];
    });

    alert('Mantap! Rencana perjalananmu berhasil disimpan. 🚀');
    
    // Otomatis pindah ke tab My Trips
    setCurrentTab('mytrips'); 
  };
  // Kalkulasi Semua Hari Buat Budget
  let allDestinations = [];
  if (tripInfo.days) {
    for (let i = 1; i <= tripInfo.days; i++) {
      if (destinations[i]) allDestinations.push(...destinations[i]);
    }
  }

  const numPassengers = parseInt(tripInfo.passengers, 10) || 1;
  const totalPengeluaran = allDestinations.reduce((sum, dest) => {
    if (dest.category === 'Akomodasi') {
      return sum + (dest.numericPrice * (dest.nights || 1)); 
    } else {
      // Ingat: Item clone punya numericPrice = 0 jadi ga bakal rusak perhitungan ini
      return sum + (dest.numericPrice * numPassengers);      
    }
  }, 0);

  const persentaseBudget = tripInfo.rawBudget > 0 ? Math.min((totalPengeluaran / tripInfo.rawBudget) * 100, 100) : 0;
  const isOverBudget = totalPengeluaran > tripInfo.rawBudget;

  // ROUTING MAP: HANYA MENGAMBIL RUTE UNTUK HARI YANG DIPILIH AJA!
  const currentDayDestinations = destinations[selectedDay] || [];
  const routeCoordinates = currentDayDestinations.map(item => [item.lat, item.lng]);
  
  // Nentuin titik tengah map biar ga nyasar
  let currentMapCenter = [-6.9175, 107.6191]; // Default Bandung
  if (tripInfo.city.toLowerCase().includes('yogyakarta')) currentMapCenter = [-7.7956, 110.3695];
  
  if (currentDayDestinations.length > 0) {
    currentMapCenter = [currentDayDestinations[0].lat, currentDayDestinations[0].lng];
  } else if (allDestinations.length > 0) {
    // Kalau hari ini kosong, sorot lokasi pertama yang ada di trip ini
    currentMapCenter = [allDestinations[0].lat, allDestinations[0].lng];
  }

  if (!isLoggedIn) return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;

  return (
    <ErrorBoundary>
      <style>{skeletonStyles}</style>

      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", color: '#1e293b', position: 'relative' }}>
        
        {/* BACKGROUND IMAGE BLUR */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.55)), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(8px)', transform: 'scale(1.08)', zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
          
          <AIChatbotWidget />
          <CreateTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateTripSubmit} />
          <DestinationPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} city={tripInfo.city} onAdd={handleAddDestination} />

          {/* TOP NAVBAR */}
          <header style={{ 
            position: 'relative', /* TAMBAHAN BARU */
            zIndex: 9999,         /* TAMBAHAN BARU: Biar dropdown ga ketimpa peta */
            backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(12px)', 
            padding: isMobile ? '8px 12px' : '8px 24px', height: isMobile ? 'auto' : '52px', minHeight: '52px',
            display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between', 
            gap: isMobile ? '8px' : '0px', borderBottom: '1px solid rgba(255, 255, 255, 0.5)', flexShrink: 0 
          }}>
          
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: isMobile ? '100%' : 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '5px', borderRadius: '50%', display: 'flex', color: '#f97316' }}><Compass size={18} /></div>
                <h1 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f172a', lineHeight: 1 }}>Trip<span style={{ color: '#f97316' }}>Buddy</span></h1>
              </div>
              {isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f97316', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '16px', fontWeight: '700', fontSize: '10px', cursor: 'pointer' }}><Sparkles size={11} /> + Trip</button>
                  <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}><User size={14} /></div>
                </div>
              )}
            </div>

            <nav style={{ display: 'flex', gap: isMobile ? '12px' : '16px', fontSize: isMobile ? '11px' : '13px', fontWeight: '600' }}>
              <span onClick={() => setCurrentTab('dashboard')} style={{ color: currentTab === 'dashboard' ? '#0f172a' : '#475569', borderBottom: currentTab === 'dashboard' ? '2px solid #0f172a' : 'none', paddingBottom: '2px', cursor: 'pointer' }}>Dashboard</span>
              <span onClick={() => setCurrentTab('mytrips')} style={{ color: currentTab === 'mytrips' ? '#0f172a' : '#475569', borderBottom: currentTab === 'mytrips' ? '2px solid #0f172a' : 'none', paddingBottom: '2px', cursor: 'pointer' }}>My Trips ({savedTrips.length})</span>
              <span onClick={() => setCurrentTab('explore')} style={{ color: currentTab === 'explore' ? '#0f172a' : '#475569', borderBottom: currentTab === 'explore' ? '2px solid #0f172a' : 'none', paddingBottom: '2px', cursor: 'pointer' }}>Explore</span>
            </nav>

            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f97316', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}><Sparkles size={13} /> + Buat Trip Baru</button>
                <div style={{ position: 'relative' }}>
                  <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px', borderRadius: '20px', backgroundColor: isProfileOpen ? 'rgba(255,255,255,0.8)' : 'transparent' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><User size={16} /></div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>User ∨</span>
                  </div>
                </div>
              </div>
            )}
            {isProfileOpen && (
              <div style={{ position: 'absolute', top: isMobile ? '80px' : '45px', right: '16px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', width: '160px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.6)', zIndex: 999 }}>
                <div onClick={() => { setIsLoggedIn(false); setIsProfileOpen(false); }} style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: '#fef2f2' }}><LogOut size={14} color="#ef4444" /> <span style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>Keluar (Logout)</span></div>
              </div>
            )}
          </header>

          {/* RENDER KONTEN TAB */}
          {currentTab === 'mytrips' && <MyTripsView savedTrips={savedTrips} onSelectTrip={handleSelectTripFromHistory} setIsModalOpen={setIsModalOpen} />}
          {currentTab === 'explore' && (
  /* PEMBUNGKUS UTAMA YANG MEMUNGKINKAN SCROLLING AKTIF (FLEX + OVERFLOW) */
  <div style={{ flexGrow: 1, overflowY: 'auto', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', WebkitOverflowScrolling: 'touch' }}>
    
    {!selectedExploreCity && !hasTrip ? (
      /* ==========================================
         HALAMAN PILIHAN KOTA (KATALOG) - SCROLLABLE
         ========================================== */
      <div style={{ padding: isMobile ? '16px' : '24px 24px 80px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '800', color: '#ffffff', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          Pilih Kota yang Ingin Dieksplor 🗺️
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          
          {/* CARD BANDUNG */}
          <div 
            onClick={() => setSelectedExploreCity('Bandung')}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid rgba(255, 255, 255, 0.5)', transform: 'scale(1)', transition: 'transform 0.2s' }}
          >
            <img src="https://images.unsplash.com/photo-1613057263089-7a8c82f2825d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D?auto=format&fit=crop&w=600&q=80" style={{ width: '100%', height: '140px', objectFit: 'cover' }} alt="Bandung" />
            <div style={{ padding: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Bandung</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Jawa Barat • 1,400+ Destinasi</p>
            </div>
          </div>

          {/* CARD YOGYAKARTA */}
          <div 
            onClick={() => setSelectedExploreCity('Yogyakarta')}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid rgba(255, 255, 255, 0.5)' }}
          >
            <img src="https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80" style={{ width: '100%', height: '140px', objectFit: 'cover' }} alt="Yogyakarta" />
            <div style={{ padding: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Yogyakarta</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', fontWeight: '600' }}>D.I. Yogyakarta • 900+ Destinasi</p>
            </div>
          </div>

        </div>
      </div>
    ) : (
      /* ==========================================
         HALAMAN DETAIL KOTA - SCROLLABLE (KULINER, HOTEL, WISATA)
         ========================================== */
      <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', paddingBottom: '80px', WebkitOverflowScrolling: 'touch' }}>
        <CityDetail 
          cityName={selectedExploreCity || tripInfo.city.split(',')[0] || 'Bandung'} 
          onBack={() => {
            // Kalau dia nggak punya trip, balik ke pilihan katalog kota
            if (!hasTrip) {
              setSelectedExploreCity('');
            } else {
              // Kalau dia punya trip, balik ke Dashboard
              setSelectedExploreCity('');
              setCurrentTab('dashboard');
            }
          }} 
          onAddPlace={handleAddDestination} 
          hasTrip={hasTrip} 
        />
      </div>
    )}

  </div>
)}
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
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr 310px', gap: '10px', padding: isMobile ? '10px 12px' : '10px 24px 14px 24px', flexGrow: 1, overflowY: isMobile ? 'auto' : 'hidden' }}>
                
                {/* KOLOM KIRI - INFO & PROGRESS BAR BUDGET */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(12px)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 12px 0', color: '#0f172a' }}>Ringkasan Anggaran</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                      <span>Terpakai</span>
                      <span>Batas Budget</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: isOverBudget ? '#ef4444' : '#0f172a' }}>
                        Rp {totalPengeluaran.toLocaleString('id-ID')}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>
                        Rp {tripInfo.budget}
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${persentaseBudget}%`, backgroundColor: isOverBudget ? '#ef4444' : (persentaseBudget > 80 ? '#f59e0b' : '#10b981'), transition: 'width 0.5s ease-in-out, background-color 0.5s' }} />
                    </div>
                    
                    {isOverBudget && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '10px', marginTop: '10px', fontWeight: '700', backgroundColor: '#fef2f2', padding: '6px 8px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                        <AlertTriangle size={12} /> Anggaran melebihi batas estimasi!
                      </div>
                    )}
                  </div>
                </div>

                {/* KOLOM TENGAH - DRAG & DROP ITINERARY */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(12px)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* HEADER ITINERARY & TOMBOL */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                      Rencana: {tripInfo.city} <br/>
                      <span style={{ color: '#f97316', fontSize: '11px', fontWeight: '700' }}>
                        ({formatDateText(tripInfo.startDate)} - {formatDateText(tripInfo.endDate)} | {tripInfo.passengers} Peserta)
                      </span>
                    </h2>
                    
                    {/* BUNGKUSAN TOMBOL TAMBAH & SIMPAN */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => setIsPickerOpen(true)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        <Plus size={12} /> Tambah
                      </button>

                      <button 
                        onClick={handleSaveTrip} 
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
                      >
                        <CheckCircle size={12} /> Simpan
                      </button>
                    </div>
                  </div>

                  {/* NAVIGASI TAB HARI */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                    {Array.from({ length: tripInfo.days }).map((_, i) => {
                      const dayNum = i + 1;
                      const isActive = selectedDay === dayNum;
                      const dateStr = getDayDate(tripInfo.startDate, i);
                      return (
                        <button 
                          key={dayNum}
                          onClick={() => setSelectedDay(dayNum)}
                          style={{
                            padding: '6px 14px', borderRadius: '20px', border: isActive ? 'none' : '1px solid #cbd5e1',
                            backgroundColor: isActive ? '#f97316' : '#f8fafc', color: isActive ? '#fff' : '#475569',
                            fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
                            boxShadow: isActive ? '0 4px 10px rgba(249, 115, 22, 0.2)' : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Hari {dayNum} <span style={{fontWeight: '500', opacity: 0.9}}>({dateStr})</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* KONTEN DRAG & DROP KHUSUS UNTUK HARI YANG DIPILIH */}
                  <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId={`itinerary-list-day-${selectedDay}`} direction="horizontal">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px', minHeight: '120px', flexGrow: 1 }}>
                          {(!destinations[selectedDay] || destinations[selectedDay].length === 0) && (
                            <div style={{ width: '100%', textAlign: 'center', color: '#64748b', fontSize: '11px', padding: '24px 0', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <Calendar size={24} style={{marginBottom: '8px', opacity: 0.5}} />
                              Jadwal Hari {selectedDay} kosong.<br/>Tambahkan destinasi sekarang!
                            </div>
                          )}
                          {(destinations[selectedDay] || []).map((place, index) => (
                            <Draggable key={place.id} draggableId={place.id} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ minWidth: '160px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'relative', display: 'flex', flexDirection: 'column', ...provided.draggableProps.style }}>
                                  
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveDestination(place.id); }} 
                                    style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: '#ef4444', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="Hapus Tempat"
                                  >
                                    <X size={14} />
                                  </button>

                                  <img src={place.image} style={{ width: '100%', height: '60px', borderRadius: '6px', objectFit: 'cover', marginBottom: '6px' }} />
                                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '16px' }}>{place.name}</div>
                                  
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', flexGrow: 1 }}>
                                    <div style={{ fontSize: '9px', color: '#64748b' }}>{place.category}</div>
                                    
                                    {/* LOGIKA TAMPILAN HARGA */}
                                    {place.isClone ? (
                                      <div style={{ fontSize: '9px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                        <CheckCircle size={10}/> Termasuk di Hari Sebelumnya
                                      </div>
                                    ) : place.numericPrice === 0 ? (
                                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Wallet size={10}/> Gratis
                                      </div>
                                    ) : place.category === 'Akomodasi' ? (
                                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Wallet size={10}/> Rp {((place.numericPrice * (place.nights || 1)) / 1000).toLocaleString('id-ID')}k
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '10px', fontWeight: '800', color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Wallet size={10}/> Rp {((place.numericPrice * numPassengers) / 1000).toLocaleString('id-ID')}k 
                                        <span style={{fontSize: '8px', color: '#94a3b8', fontWeight: '600'}}>(x{numPassengers} org)</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* TOMBOL PENGATUR MALAM HANYA MUNCUL DI HOTEL ASLI (BUKAN CLONE) */}
                                  {place.category === 'Akomodasi' && !place.isClone && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', backgroundColor: '#f1f5f9', padding: '4px 6px', borderRadius: '6px' }}>
                                      <span style={{fontSize: '9px', fontWeight: '700', color: '#475569'}}>Durasi:</span>
                                      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateNights(place.id, -1); }} style={{border: 'none', background: '#e2e8f0', borderRadius: '4px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'}}>-</button>
                                        <span style={{fontSize: '10px', fontWeight: '800', color: '#0f172a'}}>{place.nights || 1} mlm</span>
                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateNights(place.id, 1); }} style={{border: 'none', background: '#e2e8f0', borderRadius: '4px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'}}>+</button>
                                      </div>
                                    </div>
                                  )}

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

                {/* KOLOM KANAN - PETA (UPDATE HANYA NAMPILIN HARI INI) */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(12px)', padding: '10px', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#0f172a' }}>
                    Map View <span style={{ color: '#f97316' }}>(Hari {selectedDay})</span>
                  </div>
                  <div style={{ flexGrow: 1, minHeight: isMobile ? '280px' : '160px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    {mapLoading ? (
                      <div className="skeleton-item" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}><span style={{ color: '#475569', fontSize: '11px', fontWeight: '700' }}>Menyiapkan Peta...</span></div>
                    ) : (
                      <MapContainer key={`map-day-${selectedDay}`} center={currentMapCenter} zoom={12} style={{ width: '100%', height: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {currentDayDestinations.map((p, i) => (
                          <Marker key={p.id} position={[p.lat, p.lng]} icon={createNumberIcon(i+1)}><Popup><b>{p.name}</b></Popup></Marker>
                        ))}
                        <Polyline positions={routeCoordinates} color="#f97316" weight={3} />
                      </MapContainer>
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