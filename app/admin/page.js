'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') setAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'secret123') { // Замените на свой пароль
      localStorage.setItem('adminAuth', 'true');
      setAuthenticated(true);
    } else {
      alert('Parolă greșită!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setAuthenticated(false);
  };

  const loadPhotos = async () => {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    setPhotos(data || []);
  };

  useEffect(() => {
    if (authenticated) loadPhotos();
  }, [authenticated]);

  const uploadPhoto = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);

    if (uploadError) {
      alert('Eroare la încărcare: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
    const imageUrl = urlData.publicUrl;

    const { error: insertError } = await supabase.from('gallery').insert({ image_url: imageUrl, caption });

    if (insertError) {
      alert('Eroare la salvare: ' + insertError.message);
    } else {
      alert('Foto adăugată!');
      setCaption('');
      setFile(null);
      loadPhotos();
    }
    setLoading(false);
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
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg">Deconectare</button>
      </div>

      <form onSubmit={uploadPhoto} className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Alege fișier</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full p-2 border rounded-lg" required />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Descriere</label>
          <input type="text" placeholder="Ex: Nunta Maria & Ion" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>
        <button type="submit" disabled={loading} className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50">
          {loading ? 'Se încarcă...' : 'Adaugă foto'}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Fotografii existente</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative rounded-lg overflow-hidden shadow">
            <img src={photo.image_url} alt={photo.caption || 'Foto'} className="w-full h-32 object-cover" />
            <p className="text-sm p-2 bg-white">{photo.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}