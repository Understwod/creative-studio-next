'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminPage() {
  // Статус входа и пароль (простое решение, можно потом усложнить)
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState('weddings'); // weddings, photographer, settings

  // Данные для свадеб
  const [weddings, setWeddings] = useState([]);
  const [selectedWedding, setSelectedWedding] = useState(null);
  const [title, setTitle] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]); // Для предпросмотра
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  // Для drag & drop
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Данные фотографа
  const [photographer, setPhotographer] = useState({
    name: '',
    bio: '',
    instagram: '',
    facebook: '',
    tiktok: '',
  });

  // Toast уведомления
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Логин (пока оставляем как есть, безопасность потом)
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'secret123') {
      localStorage.setItem('adminAuth', 'true');
      setAuthenticated(true);
    } else {
      showToast('Parolă greșită!', 'error');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (authenticated) loadWeddings();
  }, [authenticated]);

  const loadWeddings = async () => {
    const { data } = await supabase.from('weddings').select('*').order('created_at', { ascending: false });
    setWeddings(data || []);
  };

  // Создание новой свадьбы
  const createWedding = async (e) => {
    e.preventDefault();
    if (!title || !coverFile) {
      showToast('Te rugăm să adaugi numele și coperta!', 'error');
      return;
    }

    setLoading(true);
    const coverFileName = `${Date.now()}_${coverFile.name}`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(coverFileName, coverFile);

    if (uploadError) {
      showToast(uploadError.message, 'error');
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(coverFileName);
    const { error: insertError } = await supabase.from('weddings').insert({ title, cover_image: urlData.publicUrl });

    if (insertError) {
      showToast(insertError.message, 'error');
    } else {
      showToast('Nunta a fost creată!');
      setTitle('');
      setCoverFile(null);
      loadWeddings();
    }
    setLoading(false);
  };

  // Загрузка фотографий (Drag-and-Drop)
  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    setFiles(fileArray);
    // Создаём предпросмотры
    const urls = fileArray.map(file => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const uploadPhotos = async (e) => {
    e.preventDefault();
    if (!files.length || !selectedWedding) {
      showToast('Alege o nuntă și selectează fotografii', 'error');
      return;
    }

    setLoading(true);
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);
      if (uploadError) { showToast(uploadError.message, 'error'); setLoading(false); return; }

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
      await supabase.from('photos').insert({ wedding_id: selectedWedding, image_url: urlData.publicUrl, caption });
    }

    showToast('Fotografiile au fost adăugate!');
    setFiles([]);
    setPreviews([]);
    setCaption('');
    setLoading(false);
  };

  // Удаление фото
  const deletePhoto = async (photoId) => {
    await supabase.from('photos').delete().eq('id', photoId);
    loadPhotosForWedding(selectedWedding);
  };

  // Загрузка фото для конкретной свадьбы
  const loadPhotosForWedding = async (weddingId) => {
    const { data } = await supabase.from('photos').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: false });
    setPhotos(data || []);
  };

  // Состояние для фото
  const [photos, setPhotos] = useState([]);

  const openWedding = async (id) => {
    setSelectedWedding(id);
    await loadPhotosForWedding(id);
  };

  const closeWedding = () => {
    setSelectedWedding(null);
    setPhotos([]);
  };

  // Удаление свадьбы
  const deleteWedding = async (id) => {
    await supabase.from('weddings').delete().eq('id', id);
    if (selectedWedding === id) setSelectedWedding(null);
    loadWeddings();
  };

  // Скрытие/показ свадьбы
  const toggleHidden = async (id, currentValue) => {
    await supabase.from('weddings').update({ is_hidden: !currentValue }).eq('id', id);
    loadWeddings();
  };

  // Редактирование названия
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (wedding) => {
    setEditingId(wedding.id);
    setEditTitle(wedding.title);
  };

  const saveEdit = async (id) => {
    await supabase.from('weddings').update({ title: editTitle }).eq('id', id);
    setEditingId(null);
    loadWeddings();
    showToast('Nume actualizat!');
  };

  // Сортировка (кнопки вверх/вниз)
  const moveWedding = async (index, direction) => {
    const newOrder = [...weddings];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setWeddings(newOrder);
    // Здесь можно отправить новый порядок в базу данных
    // ... (логика сохранения порядка в Supabase может быть добавлена отдельно)
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <input type="password" placeholder="Parolă" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-3 border rounded-lg" required />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium">Intră</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Боковая навигация (Sidebar) */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col p-4">
        <div className="flex items-center justify-center mb-8">
          <img src="/logo.png" alt="Creative Studio" className="h-10 w-auto" />
        </div>
        <nav className="space-y-2">
          <button onClick={() => setActiveSection('weddings')} className={`w-full text-left p-3 rounded-lg transition ${activeSection === 'weddings' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <span className="font-medium">💍 Nunți</span>
          </button>
          <button onClick={() => setActiveSection('photographer')} className={`w-full text-left p-3 rounded-lg transition ${activeSection === 'photographer' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <span className="font-medium">📸 Fotograf</span>
          </button>
          <button onClick={() => setActiveSection('settings')} className={`w-full text-left p-3 rounded-lg transition ${activeSection === 'settings' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
            <span className="font-medium">⚙️ Setări</span>
          </button>
        </nav>
        <button onClick={handleLogout} className="mt-auto bg-red-100 text-red-600 p-3 rounded-lg font-medium hover:bg-red-200 transition">
          Deconectare
        </button>
      </aside>

      {/* Основной контент */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Toast уведомления */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            {toast.message}
          </div>
        )}

        {/* СЕКЦИЯ: СВАДЬБЫ */}
        {activeSection === 'weddings' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Gestionare Nunți</h1>
            
            {/* Создание свадьбы */}
            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <h2 className="text-lg font-semibold mb-4">Adaugă Nuntă Nouă</h2>
              <form onSubmit={createWedding}>
                <div className="mb-4">
                  <input type="text" placeholder="Numele cuplului (ex: Maria & Ion)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border rounded-lg" required />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-600">Alege poză de copertă</label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
                    onClick={() => coverInputRef.current.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                  >
                    <input type="file" ref={coverInputRef} accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="hidden" />
                    {coverFile ? (
                      <img src={URL.createObjectURL(coverFile)} alt="Cover" className="max-h-32 mx-auto rounded-lg" />
                    ) : (
                      <p className="text-gray-500">Trage o poză aici sau click pentru a alege</p>
                    )}
                  </div>
                </div>
                <button type="submit" disabled={loading} className="bg-green-500 text-white px-6 py-2 rounded-lg disabled:opacity-50">
                  {loading ? 'Se încarcă...' : '+ Adaugă Nuntă'}
                </button>
              </form>
            </div>

            {/* Список свадеб с сортировкой */}
            <h2 className="text-lg font-semibold mb-4">Nunțile existente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {weddings.map((w, index) => (
                <div key={w.id} className={`bg-white p-4 rounded-xl shadow cursor-pointer transition ${selectedWedding === w.id ? 'border-2 border-blue-500' : 'border border-gray-200'}`} onClick={() => openWedding(w.id)}>
                  <img src={w.cover_image} alt={w.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                  
                  {/* Редактирование названия */}
                  {editingId === w.id ? (
                    <div className="mb-2">
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-2 border rounded" />
                      <button onClick={(e) => { e.stopPropagation(); saveEdit(w.id); }} className="bg-blue-500 text-white text-xs px-3 py-1 rounded mt-2">Salvează</button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-xs text-gray-500 ml-2">Anulează</button>
                    </div>
                  ) : (
                    <p className="font-semibold text-center mb-2">{w.title}</p>
                  )}

                  <div className="flex justify-between items-center text-xs">
                    {/* Кнопки сортировки */}
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); moveWedding(index, -1); }} className="bg-gray-200 p-1 rounded hover:bg-gray-300">↑</button>
                      <button onClick={(e) => { e.stopPropagation(); moveWedding(index, 1); }} className="bg-gray-200 p-1 rounded hover:bg-gray-300">↓</button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleHidden(w.id, w.is_hidden); }} className={`px-2 py-1 rounded ${w.is_hidden ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                        {w.is_hidden ? 'Ascunde' : 'Arată'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); startEdit(w); }} className="bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        ✏️
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteWedding(w.id); }} className="bg-red-100 text-red-600 px-2 py-1 rounded">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Загрузка фото в выбранную свадьбу */}
            {selectedWedding && (
              <div className="bg-white p-6 rounded-xl shadow mb-8">
                <h2 className="text-lg font-semibold mb-4">Încarcă foto în: {weddings.find(w => w.id === selectedWedding)?.title}</h2>
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition mb-4"
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const dropped = e.dataTransfer.files; handleFiles(dropped); }}
                >
                  <input type="file" ref={fileInputRef} accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
                  <p className="text-gray-500">Trage și lasă aici mai multe fotografii (sau click pentru a alege)</p>
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {previews.map((url, i) => (
                      <img key={i} src={url} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                    ))}
                  </div>
                )}

                <div className="mb-4">
                  <input type="text" placeholder="Descriere pentru toate (ex: Primul dans)" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full p-3 border rounded-lg" />
                </div>
                <button onClick={uploadPhotos} disabled={loading} className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50">
                  {loading ? 'Se încarcă...' : 'Adaugă fotografiile'}
                </button>
              </div>
            )}

            {/* Показать фото внутри выбранной свадьбы */}
            {selectedWedding && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">Fotografiile adăugate în această nuntă</h2>
                <div className="grid grid-cols-4 gap-4">
                  {photos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <img src={photo.image_url} alt={photo.caption || 'Foto'} className="w-full h-32 object-cover rounded-lg" />
                      <button onClick={() => deletePhoto(photo.id)} className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* СЕКЦИЯ: ФОТОГРАФ */}
        {activeSection === 'photographer' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Despre Fotograf</h1>
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Nume</label>
                <input type="text" value={photographer.name} onChange={(e) => setPhotographer({...photographer, name: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Descriere</label>
                <textarea value={photographer.bio} onChange={(e) => setPhotographer({...photographer, bio: e.target.value})} rows="4" className="w-full p-3 border rounded-lg"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Instagram</label>
                  <input type="text" value={photographer.instagram} onChange={(e) => setPhotographer({...photographer, instagram: e.target.value})} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Facebook</label>
                  <input type="text" value={photographer.facebook} onChange={(e) => setPhotographer({...photographer, facebook: e.target.value})} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">TikTok</label>
                  <input type="text" value={photographer.tiktok} onChange={(e) => setPhotographer({...photographer, tiktok: e.target.value})} className="w-full p-3 border rounded-lg" />
                </div>
              </div>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg">Salvează</button>
            </div>
          </div>
        )}

        {/* СЕКЦИЯ: НАСТРОЙКИ */}
        {activeSection === 'settings' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Setări Generale</h1>
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Email de contact</label>
                <input type="email" className="w-full p-3 border rounded-lg" />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Telefon</label>
                <input type="tel" className="w-full p-3 border rounded-lg" />
              </div>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg">Salvează</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}