'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      {message}
    </div>
  );
}

const CATEGORIES = [
  { key: 'nunti', label: 'Nunți' },
  { key: 'cununie', label: 'Cununie' },
  { key: 'botez', label: 'Botez' },
  { key: 'fotosesii', label: 'Fotosesii' },
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('events');
  const [eventCategory, setEventCategory] = useState('nunti');
  const [toast, setToast] = useState('');

  // Мероприятия
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  // Слайд-шоу
  const [slides, setSlides] = useState([]);
  const [slideFiles, setSlideFiles] = useState([]);
  const [slidePreviews, setSlidePreviews] = useState([]);

  // Профиль
  const [photographer, setPhotographer] = useState({ name: '', bio: '', instagram: '', facebook: '', tiktok: '', phone: '', email: '' });

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') setAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'secret123') {
      localStorage.setItem('adminAuth', 'true');
      setAuthenticated(true);
    } else setToast('Parolă greșită!');
  };

  useEffect(() => {
    if (!authenticated) return;
    loadEvents();
    loadSlides();
    loadPhotographer();
  }, [authenticated]);

  const loadEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    setEvents(data || []);
  };

  const loadSlides = async () => {
    const { data } = await supabase.from('slideshow').select('*').order('order_index', { ascending: true });
    setSlides(data || []);
  };

  const loadPhotographer = async () => {
    const { data } = await supabase.from('photographer').select('*').limit(1);
    if (data && data[0]) setPhotographer(data[0]);
  };

  // ===== МЕРОПРИЯТИЯ =====
  const createEvent = async (e) => {
    e.preventDefault();
    if (!title || !coverFile) { setToast('Completează numele și alege o copertă!'); return; }
    setLoading(true);
    const fileName = `${Date.now()}_${coverFile.name}`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, coverFile);
    if (uploadError) { setToast('Eroare: ' + uploadError.message); setLoading(false); return; }
    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
    await supabase.from('events').insert({ title, cover_image: urlData.publicUrl, category: eventCategory });
    setToast('Eveniment creat!');
    setTitle(''); setCoverFile(null);
    loadEvents(); setLoading(false);
  };

  const uploadPhotos = async (e) => {
    e.preventDefault();
    if (!files.length || !selectedEvent) { setToast('Alege sau trage fotografii!'); return; }
    setLoading(true);
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('photos').upload(fileName, file);
      if (error) { setToast('Eroare: ' + error.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
      await supabase.from('event_photos').insert({ event_id: selectedEvent, image_url: urlData.publicUrl, caption });
    }
    setToast('Fotografii adăugate!');
    setFiles([]); setPreviews([]); setCaption('');
    setLoading(false);
  };

  const deleteEvent = async (id) => {
    if (!confirm('Ștergi acest eveniment?')) return;
    await supabase.from('events').delete().eq('id', id);
    loadEvents();
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...dropped]);
      setPreviews(prev => [...prev, ...dropped.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
    setPreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))]);
  };

  // ===== СЛАЙД-ШОУ =====
  const handleSlideSelect = (e) => {
    const selected = Array.from(e.target.files);
    setSlideFiles(prev => [...prev, ...selected]);
    setSlidePreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))]);
  };

  const uploadSlides = async (e) => {
    e.preventDefault();
    if (!slideFiles.length) { setToast('Alege fotografii!'); return; }
    setLoading(true);
    for (const file of slideFiles) {
      const fileName = `slide_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('photos').upload(fileName, file);
      if (error) { setToast('Eroare: ' + error.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
      await supabase.from('slideshow').insert({ image_url: urlData.publicUrl });
    }
    setToast('Slide-uri adăugate!');
    setSlideFiles([]); setSlidePreviews([]);
    loadSlides(); setLoading(false);
  };

  const deleteSlide = async (id) => {
    if (!confirm('Ștergi acest slide?')) return;
    await supabase.from('slideshow').delete().eq('id', id);
    loadSlides();
  };

  // ===== ПРОФИЛЬ =====
  const savePhotographer = async (e) => {
    e.preventDefault();
    await supabase.from('photographer').upsert(photographer);
    setToast('Profil salvat!');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          </div>
          <input type="password" placeholder="Parolă" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium">Intră</button>
        </form>
      </div>
    );
  }

  const filteredEvents = events.filter(e => e.category === eventCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Creative Studio" className="w-12 h-12 rounded-full object-cover" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Panou</h1>
        </div>
        <button onClick={() => { localStorage.removeItem('adminAuth'); setAuthenticated(false); }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Deconectare</button>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl shadow-sm max-w-lg">
        <button onClick={() => setTab('events')} className={`flex-1 px-4 py-2 rounded-lg font-medium ${tab === 'events' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Evenimente</button>
        <button onClick={() => setTab('slideshow')} className={`flex-1 px-4 py-2 rounded-lg font-medium ${tab === 'slideshow' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Slideshow</button>
        <button onClick={() => setTab('photographer')} className={`flex-1 px-4 py-2 rounded-lg font-medium ${tab === 'photographer' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Profil</button>
      </div>

      {/* ===== EVENIMENTE ===== */}
      {tab === 'events' && (
        <div>
          {/* Подвкладки категорий */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setEventCategory(cat.key)} className={`px-5 py-2 rounded-full text-sm font-medium ${eventCategory === cat.key ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Создание */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-6">Adaugă în {CATEGORIES.find(c => c.key === eventCategory)?.label}</h2>
              <form onSubmit={createEvent}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numele</label>
                  <input type="text" placeholder="ex: Maria & Ion" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poză de copertă</label>
                  <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="w-full p-2 border border-gray-300 rounded-xl" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium">Adaugă</button>
              </form>
            </div>

            {/* Список */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-6">Lista — {CATEGORIES.find(c => c.key === eventCategory)?.label}</h2>
              {filteredEvents.length === 0 ? (
                <p className="text-gray-500">Nicio lucrare în această categorie.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {filteredEvents.map(ev => (
                    <div key={ev.id} className={`border-2 rounded-xl p-4 cursor-pointer ${selectedEvent === ev.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`} onClick={() => setSelectedEvent(ev.id)}>
                      <img src={ev.cover_image} alt={ev.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                      <p className="font-semibold text-gray-900">{ev.title}</p>
                      <button onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }} className="text-red-500 text-sm mt-2">Șterge</button>
                    </div>
                  ))}
                </div>
              )}

              {selectedEvent && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold mb-4">Încarcă foto în: {events.find(e => e.id === selectedEvent)?.title}</h3>
                  <div onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop} className="border-2 border-dashed border-blue-300 bg-white p-6 rounded-xl text-center mb-4">
                    <p className="text-gray-500 mb-2">Trage fotografii aici sau</p>
                    <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="text-sm" />
                  </div>
                  {previews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {previews.map((url, i) => <img key={i} src={url} alt="preview" className="w-20 h-20 object-cover rounded" />)}
                    </div>
                  )}
                  <input type="text" placeholder="Descriere" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full p-3 border rounded-xl mb-4" />
                  <button onClick={uploadPhotos} disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl">Upload</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== SLIDESHOW ===== */}
      {tab === 'slideshow' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6">Adaugă slide-uri</h2>
            <form onSubmit={uploadSlides}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Alege fotografii (poți selecta mai multe)</label>
                <input type="file" accept="image/*" multiple onChange={handleSlideSelect} className="w-full p-2 border border-gray-300 rounded-xl" />
              </div>
              {slidePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {slidePreviews.map((url, i) => <img key={i} src={url} alt="preview" className="w-20 h-20 object-cover rounded" />)}
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium">Adaugă slide-uri</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6">Slide-uri existente</h2>
            {slides.length === 0 ? (
              <p className="text-gray-500">Nu sunt slide-uri. Se vor folosi cele implicite (photo1-3.jpg).</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {slides.map(s => (
                  <div key={s.id} className="relative group">
                    <img src={s.image_url} alt="slide" className="w-full h-32 object-cover rounded-lg" />
                    <button onClick={() => deleteSlide(s.id)} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Șterge</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== PROFIL ===== */}
      {tab === 'photographer' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">Profil Fotograf</h2>
          <form onSubmit={savePhotographer} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Nume</label><input type="text" value={photographer.name} onChange={(e) => setPhotographer({ ...photographer, name: e.target.value })} className="w-full p-3 border rounded-xl" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Bio</label><textarea value={photographer.bio} onChange={(e) => setPhotographer({ ...photographer, bio: e.target.value })} className="w-full p-3 border rounded-xl" rows="4" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label><input type="text" value={photographer.instagram} onChange={(e) => setPhotographer({ ...photographer, instagram: e.target.value })} className="w-full p-3 border rounded-xl" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label><input type="text" value={photographer.facebook} onChange={(e) => setPhotographer({ ...photographer, facebook: e.target.value })} className="w-full p-3 border rounded-xl" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label><input type="text" value={photographer.tiktok} onChange={(e) => setPhotographer({ ...photographer, tiktok: e.target.value })} className="w-full p-3 border rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label><input type="text" value={photographer.phone} onChange={(e) => setPhotographer({ ...photographer, phone: e.target.value })} className="w-full p-3 border rounded-xl" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="text" value={photographer.email} onChange={(e) => setPhotographer({ ...photographer, email: e.target.value })} className="w-full p-3 border rounded-xl" /></div>
            </div>
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium">Salvează Profilul</button>
          </form>
        </div>
      )}
    </div>
  );
}