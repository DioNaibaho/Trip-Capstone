import React, { useState, useEffect } from 'react';
import { Building2, Utensils, MapPin, ArrowLeft } from 'lucide-react';

export default function CityDetail({ cityName, onBack }) {
  const [activeTab, setActiveTab] = useState('attractions'); // Tab aktif: 'attractions', 'hotels', 'culinaries'
  const [data, setData] = useState({ hotels: [], attractions: [], culinaries: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data dari backend sesuai kota yang dipilih
    fetch(`http://localhost:5000/api/destinations/${cityName}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [cityName]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data destinasi {cityName}...</div>;
  }

  // Pilih list data yang mau ditampilin sesuai tab aktif
  const currentList = data[activeTab] || [];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Tombol Kembali */}
      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '20px', fontWeight: '600', color: '#0f172a' }}
      >
        <ArrowLeft size={20} /> Kembali ke Eksplor
      </button>

      {/* Judul Kota */}
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
        Eksplor {cityName}
      </h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Temukan tempat wisata terbaik, hotel nyaman, dan kuliner lezat di {cityName}.
      </p>

      {/* NAVIGASI TAB (Wisata, Hotel, Kuliner) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('attractions')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none',
            backgroundColor: activeTab === 'attractions' ? '#f97316' : '#f1f5f9',
            color: activeTab === 'attractions' ? '#fff' : '#475569',
            fontWeight: '700', cursor: 'pointer'
          }}
        >
          <MapPin size={18} /> Wisata ({data.attractions.length})
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none',
            backgroundColor: activeTab === 'hotels' ? '#f97316' : '#f1f5f9',
            color: activeTab === 'hotels' ? '#fff' : '#475569',
            fontWeight: '700', cursor: 'pointer'
          }}
        >
          <Building2 size={18} /> Hotel ({data.hotels.length})
        </button>

        <button
          onClick={() => setActiveTab('culinaries')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none',
            backgroundColor: activeTab === 'culinaries' ? '#f97316' : '#f1f5f9',
            color: activeTab === 'culinaries' ? '#fff' : '#475569',
            fontWeight: '700', cursor: 'pointer'
          }}
        >
          <Utensils size={18} /> Kuliner ({data.culinaries.length})
        </button>
      </div>

      {/* GRID DAFTAR CARD DATA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {currentList.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Belum ada data tersedia.</p>
        ) : (
          currentList.map((item) => (
            <div 
              key={item.id} 
              style={{
                backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                {item.name || 'Nama Tidak Tersedia'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>
                📍 Kategori: {item.tourism || item.amenity || 'Umum'}
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
                Kota: {item.city}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}