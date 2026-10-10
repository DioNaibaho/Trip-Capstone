import React, { useState, useEffect } from 'react';
import { Building2, Utensils, MapPin, ArrowLeft } from 'lucide-react';
// 1. IMPORT LEAFLET
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 2. FIX ICON LEAFLET BIAR NGGAK HILANG / BROKEN IMAGE
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function CityDetail({ cityName, onBack }) {
  const [activeTab, setActiveTab] = useState('hotels'); // 'attractions', 'hotels', 'culinaries'
  const [data, setData] = useState({ hotels: [], attractions: [], culinaries: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  // Ambil list data sesuai tab yang diklik
  const currentList = data[activeTab] || [];

  // 3. TENTUKAN TITIK TENGAH PETA (Otomatis ambil koordinat data pertama)
  const defaultMapCenter = cityName.toLowerCase() === 'bandung' ? [-6.9175, 107.6191] : [-7.7970, 110.3705];
  const mapCenter = currentList.length > 0 && currentList[0].latitude 
    ? [parseFloat(currentList[0].latitude), parseFloat(currentList[0].longitude)] 
    : defaultMapCenter;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Tombol Kembali */}
      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '20px', fontWeight: '600', color: '#0f172a' }}
      >
        <ArrowLeft size={20} /> Kembali ke Eksplor
      </button>

      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
        Eksplor {cityName}
      </h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Temukan tempat wisata terbaik, hotel nyaman, dan kuliner lezat di {cityName}.
      </p>

      {/* NAVIGASI TAB */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('attractions')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none',
            backgroundColor: activeTab === 'attractions' ? '#f97316' : '#f1f5f9',
            color: activeTab === 'attractions' ? '#fff' : '#475569', fontWeight: '700', cursor: 'pointer'
          }}
        >
          <MapPin size={18} /> Wisata ({data.attractions.length})
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none',
            backgroundColor: activeTab === 'hotels' ? '#f97316' : '#f1f5f9',
            color: activeTab === 'hotels' ? '#fff' : '#475569', fontWeight: '700', cursor: 'pointer'
          }}
        >
          <Building2 size={18} /> Hotel ({data.hotels.length})
        </button>

        <button
          onClick={() => setActiveTab('culinaries')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none',
            backgroundColor: activeTab === 'culinaries' ? '#f97316' : '#f1f5f9',
            color: activeTab === 'culinaries' ? '#fff' : '#475569', fontWeight: '700', cursor: 'pointer'
          }}
        >
          <Utensils size={18} /> Kuliner ({data.culinaries.length})
        </button>
      </div>

      {/* 4. TAMPILAN PETA LEAFLET (Dinamis Sesuai Data Tab) */}
      <div style={{ height: '400px', width: '100%', marginBottom: '24px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', zIndex: 1, position: 'relative' }}>
        {/* key={activeTab} berfungsi untuk me-reset ulang posisi peta saat ganti tab */}
        <MapContainer key={activeTab} center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Looping Data Menjadi Marker (Pin Peta) */}
          {currentList.map((item) => {
            if (item.latitude && item.longitude) {
              return (
                <Marker 
                  key={item.id} 
                  position={[parseFloat(item.latitude), parseFloat(item.longitude)]}
                >
                  <Popup>
                    <b style={{ fontSize: '14px' }}>{item.name}</b><br/>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Kategori: {item.tourism || item.amenity || 'Umum'}
                    </span>
                  </Popup>
                </Marker>
              );
            }
            return null; // Kalau data nggak punya lat/long, abaikan.
          })}
        </MapContainer>
      </div>

      {/* GRID DAFTAR CARD DATA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', paddingBottom: '40px' }}>
        {currentList.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Belum ada data tersedia.</p>
        ) : (
          currentList.map((item) => (
            <div 
              key={item.id} 
              style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}
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