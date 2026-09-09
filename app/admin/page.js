'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Простой компонент Toast для уведомлений
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
      {message}
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('weddings');
  const [toast, setToast] = useState('');

  // Состояния для свадеб
  const [weddings, setWeddings] = useState([]);
  const [selectedWedding, setSelectedWedding] = useState(null);
  const [title, setTitle] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  // Состояния для профиля фотографа
  const [photographer, setPhotographer] = useState({
    name: '',
    bio: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    phone: '',
    email: ''
  });

  // Проверка авторизации
  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') setAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'secret123') {
      localStorage.setItem('adminAuth', 'true');
      setAuthenticated(true);
    } else {
      setToast('Parolă greșită!');
    }
  };

  // Загрузка данных при входе
  useEffect(() => {
    if (!authenticated) return;
    loadWeddings();
    loadPhotographer();
  }, [authenticated]);

  const loadWeddings = async () => {
    const { data } = await supabase.from('weddings').select('*').order('created_at', { ascending: false });
    setWeddings(data || []);
  };

  const loadPhotographer = async () => {
    const { data } = await supabase.from('photographer').select('*').limit(1);
    if (data && data[0]) setPhotographer(data[0]);
  };

  // Drag & Drop для файлов
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
      setPreviews((prev) => [
        ...prev,
        ...droppedFiles.map((file) => URL.createObjectURL(file))
      ]);
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [
      ...prev,
      ...selected.map((file) => URL.createObjectURL(file))
    ]);
  };

  // Создание свадьбы
  const createWedding = async (e) => {
    e.preventDefault();
    if (!title || !coverFile) {
      setToast('Completează numele și alege o poză de copertă!');
      return;
    }
    setLoading(true);
    const fileName = `${Date.now()}_${coverFile.name}`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, coverFile);
    if (uploadError) {
      setToast('Eroare la upload: ' + uploadError.message);
      setLoading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
    await supabase.from('weddings').insert({ title, cover_image: urlData.publicUrl });
    setToast('Nunta a fost creată!');
    setTitle('');
    setCoverFile(null);
    loadWeddings();
    setLoading(false);
  };

  // Загрузка фото в свадьбу (drag & drop)
  const uploadPhotos = async (e) => {
    e.preventDefault();
    if (!files.length || !selectedWedding) {
      setToast('Alege sau trage fotografii!');
      return;
    }
    setLoading(true);
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('photos').upload(fileName, file);
      if (error) {
        setToast('Eroare la upload: ' + error.message);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
      await supabase.from('photos').insert({ wedding_id: selectedWedding, image_url: urlData.publicUrl, caption });
    }
    setToast('Fotografiile au fost adăugate!');
    setFiles([]);
    setPreviews([]);
    setCaption('');
    setLoading(false);
  };

  // Сохранение профиля фотографа
  const savePhotographer = async (e) => {
    e.preventDefault();
    await supabase.from('photographer').upsert(photographer);
    setToast('Profil salvat!');
    loadPhotographer();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-3 border rounded-lg"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg">
            Intră
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panou</h1>
        <button
          onClick={() => {
            localStorage.removeItem('adminAuth');
            setAuthenticated(false);
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Deconectare
        </button>
      </div>

      {/* Вкладки */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('weddings')}
          className={`px-4 py-2 rounded-lg font-medium ${
            tab === 'weddings' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Nunți
        </button>
        <button
          onClick={() => setTab('photographer')}
          className={`px-4 py-2 rounded-lg font-medium ${
            tab === 'photographer' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Profil
        </button>
      </div>

      {tab === 'weddings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Создание свадьбы */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Adaugă Nuntă</h2>
            <form onSubmit={createWedding}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Numele cuplului"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Poză de copertă</label>
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="w-full" />
              </div>
              <button type="submit" disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded-lg w-full">
                Adaugă
              </button>
            </form>
          </div>

          {/* Список свадеб + загрузка фото */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Nunțile existente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weddings.map((w) => (
                <div
                  key={w.id}
                  className={`border rounded-lg p-4 ${
                    selectedWedding === w.id ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img src={w.cover_image} alt={w.title} className="w-full h-40 object-cover rounded mb-2" />
                  <p className="font-semibold">{w.title}</p>
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => setSelectedWedding(w.id)}
                      className="text-blue-500 text-sm"
                    >
                      Încarcă foto
                    </button>
                    <button
                      onClick={async () => {
                        await supabase.from('weddings').delete().eq('id', w.id);
                        loadWeddings();
                      }}
                      className="text-red-500 text-sm"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Drag & Drop загрузка */}
            {selectedWedding && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold mb-2">
                  Încarcă foto în: {weddings.find((w) => w.id === selectedWedding)?.title}
                </h3>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center mb-4"
                >
                  Trage fotografiile aici sau
                  <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="ml-2" />
                </div>
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {previews.map((url, idx) => (
                      <img key={idx} src={url} alt="preview" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Descriere (ex: Primul dans)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <button
                  onClick={uploadPhotos}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
                >
                  Upload
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'photographer' && (
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Profil Fotograf</h2>
          <form onSubmit={savePhotographer}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Nume"
                value={photographer.name}
                onChange={(e) => setPhotographer({ ...photographer, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Bio"
                value={photographer.bio}
                onChange={(e) => setPhotographer({ ...photographer, bio: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows="4"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Instagram URL"
                value={photographer.instagram}
                onChange={(e) => setPhotographer({ ...photographer, instagram: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Facebook URL"
                value={photographer.facebook}
                onChange={(e) => setPhotographer({ ...photographer, facebook: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="TikTok URL"
                value={photographer.tiktok}
                onChange={(e) => setPhotographer({ ...photographer, tiktok: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Telefon"
                value={photographer.phone}
                onChange={(e) => setPhotographer({ ...photographer, phone: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Email"
                value={photographer.email}
                onChange={(e) => setPhotographer({ ...photographer, email: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full">
              Salvează
            </button>
          </form>
        </div>
      )}
    </div>
  );
}