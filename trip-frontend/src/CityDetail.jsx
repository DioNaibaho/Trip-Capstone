import React, { useState, useEffect } from 'react';
import { Building2, Utensils, MapPin, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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

function MapController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (map && center && Array.isArray(center) && !isNaN(center[0]) && !isNaN(center[1])) {
      try {
        setTimeout(() => {
          map.flyTo([center[0], center[1]], zoom, { animate: true, duration: 1.5 });
        }, 100);
      } catch (error) {
        console.error("Gagal menggeser peta:", error);
      }
    }
  }, [center[0], center[1], zoom, map]); 
  return null;
}

// 1. TAMBAH PROPS onAddPlace dan hasTrip DI SINI
export default function CityDetail({ cityName, onBack, onAddPlace, hasTrip }) {
  const [activeTab, setActiveTab] = useState('hotels'); 
  const [data, setData] = useState({ hotels: [], attractions: [], culinaries: [] });
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    fetch(`/api/destinations/${cityName}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [cityName]);

  useEffect(() => {
    setSelectedPlace(null);
  }, [activeTab]);

  // 2. FUNGSI UNTUK TOMBOL TAMBAH KE RENCANA
  const handleAddToPlan = () => {
    if (!hasTrip) {
      alert("Wah, kamu belum punya Rencana Perjalanan yang aktif! Silakan buat Rencana Baru dulu di menu Dashboard ya.");
      return;
    }
    
    if (onAddPlace && selectedPlace) {
      onAddPlace(selectedPlace, activeTab);
      alert(`Mantap! ${selectedPlace.name} berhasil ditambahkan ke Rencana Perjalananmu.`);
      setSelectedPlace(null); // Otomatis tutup popup setelah ditambah
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data destinasi {cityName}...</div>;
  }

  const currentList = data[activeTab] || [];
  const defaultMapCenter = cityName.toLowerCase() === 'bandung' ? [-6.9175, 107.6191] : [-7.7970, 110.3705];
  const mapCenter = currentList.length > 0 && currentList[0].latitude 
    ? [parseFloat(currentList[0].latitude), parseFloat(currentList[0].longitude)] 
    : defaultMapCenter;

  return (
    <div style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '20px', fontWeight: '600', color: '#0f172a' }}
      >
        <ArrowLeft size={20} /> Kembali ke Eksplor
      </button>

      <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Eksplor {cityName}</h1>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '13px' }}>
        Temukan tempat wisata terbaik, hotel nyaman, dan kuliner lezat di {cityName}.
      </p>

      {/* NAVIGASI TAB */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setActiveTab('attractions')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'attractions' ? '#f97316' : '#f1f5f9', color: activeTab === 'attractions' ? '#fff' : '#475569', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px' }}
        >
          <MapPin size={16} /> Wisata ({data.attractions.length})
        </button>
        <button
          onClick={() => setActiveTab('hotels')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'hotels' ? '#f97316' : '#f1f5f9', color: activeTab === 'hotels' ? '#fff' : '#475569', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px' }}
        >
          <Building2 size={16} /> Hotel ({data.hotels.length})
        </button>
        <button
          onClick={() => setActiveTab('culinaries')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'culinaries' ? '#f97316' : '#f1f5f9', color: activeTab === 'culinaries' ? '#fff' : '#475569', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px' }}
        >
          <Utensils size={16} /> Kuliner ({data.culinaries.length})
        </button>
      </div>

      {/* TAMPILAN PETA (STICKY) */}
      <div style={{ height: '35vh', minHeight: '280px', width: '100%', marginBottom: '24px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'sticky', top: '16px', zIndex: 10, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
        <MapContainer key={activeTab} center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {selectedPlace && selectedPlace.latitude && selectedPlace.longitude && (
            <MapController center={[parseFloat(selectedPlace.latitude), parseFloat(selectedPlace.longitude)]} zoom={16} />
          )}
          {currentList.map((item) => {
            if (item.latitude && item.longitude) {
              return (
                <Marker key={item.id} position={[parseFloat(item.latitude), parseFloat(item.longitude)]}>
                  <Popup>
                    <b style={{ fontSize: '14px' }}>{item.name}</b><br/>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Kategori: {item.tourism || item.amenity || 'Umum'}</span>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>

        {/* OVERLAY KARTU INFORMASI */}
        {selectedPlace && (
          <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', padding: '16px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', zIndex: 1000, width: '90%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: '85%' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedPlace.name}
                </h4>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                  📍 {selectedPlace.tourism || selectedPlace.amenity || 'Umum'}
                </p>
              </div>
              <button onClick={() => setSelectedPlace(null)} style={{ background: '#e2e8f0', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}>
                ✕
              </button>
            </div>

            <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5', maxHeight: '50px', overflowY: 'auto', paddingRight: '4px', marginTop: '4px' }}>
              {selectedPlace.description || `Destinasi ${selectedPlace.name} merupakan salah satu rekomendasi pilihan terbaik di ${cityName}. Tempat ini sangat cocok untuk melengkapi rencana perjalanan Anda.`}
            </div>

            {/* 3. TOMBOL EKSEKUSI */}
            <button 
              onClick={handleAddToPlan}
              style={{ backgroundColor: '#f97316', color: 'white', fontWeight: '700', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(249,115,22,0.3)', marginTop: '4px' }}
            >
              + Tambahkan ke Rencana
            </button>
          </div>
        )}
      </div>

      {/* GRID DAFTAR KARTU */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', paddingBottom: '40px' }}>
        {currentList.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Belum ada data tersedia.</p>
        ) : (
          currentList.map((item) => (
            <div key={item.id} onClick={() => setSelectedPlace(item)} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', boxShadow: selectedPlace?.id === item.id ? '0 8px 24px rgba(249,115,22,0.2)' : '0 4px 12px rgba(0,0,0,0.05)', border: selectedPlace?.id === item.id ? '2px solid #f97316' : '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s ease-in-out', transform: selectedPlace?.id === item.id ? 'translateY(-2px)' : 'none' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>{item.name || 'Nama Tidak Tersedia'}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>📍 Kategori: {item.tourism || item.amenity || 'Umum'}</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>Kota: {item.city}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}