'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [weddings, setWeddings] = useState([]);
  const [selectedWedding, setSelectedWedding] = useState(null);
  
  // Состояния для создания свадьбы
  const [title, setTitle] = useState('');
  const [coverFile, setCoverFile] = useState(null);

  // Состояния для загрузки нескольких фото
  const [files, setFiles] = useState([]); // Теперь это массив!
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') setAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'secret123') {
      localStorage.setItem('adminAuth', 'true');
      setAuthenticated(true);
    } else {
      alert('Parolă greșită!');
    }
  };

  const loadWeddings = async () => {
    const { data } = await supabase.from('weddings').select('*').order('created_at', { ascending: false });
    setWeddings(data || []);
  };

  useEffect(() => {
    if (authenticated) loadWeddings();
  }, [authenticated]);

  // Создание новой свадьбы
  const createWedding = async (e) => {
    e.preventDefault();
    if (!title || !coverFile) {
      alert('Te rugăm să introduci numele și să selectezi o poză de copertă!');
      return;
    }

    setLoading(true);

    const coverFileName = `${Date.now()}_${coverFile.name}`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(coverFileName, coverFile);

    if (uploadError) {
      alert('Eroare la încărcarea copertei: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(coverFileName);
    const coverUrl = urlData.publicUrl;

    const { error: insertError } = await supabase.from('weddings').insert({ title, cover_image: coverUrl });

    if (insertError) {
      alert('Eroare la crearea nunții: ' + insertError.message);
    } else {
      alert('Nunta a fost creată!');
      setTitle('');
      setCoverFile(null);
      loadWeddings();
    }
    setLoading(false);
  };

  // Загрузка НЕСКОЛЬКИХ фото в выбранную свадьбу
  const uploadPhotos = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !selectedWedding) return;
    setLoading(true);

    // Проходим циклом по каждому выбранному файлу
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);
      if (uploadError) { alert(uploadError.message); setLoading(false); return; }

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
      const { error: insertError } = await supabase.from('photos').insert({
        wedding_id: selectedWedding,
        image_url: urlData.publicUrl,
        caption: caption || '' // Одну подпись можно применить ко всем сразу
      });

      if (insertError) { alert(insertError.message); setLoading(false); return; }
    }

    alert('Fotografiile au fost adăugate!');
    setFiles([]); // Очищаем выбранные файлы
    setCaption('');
    setLoading(false);
  };

  // Удаление свадьбы
  const deleteWedding = async (id) => {
    if (confirm('Sigur vrei să ștergi această nuntă?')) {
      await supabase.from('weddings').delete().eq('id', id);
      loadWeddings();
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <input type="password" placeholder="Parolă" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-3 border rounded-lg" required />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg">Intră</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panou</h1>
        <button onClick={() => { localStorage.removeItem('adminAuth'); setAuthenticated(false); }} className="bg-red-500 text-white px-4 py-2 rounded-lg">Deconectare</button>
      </div>

      {/* Создание свадьбы */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Adaugă Nuntă Nouă</h2>
        <form onSubmit={createWedding}>
          <div className="mb-4">
            <input type="text" placeholder="Numele cuplului (ex: Maria & Ion)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-lg" required />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Alege poză de copertă</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="w-full p-2 border rounded-lg" required />
          </div>
          <button type="submit" disabled={loading} className="bg-green-500 text-white px-6 py-2 rounded-lg disabled:opacity-50">
            {loading ? 'Se încarcă...' : '+ Adaugă Nuntă'}
          </button>
        </form>
      </div>

      {/* Список свадеб */}
      <h2 className="text-xl font-semibold mb-4">Nunțile existente</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {weddings.map(w => (
          <div key={w.id} className={`p-4 border rounded-lg cursor-pointer ${selectedWedding === w.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => setSelectedWedding(w.id)}>
            <img src={w.cover_image} alt={w.title} className="w-full h-24 object-cover rounded mb-2" />
            <p className="font-semibold text-sm text-center">{w.title}</p>
            <button onClick={(e) => { e.stopPropagation(); deleteWedding(w.id); }} className="text-red-500 text-xs mt-2 w-full">Șterge</button>
          </div>
        ))}
      </div>

      {/* Загрузка фото в выбранную свадьбу */}
      {selectedWedding && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Încarcă foto în: {weddings.find(w => w.id === selectedWedding)?.title}</h3>
          <form onSubmit={uploadPhotos}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Selectează mai multe fotografii (ține apăsat Ctrl sau Shift)</label>
              {/* ДОБАВЛЕН АТРИБУТ multiple */}
              <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))} className="w-full p-2 border rounded-lg" required />
            </div>
            <div className="mb-4">
              <input type="text" placeholder="Descriere pentru toate (ex: Primul dans)" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <button type="submit" disabled={loading} className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50">
              {loading ? 'Se încarcă...' : 'Adaugă fotografiile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}