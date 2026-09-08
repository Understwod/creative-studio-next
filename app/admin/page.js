'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [weddings, setWeddings] = useState([]);
  const [selectedWedding, setSelectedWedding] = useState(null);
  const [title, setTitle] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);

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

  const loadPhotos = async (weddingId) => {
    const { data } = await supabase.from('photos').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: false });
    setPhotos(data || []);
  };

  useEffect(() => {
    if (authenticated) loadWeddings();
  }, [authenticated]);

  useEffect(() => {
    if (selectedWedding) loadPhotos(selectedWedding);
  }, [selectedWedding]);

  const createWedding = async (e) => {
    e.preventDefault();
    if (!title || !coverFile) return;
    setLoading(true);

    const coverFileName = `${Date.now()}_${coverFile.name}`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(coverFileName, coverFile);
    if (uploadError) { alert(uploadError.message); setLoading(false); return; }

    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(coverFileName);
    const { error: insertError } = await supabase.from('weddings').insert({ title, cover_image: urlData.publicUrl });

    if (insertError) alert(insertError.message);
    else { alert('Nunta a fost creată!'); setTitle(''); setCoverFile(null); loadWeddings(); }
    setLoading(false);
  };

  const uploadPhotos = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !selectedWedding) return;
    setLoading(true);

    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);
      if (uploadError) { alert(uploadError.message); setLoading(false); return; }

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
      await supabase.from('photos').insert({ wedding_id: selectedWedding, image_url: urlData.publicUrl, caption });
    }

    alert('Fotografiile au fost adăugate!');
    setFiles([]);
    setCaption('');
    loadPhotos(selectedWedding);
    setLoading(false);
  };

  const toggleHidden = async (id, currentValue) => {
    const { error } = await supabase.from('weddings').update({ is_hidden: !currentValue }).eq('id', id);
    if (error) alert(error.message);
    else loadWeddings();
  };

  const deleteWedding = async (id) => {
    if (confirm('Sigur vrei să ștergi această nuntă?')) {
      await supabase.from('weddings').delete().eq('id', id);
      loadWeddings();
      if (selectedWedding === id) { setSelectedWedding(null); setPhotos([]); }
    }
  };

  const deletePhoto = async (photoId) => {
    if (confirm('Sigur vrei să ștergi această fotografie?')) {
      await supabase.from('photos').delete().eq('id', photoId);
      loadPhotos(selectedWedding);
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
          <button type="submit" disabled={loading} className="bg-green-500 text-white px-6 py-2 rounded-lg disabled:opacity-50">{loading ? 'Se încarcă...' : '+ Adaugă Nuntă'}</button>
        </form>
      </div>

      {/* Список свадеб */}
      <h2 className="text-xl font-semibold mb-4">Nunțile existente</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {weddings.map(w => (
          <div key={w.id} className={`p-4 border rounded-lg cursor-pointer ${selectedWedding === w.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => setSelectedWedding(w.id)}>
            <img src={w.cover_image} alt={w.title} className="w-full h-24 object-cover rounded mb-2" />
            <p className="font-semibold text-sm text-center">{w.title}</p>
            <div className="flex justify-between mt-2">
              <button onClick={(e) => { e.stopPropagation(); toggleHidden(w.id, w.is_hidden); }} className={`text-xs px-2 py-1 rounded ${w.is_hidden ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                {w.is_hidden ? 'Arată' : 'Ascunde'}
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteWedding(w.id); }} className="text-red-500 text-xs px-2 py-1">Șterge</button>
            </div>
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
              <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files))} className="w-full p-2 border rounded-lg" required />
            </div>
            <div className="mb-4">
              <input type="text" placeholder="Descriere pentru toate (ex: Primul dans)" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <button type="submit" disabled={loading} className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50">{loading ? 'Se încarcă...' : 'Adaugă fotografiile'}</button>
          </form>

          {/* Список фото с удалением */}
          <h4 className="text-md font-semibold mt-6 mb-2">Fotografiile adăugate:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group">
                <img src={photo.image_url} alt={photo.caption || 'Foto'} className="w-full h-24 object-cover rounded" />
                <button onClick={() => deletePhoto(photo.id)} className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Șterge</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}