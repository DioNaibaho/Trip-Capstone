import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Compass, Clock, Share2, User, Sparkles, Download, Plus, Info, 
  GripVertical, CloudSun, Eye, EyeOff, Send, CheckCircle, ArrowLeft, 
  X, Calendar, MapPin, DollarSign, Users, Bot, Settings, LogOut, Heart, Map, Wallet, Building2, Utensils, AlertTriangle, Trash2, Search, MoreHorizontal, Navigation, Lock, ArrowRight, SlidersHorizontal
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
    html: `<div style="background-color: #0f172a; color: white; font-weight: 800; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 12px;">${number}</div>`,
    className: '', iconSize: [28, 28], iconAnchor: [14, 14]
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
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
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
// MODAL PILIH DESTINASI MANUAL
// ==========================================
function DestinationPickerModal({ isOpen, onClose, city, onAdd }) {
  const [activeTab, setActiveTab] = useState('attractions');
  const [data, setData] = useState({ hotels: [], attractions: [], culinaries: [] });
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    if (isOpen && city) {
      setLoading(true);
      const cityName = city?.split(',')[0] || 'Bandung';
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

  const filteredList = currentList.filter((item) => {
    const name = (item.name || '').toLowerCase();
    const category = (item.category || item.tourism || item.amenity || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || category.includes(query);
  });

  const processedList = [...filteredList].sort((a, b) => {
    if (sortBy === 'rating') {
      const rateA = parseFloat(a.rating || 0);
      const rateB = parseFloat(b.rating || 0);
      return rateB - rateA;
    }
    if (sortBy === 'price_asc') {
      const priceA = extractNumericPrice(activeTab === 'culinaries' ? a.price_range : a.price);
      const priceB = extractNumericPrice(activeTab === 'culinaries' ? b.price_range : b.price);
      return priceA - priceB;
    }
    if (sortBy === 'price_desc') {
      const priceA = extractNumericPrice(activeTab === 'culinaries' ? a.price_range : a.price);
      const priceB = extractNumericPrice(activeTab === 'culinaries' ? b.price_range : b.price);
      return priceB - priceA;
    }
    return 0;
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Pilih Tempat di {city.split(',')[0]}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px 8px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {['attractions', 'hotels', 'culinaries'].map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(''); }} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '11px', backgroundColor: activeTab === tab ? '#0f172a' : '#e2e8f0', color: activeTab === tab ? '#fff' : '#475569', transition: 'all 0.2s ease' }}>
              {tab === 'attractions' ? 'Wisata' : tab === 'hotels' ? 'Hotel' : 'Kuliner'}
            </button>
          ))}
        </div>

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
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                     onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'; }}
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
                <button onClick={() => onAdd(item, activeTab)} style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
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
// MODAL BUAT RENCANA 
// ==========================================
function CreateTripModal({ isOpen, onClose, onSubmit, onAIGenerate, isGeneratingAI }) {
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
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#475569' }}><Wallet size={16} color="#f97316" /> Estimasi Budget</label>
              <span style={{ backgroundColor: '#ffedd5', color: '#c2410c', padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>{formatRupiah(formData.budget)}</span>
            </div>
            <input type="range" min="0" max="20000000" step="250000" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} style={{ width: '100%', accentColor: '#f97316' }} />
          </div>

        </div>

        <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => onSubmit(formData)} style={{ width: '100%', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
            Mulai Rencanakan Manual
          </button>
          
          <button 
            onClick={() => onAIGenerate(formData)} 
            disabled={isGeneratingAI}
            style={{ 
              width: '100%', backgroundColor: '#f97316', color: '#ffffff', fontWeight: 'bold', 
              fontSize: '14px', padding: '12px', borderRadius: '10px', border: 'none', 
              cursor: isGeneratingAI ? 'not-allowed' : 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isGeneratingAI ? 0.7 : 1
            }}
          >
            {isGeneratingAI ? 'AI Sedang Memproses...' : <><Sparkles size={16} /> Generate Itinerary dengan AI</>}
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

  // STATE USER DINAMIS DARI LOCALSTORAGE
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [userName, setUserName] = useState('Traveler');

  useEffect(() => {
    if (currentUser) {
      const rawName = currentUser.name || currentUser.full_name || currentUser.username || currentUser.nama;
      if (rawName) {
        setUserName(rawName.split(' ')[0]);
      } else {
        setUserName('Traveler');
      }
    } else {
      setUserName('Traveler');
    }
  }, [currentUser]);

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasTrip, setHasTrip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedExploreCity, setSelectedExploreCity] = useState('');
  const [exploreSearchQuery, setExploreSearchQuery] = useState('');
  const [exploreSortBy, setExploreSortBy] = useState('default');
  const [selectedDay, setSelectedDay] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mapLoading, setMapLoading] = useState(true);

  const [selectedTripDetail, setSelectedTripDetail] = useState(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [myTripsFilter, setMyTripsFilter] = useState('upcoming');
  const getCityImage = (cityName) => {
    const city = (cityName || '').toLowerCase();
    if (city.includes('bandung')) return 'https://images.unsplash.com/photo-1613057263089-7a8c82f2825d?q=80&w=600&auto=format&fit=crop';
    if (city.includes('yogyakarta') || city.includes('jogja')) return 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80';
    if (city.includes('bali')) return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80';
    if (city.includes('jakarta')) return 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=600&q=80';
    if (city.includes('lombok')) return 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=600&q=80';
    if (city.includes('malang') || city.includes('bromo')) return 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80';
    return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=600&q=80'; // Default random trip image
  };
  const handleDeleteTrip = async (e, tripId) => {
    e.stopPropagation(); // Mencegah klik card ke-trigger saat klik tombol hapus
    if (!window.confirm('Yakin mau hapus rencana perjalanan ini?')) return;
    
    try {
      // Panggil API Backend lo buat ngehapus data di DB
      await axios.delete(`http://localhost:5000/api/trips/${tripId}`);
      
      // Update UI (hapus dari list)
      setSavedTrips(prev => prev.filter(t => t.id !== tripId));
      
      // Kalau yang dihapus adalah trip yang lagi dibuka, reset workspace-nya
      if (selectedTripDetail?.id === tripId) {
        setSelectedTripDetail(null);
        setTripInfo({ id: null, city: '', startDate: '', endDate: '', budget: '0', rawBudget: 0, passengers: 2, days: 3 });
        setDestinations({});
      }
    } catch (error) {
      console.error('Gagal menghapus trip:', error);
      alert('Gagal menghapus itinerary. Cek koneksi backend.');
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [savedTrips, setSavedTrips] = useState([]);
  const [tripInfo, setTripInfo] = useState({ id: null, city: '', startDate: '', endDate: '', budget: '0', rawBudget: 0, passengers: 2, days: 3 });
  const [destinations, setDestinations] = useState({});

  // LOAD DATA TRIP BERDASARKAN ID USER AKTIF
  useEffect(() => {
    const fetchUserTrips = async () => {
      if (!currentUser?.id) {
        setSavedTrips([]);
        setHasTrip(false);
        setSelectedTripDetail(null);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/trips/user/${currentUser.id}`);
        
        if (response.data.success && response.data.data.length > 0) {
          const formattedData = response.data.data.map(t => ({
            id: t.id,
            city: t.trip_name,
            startDate: t.start_date,
            endDate: t.end_date,
            destinations: t.itinerary_data,
            image: getCityImage(t.trip_name),
            ...t
          }));
          setSavedTrips(formattedData); 
          if (!selectedTripDetail) {
            setSelectedTripDetail(formattedData[0]);
            setTripInfo(formattedData[0]);
            setDestinations(formattedData[0].destinations || {});
          }
        } else {
          setSavedTrips([]);
          setSelectedTripDetail(null);
        }
      } catch (error) {
        console.error('Gagal mengambil history trip:', error);
        setSavedTrips([]);
        setSelectedTripDetail(null);
      }
    };

    if (isLoggedIn) {
      fetchUserTrips();
    }
  }, [isLoggedIn, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    setUserName('Traveler');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    setSavedTrips([]);
    setHasTrip(false);
    setTripInfo({ id: null, city: '', startDate: '', endDate: '', budget: '0', rawBudget: 0, passengers: 2, days: 3 });
    setDestinations({});
    setSelectedTripDetail(null);
    setCurrentTab('dashboard');
  };

  // LOGIKA SMART BACK BUTTON
  const appStateRef = useRef({ isModalOpen, isPickerOpen, selectedExploreCity, currentTab, selectedTripDetail });
  useEffect(() => {
    appStateRef.current = { isModalOpen, isPickerOpen, selectedExploreCity, currentTab, selectedTripDetail };
  }, [isModalOpen, isPickerOpen, selectedExploreCity, currentTab, selectedTripDetail]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handleBackButton = () => {
      const state = appStateRef.current;
      if (state.isModalOpen || state.isPickerOpen || state.selectedExploreCity || state.currentTab !== 'dashboard') {
        window.history.pushState(null, "", window.location.href);

        if (state.isPickerOpen) {
          setIsPickerOpen(false);
        } else if (state.isModalOpen) {
          setIsModalOpen(false);
        } else if (state.selectedExploreCity) {
          setSelectedExploreCity('');
        } else if (state.currentTab !== 'dashboard') {
          setCurrentTab('dashboard');
        }
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
    if (selectedTripDetail) {
      setSelectedTripDetail(prev => ({ ...prev, destinations: updatedDestinations }));
    }
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
      image: getCityImage(data.city)
    };
    setSavedTrips([newTrip, ...savedTrips]);
    setTripInfo(newTrip);
    setDestinations({});
    setSelectedDay(1); 
    setHasTrip(true);
    setSelectedTripDetail(newTrip);
    setIsModalOpen(false);
    setCurrentTab('mytrips');
    setIsEditingMode(true);
  };

  const handleSelectTripFromHistory = (selectedTrip) => {
    setTripInfo(selectedTrip);
    setDestinations(selectedTrip.destinations || {});
    setSelectedDay(1);
    setHasTrip(true);
    setSelectedTripDetail(selectedTrip);
    setIsEditingMode(false);
  };

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleAIGenerateTrip = async (data) => {
    setIsGeneratingAI(true);
    try {
      const cityName = data.city.split(',')[0];
      const destRes = await axios.get(`http://localhost:5000/api/destinations/${cityName}`);
      const places = destRes.data.data.attractions || [];

      const formattedLocations = places.map(p => ({
        id: p.id,
        name: p.name,
        lat: parseFloat(p.latitude),
        lng: parseFloat(p.longitude),
        duration: 120
      }));

      const matrixSize = formattedLocations.length;
      const dummyMatrix = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(15));

      const response = await axios.post('http://localhost:5000/api/optimize-route', {
        start_point: formattedLocations[0]?.id || 1,
        start_time: "08:00",
        locations: formattedLocations,
        time_matrix: dummyMatrix
      });

      const aiDestinations = response.data.data.itinerary;
      
      const newTrip = {
        id: Date.now().toString(),
        city: data.city,
        startDate: data.startDate, 
        endDate: data.endDate,     
        budget: new Intl.NumberFormat('id-ID').format(data.budget), 
        rawBudget: parseInt(data.budget, 10), 
        passengers: data.passengers, 
        days: data.days,
        destinations: aiDestinations, 
        image: getCityImage(data.city)
      };

      setSavedTrips([newTrip, ...savedTrips]);
      setTripInfo(newTrip);
      setDestinations(aiDestinations);
      setSelectedDay(1); 
      setHasTrip(true);
      setSelectedTripDetail(newTrip);
      setIsModalOpen(false);
      setCurrentTab('mytrips');
      setIsEditingMode(true);
      alert('✨ Rute AI berhasil di-generate!');

    } catch (error) {
      console.error('Gagal generate AI:', error);
      alert(`Gagal terhubung: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddDestination = (item, tabType) => {
    const rawPrice = tabType === 'culinaries' ? item.price_range : item.price;
    const timeSlots = ["08:30", "11:00", "14:30", "18:00", "20:00"];
    const currentDayList = destinations[selectedDay] || [];
    const timeAssigned = timeSlots[currentDayList.length % timeSlots.length];

    const newItem = {
      id: Date.now().toString(),
      name: item.name,
      category: tabType === 'hotels' ? 'HOTEL' : tabType === 'culinaries' ? 'CULINARY' : 'CULTURE',
      lat: parseFloat(item.latitude),
      lng: parseFloat(item.longitude),
      image: item.image_url || 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=300&q=80',
      numericPrice: extractNumericPrice(rawPrice),
      displayPriceText: getDisplayPriceHelper(item, tabType),
      time: timeAssigned,
      address: item.address || item.tourism || 'Lokasi Wisata Populer',
      nights: 1,
      isClone: false 
    };
    
    const updatedDestinations = {
      ...destinations,
      [selectedDay]: [...currentDayList, newItem]
    };

    setDestinations(updatedDestinations);
    setSavedTrips(prev => prev.map(t => t.id === tripInfo.id ? { ...t, destinations: updatedDestinations } : t));
    if (selectedTripDetail) {
      setSelectedTripDetail(prev => ({ ...prev, destinations: updatedDestinations }));
    }
    setIsPickerOpen(false); 
  };

  const handleRemoveDestination = (idToRemove) => {
    let newDestinations = { ...destinations };
    newDestinations[selectedDay] = (newDestinations[selectedDay] || []).filter(item => item.id !== idToRemove);
    
    setDestinations(newDestinations);
    setSavedTrips(prev => prev.map(t => t.id === tripInfo.id ? { ...t, destinations: newDestinations } : t));
    if (selectedTripDetail) {
      setSelectedTripDetail(prev => ({ ...prev, destinations: newDestinations }));
    }
  };

  const handleSaveTrip = async () => {
    const isDestinationsEmpty = Object.keys(destinations).length === 0;
    if (isDestinationsEmpty) {
      alert('Isi minimal 1 tempat dulu di jadwalnya sebelum disimpan! 😅');
      return;
    }

    const currentUserId = currentUser?.id || 1;

    const tripToSave = {
      user_id: currentUserId,
      trip_name: tripInfo.city.startsWith('Liburan') ? tripInfo.city : `Liburan ke ${tripInfo.city}`,
      start_date: tripInfo.startDate,
      end_date: tripInfo.endDate,
      itinerary_data: destinations, 
      
      id: tripInfo.id || Date.now(),
      budget: tripInfo.budget,
      rawBudget: tripInfo.rawBudget,
      passengers: tripInfo.passengers,
      days: tripInfo.days,
      image: tripInfo.image || 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80'
    };

    try {
      const response = await axios.post('http://localhost:5000/api/trips', tripToSave);
      
      if (response.data.success) {
    // Format ulang data dari backend agar propertinya sama persis dengan yang diminta frontend
    const savedData = response.data.data;
    
    const formattedNewTrip = {
      id: savedData.id || tripInfo.id || Date.now(),
      city: savedData.trip_name || tripInfo.city,
      startDate: savedData.start_date || tripInfo.startDate,
      endDate: savedData.end_date || tripInfo.endDate,
      destinations: savedData.itinerary_data || destinations,
      budget: tripInfo.budget,
      days: tripInfo.days,
      passengers: tripInfo.passengers,
      image: tripInfo.image
    };

    setSavedTrips((prevTrips) => [formattedNewTrip, ...prevTrips]);
    setIsEditingMode(false);
    alert('Mantap! Rencana perjalananmu berhasil disimpan! 🚀');
  }
    } catch (error) {
      console.error('Gagal menyimpan ke database:', error);
      alert('Gagal menyimpan ke database.');
    }
  };

  // Kalkulasi total statistik
  const totalSavedTripsCount = savedTrips.length;
  const totalPlacesAllTrips = savedTrips.reduce((acc, t) => {
    if (!t.destinations) return acc;
    return acc + Object.values(t.destinations).flat().length;
  }, 0);
  const totalDaysAllTrips = savedTrips.reduce((acc, t) => acc + (parseInt(t.days, 10) || 0), 0);

  // Rute Map
  const currentDayDestinations = destinations[selectedDay] || [];
  const routeCoordinates = currentDayDestinations.map(item => [item.lat, item.lng]);
  
  let currentMapCenter = [-6.9175, 107.6191]; 
  if (tripInfo.city.toLowerCase().includes('yogyakarta')) currentMapCenter = [-7.7956, 110.3695];
  if (currentDayDestinations.length > 0) {
    currentMapCenter = [currentDayDestinations[0].lat, currentDayDestinations[0].lng];
  }

  // DATA KATALOG KOTA UNTUK EXPLORE PAGE
  const exploreCitiesList = [
    {
      id: 'bandung',
      name: 'Bandung',
      province: 'Jawa Barat',
      placesCount: '1,400+ Destinasi',
      image: 'https://images.unsplash.com/photo-1613057263089-7a8c82f2825d?q=80&w=1200&auto=format&fit=crop',
      rating: 4.8,
      avgPrice: 250000,
      active: true,
      tag: 'Cool & Mountainous'
    },
    {
      id: 'yogyakarta',
      name: 'Yogyakarta',
      province: 'D.I. Yogyakarta',
      placesCount: '900+ Destinasi',
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
      rating: 4.9,
      avgPrice: 150000,
      active: true,
      tag: 'Cultural Heart'
    },
    {
      id: 'bali',
      name: 'Bali',
      province: 'Bali',
      placesCount: '2,500+ Destinasi',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      rating: 4.9,
      avgPrice: 500000,
      active: false,
      tag: 'Island of Gods'
    },
    {
      id: 'jakarta',
      name: 'Jakarta',
      province: 'DKI Jakarta',
      placesCount: '1,100+ Destinasi',
      image: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=1200&q=80',
      rating: 4.6,
      avgPrice: 350000,
      active: false,
      tag: 'Metropolitan Hub'
    },
    {
      id: 'lombok',
      name: 'Lombok',
      province: 'Nusa Tenggara Barat',
      placesCount: '750+ Destinasi',
      image: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=80',
      rating: 4.8,
      avgPrice: 400000,
      active: false,
      tag: 'Tropical Escape'
    },
    {
      id: 'malang',
      name: 'Malang & Bromo',
      province: 'Jawa Timur',
      placesCount: '600+ Destinasi',
      image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
      rating: 4.7,
      avgPrice: 200000,
      active: false,
      tag: 'Volcano & Heritage'
    }
  ];

  // PENGOLAHAN FILTER & SORTING KATALOG EXPLORE
  const filteredExploreCities = exploreCitiesList
    .filter(city => {
      const q = exploreSearchQuery.toLowerCase();
      return city.name.toLowerCase().includes(q) || city.province.toLowerCase().includes(q) || city.tag.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (exploreSortBy === 'rating') return b.rating - a.rating;
      if (exploreSortBy === 'price_asc') return a.avgPrice - b.avgPrice;
      if (exploreSortBy === 'price_desc') return b.avgPrice - a.avgPrice;
      if (exploreSortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  // RENDER LOGIN
  if (!isLoggedIn) {
    return (
      <LoginView 
        onLoginSuccess={(userData) => {
          let finalUser = userData;
          if (!finalUser || (!finalUser.name && !finalUser.username && !finalUser.full_name)) {
            const saved = localStorage.getItem('user');
            if (saved) finalUser = JSON.parse(saved);
          }

          if (finalUser) {
            setCurrentUser(finalUser);
            localStorage.setItem('user', JSON.stringify(finalUser));
            const rawName = finalUser.name || finalUser.full_name || finalUser.username || finalUser.nama || 'Traveler';
            setUserName(rawName.split(' ')[0]);
          }

          setIsLoggedIn(true);
        }} 
      />
    );
  }

  return (
    <ErrorBoundary>
      <style>{skeletonStyles}</style>

      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", color: '#1e293b', backgroundColor: '#faf9f6', position: 'relative' }}>
        
        <AIChatbotWidget />
        <CreateTripModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleCreateTripSubmit} 
          onAIGenerate={handleAIGenerateTrip} 
          isGeneratingAI={isGeneratingAI} 
        />
        <DestinationPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} city={tripInfo.city || 'Bandung'} onAdd={handleAddDestination} />

        {/* TOP NAVBAR */}
        <header style={{ 
          position: 'relative', zIndex: 9999, 
          backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
          padding: isMobile ? '8px 12px' : '0 32px', height: '56px', minHeight: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '6px', borderRadius: '50%', display: 'flex', color: '#f97316' }}><Compass size={18} /></div>
            <h1 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0f172a', lineHeight: 1 }}>Trip<span style={{ color: '#f97316' }}>Buddy</span></h1>
          </div>

          <nav style={{ display: 'flex', gap: '24px', fontSize: '13px', fontWeight: '600' }}>
            <span onClick={() => setCurrentTab('dashboard')} style={{ color: currentTab === 'dashboard' ? '#0f172a' : '#64748b', borderBottom: currentTab === 'dashboard' ? '2px solid #0f172a' : 'none', padding: '16px 0', cursor: 'pointer' }}>Dashboard</span>
            <span onClick={() => setCurrentTab('mytrips')} style={{ color: currentTab === 'mytrips' ? '#0f172a' : '#64748b', borderBottom: currentTab === 'mytrips' ? '2px solid #0f172a' : 'none', padding: '16px 0', cursor: 'pointer' }}>My Trips ({savedTrips.length})</span>
            <span onClick={() => { setSelectedExploreCity(''); setCurrentTab('explore'); }} style={{ color: currentTab === 'explore' ? '#0f172a' : '#64748b', borderBottom: currentTab === 'explore' ? '2px solid #0f172a' : 'none', padding: '16px 0', cursor: 'pointer' }}>Explore</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '20px', backgroundColor: '#f1f5f9' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><User size={14} /></div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{userName} ∨</span>
              </div>
              {isProfileOpen && (
                <div style={{ position: 'absolute', top: '42px', right: 0, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 999, minWidth: '150px' }}>
                  <div onClick={handleLogout} style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ef4444', fontWeight: '700', fontSize: '12px' }}><LogOut size={14} /> Keluar (Logout)</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ==========================================
            TAB EXPLORE: KATALOG KOTA PROTOTIPE
            ========================================== */}
        {currentTab === 'explore' && (
          <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
            
            {!selectedExploreCity ? (
              <div style={{ padding: isMobile ? '20px 16px 60px 16px' : '40px 60px 80px 60px', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                
                {/* 1. HERO HEADER PROTOTYPE SECTION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
                  <div style={{ maxWidth: '580px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1.2px', color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                      CURATED FOR CURIOUS TRAVELERS
                    </span>
                    <h1 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-1px', lineHeight: 1.1 }}>
                      Find somewhere worth wandering.
                    </h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5, fontWeight: '500' }}>
                      Handpicked places, local stories, and itineraries built around how you love to travel.
                    </p>
                  </div>

                  {/* SEARCH BOX AT TOP RIGHT PROTOTYPE */}
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', padding: '6px 6px 6px 16px', borderRadius: '9999px', boxShadow: '0 6px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', minWidth: isMobile ? '100%' : '360px' }}>
                    <Search size={16} color="#94a3b8" />
                    <input 
                      type="text" 
                      placeholder="Search a city, coast, or feeling..." 
                      value={exploreSearchQuery}
                      onChange={(e) => setExploreSearchQuery(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', padding: '8px 12px', flexGrow: 1, color: '#0f172a' }}
                    />
                    <button style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                      Explore
                    </button>
                  </div>
                </div>

                {/* 2. FILTER & SORTING CONTROL BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>TRENDING NOW</span>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Places with a pulse</h2>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SlidersHorizontal size={14} color="#64748b" />
                    <select 
                      value={exploreSortBy}
                      onChange={(e) => setExploreSortBy(e.target.value)}
                      style={{
                        padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                        fontSize: '12px', fontWeight: '700', color: '#0f172a', backgroundColor: '#ffffff',
                        outline: 'none', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                    >
                      <option value="default">Urutkan: Rekomendasi</option>
                      <option value="rating">Rating Tertinggi ⭐</option>
                      <option value="price_asc">Estimasi Termurah 📉</option>
                      <option value="price_desc">Estimasi Termahal 📈</option>
                      <option value="name">Nama Kota A-Z 🔤</option>
                    </select>
                  </div>
                </div>

                {/* 3. CITY CARDS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                  {filteredExploreCities.map((city) => {
                    return (
                      <div 
                        key={city.id}
                        onClick={() => {
                          if (city.active) {
                            setSelectedExploreCity(city.name);
                          }
                        }}
                        style={{
                          position: 'relative', height: '260px', borderRadius: '24px', overflow: 'hidden',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.08)', cursor: city.active ? 'pointer' : 'default',
                          border: '1px solid rgba(255,255,255,0.6)', transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                      >
                        {/* Background Image */}
                        <img 
                          src={city.image} 
                          alt={city.name} 
                          style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            filter: !city.active ? 'grayscale(60%) brightness(0.7)' : 'none'
                          }} 
                        />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)' }} />

                        {/* Top Badge: Active Rating / Coming Soon Tag */}
                        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', color: '#0f172a' }}>
                            {city.tag}
                          </span>
                          
                          {!city.active ? (
                            <span style={{ backgroundColor: '#0f172a', color: '#f97316', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                              <Lock size={11} /> COMING SOON
                            </span>
                          ) : (
                            <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', color: '#f59e0b' }}>
                              ⭐ {city.rating}
                            </span>
                          )}
                        </div>

                        {/* Bottom Content Card */}
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: '700', opacity: 0.9, display: 'block', textTransform: 'uppercase' }}>
                              {city.province} • {city.placesCount}
                            </span>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '2px 0 0 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                              {city.name}
                            </h3>
                          </div>

                          {city.active && (
                            <div style={{ backgroundColor: '#ffffff', color: '#0f172a', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                              <ArrowRight size={18} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 4. FEELING SPONTANEOUS BANNER PROTOTYPE */}
                <div style={{ backgroundColor: '#f1f5f9', borderRadius: '20px', padding: '20px 24px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#f97316', color: '#ffffff', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>FEELING SPONTANEOUS?</span>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Let TripBuddy AI choose your next escape.</h4>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Surprise me →
                  </button>
                </div>

              </div>
            ) : (
              /* DETAIL KOTA JIKA SALAH SATU KOTA DIKLIK */
              <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                <CityDetail 
                  cityName={selectedExploreCity} 
                  onBack={() => setSelectedExploreCity('')} 
                  onAddPlace={handleAddDestination} 
                  hasTrip={hasTrip} 
                />
              </div>
            )}

          </div>
        )}

        {/* WORKSPACE MY TRIPS */}
        {currentTab === 'mytrips' && (
          <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr 1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
            
            {/* KOLOM 1: MASTER LIST */}
            <div style={{ backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              <div style={{ padding: '20px 20px 12px 20px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>YOUR JOURNEYS</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>My Trips</h2>
                  <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '14px', fontSize: '12px', fontWeight: '700' }}>
                  <span onClick={() => setMyTripsFilter('upcoming')} style={{ color: myTripsFilter === 'upcoming' ? '#0f172a' : '#94a3b8', borderBottom: myTripsFilter === 'upcoming' ? '2px solid #0f172a' : 'none', paddingBottom: '4px', cursor: 'pointer' }}>
                    Upcoming <span style={{ backgroundColor: '#e2e8f0', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>{savedTrips.length}</span>
                  </span>
                  <span onClick={() => setMyTripsFilter('past')} style={{ color: myTripsFilter === 'past' ? '#0f172a' : '#94a3b8', borderBottom: myTripsFilter === 'past' ? '2px solid #0f172a' : 'none', paddingBottom: '4px', cursor: 'pointer' }}>
                    Past <span style={{ backgroundColor: '#e2e8f0', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>0</span>
                  </span>
                </div>
              </div>

              <div style={{ padding: '0 20px 20px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                {savedTrips.length === 0 ? (
                  <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '24px 16px', textAlign: 'center', color: '#64748b' }}>
                    <p style={{ fontSize: '12px', margin: '0 0 12px 0' }}>Belum ada itinerary tersimpan.</p>
                    <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>+ Buat Trip Baru</button>
                  </div>
                ) : (
                  savedTrips.map((trip) => {
                    const isSelected = selectedTripDetail?.id === trip.id;
                    return (
                      <div 
                        key={trip.id}
                        onClick={() => handleSelectTripFromHistory(trip)}
                        style={{
                          position: 'relative', height: '110px', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
                          border: isSelected ? '3px solid #0f172a' : '1px solid #e2e8f0',
                          boxShadow: isSelected ? '0 4px 14px rgba(15,23,42,0.15)' : 'none', transition: 'all 0.2s ease'
                        }}
                      >
                        <img src={trip.image || "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={trip.city} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)' }} />
                        
                        {/* TOMBOL DELETE BARU */}
                        <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}>
                          <button 
                            onClick={(e) => handleDeleteTrip(e, trip.id)}
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'transform 0.2s' }}
                            title="Hapus Trip"
                          >
                          <Trash2 size={14} />
                          </button>
                        </div>
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ffffff', borderRadius: '50%', padding: '2px', color: '#0f172a', display: 'flex' }}>
                            <CheckCircle size={14} />
                          </div>
                        )}

                        <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px', color: '#fff' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{trip.city.split(',')[0]}</h4>
                          <span style={{ fontSize: '10px', opacity: 0.9 }}>{formatDateText(trip.startDate)} - {formatDateText(trip.endDate)}</span>
                        </div>
                      </div>
                    );
                  })
                )}

                <div 
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    border: '2px dashed #cbd5e1', borderRadius: '14px', padding: '16px', textAlign: 'center', cursor: 'pointer',
                    backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                    <Plus size={14} /> Plan a new adventure
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Start from scratch or use AI</span>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', textAlign: 'center', marginTop: 'auto' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{String(totalSavedTripsCount).padStart(2, '0')}</div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '700' }}>Trips</div>
                  </div>
                  <div style={{ borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{String(totalPlacesAllTrips).padStart(2, '0')}</div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '700' }}>Places</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{String(totalDaysAllTrips).padStart(2, '0')}</div>
                    <div style={{ fontSize: '8px', color: '#94a3b8', fontWeight: '700' }}>Days</div>
                  </div>
                </div>

              </div>
            </div>

            {/* KOLOM 2: TIMELINE WORKSPACE */}
            <div style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              {!selectedTripDetail ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                  <Compass size={48} strokeWidth={1.5} />
                  <p style={{ marginTop: '12px', fontSize: '13px', fontWeight: '600' }}>Pilih trip di sebelah kiri untuk melihat runtutan perjalanan.</p>
                </div>
              ) : (
                <>
                {(() => {
        // Kalkulasi Budget Dinamis
        const totalBudget = tripInfo.rawBudget || 0;
        
        // Ambil semua item dari semua hari (Object.values), jadikan satu array (flat), lalu jumlahkan numericPrice-nya
        const totalSpent = Object.values(destinations).flat().reduce((sum, item) => sum + (item.numericPrice || 0), 0);
        
        const remainingBudget = totalBudget - totalSpent;
        const budgetPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
        const isOverBudget = totalSpent > totalBudget;

        return (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: isOverBudget ? '#fef2f2' : '#f8fafc', borderRadius: '12px', border: isOverBudget ? '1px solid #fca5a5' : '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: isOverBudget ? '#ef4444' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wallet size={14} /> Real-time Budget
                </span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: isOverBudget ? '#ef4444' : '#0f172a' }}>
                  {isOverBudget ? '⚠️ Over Budget' : `Sisa: Rp ${remainingBudget.toLocaleString('id-ID')}`}
                </span>
              </div>
              
              <div style={{ width: '100%', height: '8px', backgroundColor: isOverBudget ? '#fecaca' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${budgetPercent}%`, 
                  backgroundColor: isOverBudget ? '#ef4444' : (budgetPercent > 80 ? '#f59e0b' : '#10b981'),
                  borderRadius: '4px',
                  transition: 'width 0.3s ease, background-color 0.3s ease'
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', fontWeight: '600', color: '#64748b' }}>
                <span>Terpakai: Rp {totalSpent.toLocaleString('id-ID')}</span>
                <span>Total Budget: Rp {totalBudget.toLocaleString('id-ID')}</span>
              </div>
            </div>
        );
      })()}
                  <div style={{ padding: '20px 24px 12px 24px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                      {formatDateText(tripInfo.startDate)} - {formatDateText(tripInfo.endDate)}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      {tripInfo.city.split(',')[0]} Escape
                    </h2>
    
                    {isEditingMode ? (
                      <button onClick={handleSaveTrip} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} /> Simpan
                      </button>
                    ) : (
                    <button onClick={() => setIsEditingMode(true)} style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Settings size={12} /> Edit
                    </button>
                    )}
                   </div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      👥 {tripInfo.passengers || 2} travelers • 🌙 {tripInfo.days || 3} nights
                    </span>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {Array.from({ length: tripInfo.days || 3 }).map((_, i) => {
                        const dayNum = i + 1;
                        const isActive = selectedDay === dayNum;
                        return (
                          <button
                            key={dayNum}
                            onClick={() => setSelectedDay(dayNum)}
                            style={{
                              padding: '8px 14px', borderRadius: '12px', border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
                              backgroundColor: isActive ? '#f8fafc' : '#ffffff', color: isActive ? '#0f172a' : '#64748b',
                              fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left'
                            }}
                          >
                            <div style={{ fontSize: '9px', color: isActive ? '#0f172a' : '#94a3b8' }}>DAY {dayNum}</div>
                            {getDayDate(tripInfo.startDate, i)}
                          </button>
                        );
                      })}
                      <button onClick={() => setIsPickerOpen(true)} style={{ padding: '8px 12px', borderRadius: '12px', border: '1px dashed #cbd5e1', backgroundColor: '#fff', color: '#64748b', cursor: 'pointer' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '12px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>24°</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>Hari ke-{selectedDay} di {tripInfo.city.split(',')[0]}</h4>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>Sunny • {currentDayDestinations.length} stops</span>
                      </div>
                    </div>
                    <button onClick={() => handleAIGenerateTrip(tripInfo)} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={12} color="#f97316" /> Optimize route
                    </button>
                  </div>

                  <div style={{ padding: '20px 24px', flexGrow: 1, overflowY: 'auto' }}>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                      <Droppable droppableId={`timeline-day-${selectedDay}`}>
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {currentDayDestinations.length === 0 ? (
                              <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '12px', color: '#94a3b8', fontSize: '12px' }}>
                                Belum ada jadwal di Hari {selectedDay}. <br/> Klik <b>+ Add a place</b> di bawah.
                              </div>
                            ) : (
                              currentDayDestinations.map((place, index) => (
                                <Draggable key={place.id} draggableId={place.id} index={index}>
                                  {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', ...provided.draggableProps.style }}>
                                      
                                      <div style={{ width: '45px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', paddingTop: '4px', textAlign: 'right' }}>
                                        {place.time || `0${9 + index * 2}:00`}
                                      </div>

                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316', border: '2px solid white', boxShadow: '0 0 0 2px #f97316' }} />
                                        {index !== currentDayDestinations.length - 1 && <div style={{ width: '2px', backgroundColor: '#e2e8f0', flexGrow: 1, marginTop: '4px', minHeight: '60px' }} />}
                                      </div>

                                      <div style={{ flexGrow: 1, backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <img src={place.image} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} alt={place.name} />
                                        <div style={{ flexGrow: 1 }}>
                                          <span style={{ fontSize: '9px', fontWeight: '800', color: '#f97316', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                                            {place.category || 'VISIT'}
                                          </span>
                                          <h4 style={{ margin: '2px 0 2px 0', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{place.name}</h4>
                                          <span style={{ fontSize: '10px', color: '#64748b' }}>{place.address || 'Lokasi Wisata Populer'}</span>
                                        </div>
                                        <button onClick={() => handleRemoveDestination(place.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                                          <Trash2 size={14} color="#ef4444" />
                                        </button>
                                      </div>

                                    </div>
                                  )}
                                </Draggable>
                              ))
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <button 
                      onClick={() => setIsPickerOpen(true)}
                      style={{ width: '100%', marginTop: '20px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', color: '#0f172a', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Plus size={14} /> Add a place
                    </button>
                  </div>

                  <div style={{ padding: '10px 20px', backgroundColor: '#fff7ed', borderTop: '1px solid #ffedd5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#c2410c' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={13} color="#f97316" />
                      <span>Smart tip: Pesan tiket destinasi lebih awal untuk menghindari antrean.</span>
                    </div>
                    <span style={{ fontWeight: '700', cursor: 'pointer' }}>Lihat Tiket →</span>
                  </div>
                </>
              )}

            </div>

            {/* KOLOM 3: LIVE MAP VIEW */}
            <div style={{ position: 'relative', height: '100%', width: '100%', backgroundColor: '#e2e8f0' }}>
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 1000, display: 'flex', gap: '8px' }}>
                <div style={{ flexGrow: 1, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: '10px', display: 'flex', alignItems: 'center', padding: '0 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.6)' }}>
                  <Search size={14} color="#64748b" />
                  <input type="text" placeholder={`Cari di ${tripInfo.city.split(',')[0]}...`} style={{ width: '100%', padding: '10px 8px', border: 'none', background: 'transparent', fontSize: '12px', outline: 'none' }} />
                </div>
              </div>

              <MapContainer key={`map-mytrips-workspace-${selectedDay}`} center={currentMapCenter} zoom={12} style={{ width: '100%', height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {currentDayDestinations.map((p, i) => (
                  <Marker key={p.id} position={[p.lat, p.lng]} icon={createNumberIcon(i+1)}>
                    <Popup><b>{p.name}</b><br/>Stop #{i+1}</Popup>
                  </Marker>
                ))}
                <Polyline positions={routeCoordinates} color="#f97316" weight={4} dashArray="6, 6" />
              </MapContainer>

              <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, backgroundColor: '#ffffff', padding: '8px 14px', borderRadius: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>
                <Navigation size={13} color="#f97316" />
                <span>4.8 km • ~22 min</span>
              </div>
            </div>

          </div>
        )}

        {/* DASHBOARD TAB */}
        {currentTab === 'dashboard' && (() => {
          const activeTrip = savedTrips[0] || (hasTrip ? tripInfo : null);

          const getDaysToGo = (startDateStr) => {
            if (!startDateStr) return '14 hari lagi';
            const today = new Date();
            const start = new Date(startDateStr);
            const diffTime = start - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? `${diffDays} hari lagi` : 'Sedang Berlangsung';
          };

          const activeTripPlacesCount = activeTrip && activeTrip.destinations 
            ? Object.values(activeTrip.destinations).flat().length 
            : 0;

          const formattedTodayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

          return (
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: isMobile ? '16px' : '28px 40px 60px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                    {formattedTodayDate}
                  </span>
                  <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                    Where to next, {userName}?
                  </h1>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: '500' }}>
                    Petualangan barumu sedang disiapkan. Ini ringkasan terkini untukmu.
                  </p>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    backgroundColor: '#0f172a', color: '#ffffff', border: 'none',
                    padding: '12px 20px', borderRadius: '9999px', fontWeight: '700',
                    fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)'
                  }}
                >
                  <Plus size={16} /> Plan a new trip
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: '24px', alignItems: 'start' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.8px', color: '#94a3b8', display: 'block' }}>COMING UP</span>
                      <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Your travel plans</h2>
                    </div>
                    <button onClick={() => setCurrentTab('mytrips')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                      View all →
                    </button>
                  </div>

                  {activeTrip ? (
                    <div style={{
                      position: 'relative', height: '280px', borderRadius: '24px', overflow: 'hidden',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', color: '#ffffff'
                    }}>
                      <img 
                        src={activeTrip.image || "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80"} 
                        alt={activeTrip.city} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
                      />
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)', zIndex: 1 }} />

                      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '9999px', width: 'fit-content', color: '#0f172a', fontSize: '11px', fontWeight: '800' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                        {getDaysToGo(activeTrip.startDate)}
                      </div>

                      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', opacity: 0.9, textTransform: 'uppercase' }}>
                            INDONESIA • {formatDateText(activeTrip.startDate)} - {formatDateText(activeTrip.endDate)}
                          </span>
                          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '4px 0 6px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                            {activeTrip.city.startsWith('Liburan') ? activeTrip.city : `Liburan ${activeTrip.city}`}
                          </h2>
                          <p style={{ fontSize: '12px', margin: 0, opacity: 0.9, fontWeight: '600' }}>
                            👥 {activeTrip.passengers || 2} Peserta • 🌙 {activeTrip.days || 3} Hari • 📍 {activeTripPlacesCount} Destinasi
                          </p>
                        </div>

                        <button 
                          onClick={() => handleSelectTripFromHistory(activeTrip)}
                          style={{
                            backgroundColor: '#ffffff', color: '#0f172a', border: 'none',
                            padding: '10px 20px', borderRadius: '9999px', fontWeight: '800',
                            fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }}
                        >
                          Open Itinerary →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <Compass size={40} color="#f97316" style={{ marginBottom: '12px' }} />
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Belum Ada Perjalanan Aktif</h3>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Buat rencana baru untuk melihat ringkasan itinerary di sini.</p>
                      <button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>+ Buat Rencana</button>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.8px', color: '#94a3b8' }}>TRIP READINESS</span>
                            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Almost ready to roam</h3>
                          </div>
                          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                            {activeTripPlacesCount > 0 ? '72%' : '20%'}
                          </span>
                        </div>

                        <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                          <div style={{ height: '100%', width: activeTripPlacesCount > 0 ? '72%' : '20%', backgroundColor: '#0f172a', borderRadius: '4px' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', color: '#334155' }}>
                              <CheckCircle size={14} color="#10b981" /> Pilih Akomodasi / Hotel
                            </div>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>›</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', color: '#334155' }}>
                              <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #cbd5e1' }} /> Ambil Tiket Destinasi Utama
                            </div>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>›</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.8px', color: '#94a3b8', textTransform: 'uppercase' }}>
                          {(activeTrip?.city?.split(',')[0] || 'BANDUNG')} FORECAST
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 12px 0' }}>
                          <span style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>24°</span>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>Sunny & breezy</div>
                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Perfect walking weather</div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                          {['FRI 23°', 'SAT 25°', 'SUN 24°', 'MON 24°'].map((day, idx) => (
                            <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '8px 4px', borderRadius: '8px', textAlign: 'center', fontSize: '9px', fontWeight: '700', color: '#475569' }}>
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ backgroundColor: '#f97316', color: '#fff', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                        <Sparkles size={14} />
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.8px', color: '#94a3b8' }}>A NOTE FROM TRIPBUDDY AI</span>
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                      I found something you'll love.
                    </h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                      Spot pemandangan terbaik di {activeTrip?.city?.split(',')[0] || 'kota tujuan'} punya event kuliner menarik minggu ini!
                    </p>
                    <button 
                      onClick={() => setIsPickerOpen(true)}
                      style={{
                        width: '100%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a',
                        padding: '8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      Add to Itinerary +
                    </button>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.8px', color: '#94a3b8', display: 'block', marginBottom: '12px' }}>
                      YOUR YEAR IN TRAVEL
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                          {String(totalSavedTripsCount).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '700', marginTop: '2px' }}>Total Trips</div>
                      </div>
                      <div style={{ borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                          {String(totalPlacesAllTrips).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '700', marginTop: '2px' }}>Places visited</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                          {String(totalDaysAllTrips).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '700', marginTop: '2px' }}>Days on road</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 8px 24px rgba(15,23,42,0.15)' }}>
                    <Compass size={18} color="#f97316" />
                    <p style={{ fontSize: '12px', fontStyle: 'italic', margin: 0, lineHeight: 1.5, color: '#e2e8f0', fontWeight: '500' }}>
                      "The world is a book, and those who do not travel read only one page."
                    </p>
                    <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1px', color: '#94a3b8' }}>
                      SAINT AUGUSTINE
                    </span>
                  </div>

                </div>

              </div>

            </div>
          );
        })()}

      </div>
    </ErrorBoundary>
  );
}