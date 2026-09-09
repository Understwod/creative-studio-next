'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// Современные SVG-иконки
const Icon = {
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  ),
  Close: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5-11L1.5 12l5.25 5.25m7.5-11l-5.25 5.25" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  )
};

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {message}
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('weddings');
  const [toast, setToast] = useState('');

  const [weddings, setWeddings] = useState([]);
  const [selectedWedding, setSelectedWedding] = useState(null);
  const [title, setTitle] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const [photographer, setPhotographer] = useState({
    name: '',
    bio: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    phone: '',
    email: ''
  });

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

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
      setPreviews((prev) => [...prev, ...droppedFiles.map((file) => URL.createObjectURL(file))]);
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...selected.map((file) => URL.createObjectURL(file))]);
  };

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

  const savePhotographer = async (e) => {
    e.preventDefault();
    await supabase.from('photographer').upsert(photographer);
    setToast('Profil salvat!');
    loadPhotographer();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 mt-2">Introdu parola pentru a continua</p>
          </div>
          <input
            type="password"
            placeholder="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all">
            Intră
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panou</h1>
        <button
          onClick={() => {
            localStorage.removeItem('adminAuth');
            setAuthenticated(false);
          }}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Icon.Logout />
          Deconectare
        </button>
      </div>

      <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl shadow-sm">
        <button
          onClick={() => setTab('weddings')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
            tab === 'weddings' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Nunți
        </button>
        <button
          onClick={() => setTab('photographer')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
            tab === 'photographer' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Profil
        </button>
      </div>

      {tab === 'weddings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Icon.Plus />
              </span>
              Adaugă Nuntă
            </h2>
            <form onSubmit={createWedding}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Numele cuplului</label>
                <input
                  type="text"
                  placeholder="ex: Maria & Ion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Poză de copertă</label>
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="w-full p-2 border border-gray-300 rounded-xl" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Icon.Plus />
                Adaugă
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6">Nunțile existente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {weddings.map((w) => (
                <div
                  key={w.id}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedWedding === w.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => setSelectedWedding(w.id)}
                >
                  <img src={w.cover_image} alt={w.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                  <p className="font-semibold text-gray-900">{w.title}</p>
                  <div className="flex justify-between mt-3">
                    <span className="text-sm text-blue-500">Încarcă foto</span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await supabase.from('weddings').delete().eq('id', w.id);
                        loadWeddings();
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Icon.Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {selectedWedding && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold mb-4 text-gray-900">
                  Încarcă foto în: {weddings.find((w) => w.id === selectedWedding)?.title}
                </h3>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-blue-300 bg-white p-8 rounded-xl text-center cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Icon.Upload />
                    <span>Trage fotografiile aici sau</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" id="fileInput" />
                    <label htmlFor="fileInput" className="text-blue-500 font-medium cursor-pointer underline">alege din calculator</label>
                  </div>
                </div>
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {previews.map((url, idx) => (
                      <img key={idx} src={url} alt="preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Descriere (ex: Primul dans)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                  />
                  <button
                    onClick={uploadPhotos}
                    disabled={loading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon.Upload />
                    Upload
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'photographer' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Icon.Edit />
            </span>
            Profil Fotograf
          </h2>
          <form onSubmit={savePhotographer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nume</label>
              <input
                type="text"
                value={photographer.name}
                onChange={(e) => setPhotographer({ ...photographer, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={photographer.bio}
                onChange={(e) => setPhotographer({ ...photographer, bio: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows="4"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input type="text" value={photographer.instagram} onChange={(e) => setPhotographer({ ...photographer, instagram: e.target.value })} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input type="text" value={photographer.facebook} onChange={(e) => setPhotographer({ ...photographer, facebook: e.target.value })} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                <input type="text" value={photographer.tiktok} onChange={(e) => setPhotographer({ ...photographer, tiktok: e.target.value })} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                <input type="text" value={photographer.phone} onChange={(e) => setPhotographer({ ...photographer, phone: e.target.value })} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="text" value={photographer.email} onChange={(e) => setPhotographer({ ...photographer, email: e.target.value })} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              <Icon.Save />
              Salvează Profilul
            </button>
          </form>
        </div>
      )}
    </div>
  );
}