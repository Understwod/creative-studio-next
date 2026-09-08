'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [weddings, setWeddings] = useState([]);
  const [selectedWedding, setSelectedWedding] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loadingWedding, setLoadingWedding] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const slides = [
    { bg: '/photo1.jpg', title: 'Povestea voastră în fiecare cadru' },
    { bg: '/photo2.jpg', title: 'Momente unice, capturate cu eleganță' },
    { bg: '/photo3.jpg', title: 'Emoții transformate în artă' },
  ];

  const photographer = {
    name: 'Ursachi Igor',
    brand: 'Creative Studio',
    bio: 'Sunt Igor, fondator al Creative Studio, și de peste un deceniu mă dedic artei fotografice. Cu expertiză în nunți, evenimente private, precum și sesiuni foto personale și de familie, transform fiecare moment într-o poveste vizuală captivantă.',
    location: 'Activează în Chișinău; disponibil să călătorească în întreaga Moldovă și Europa.',
    phone: '069434361',
    email: 'creative.studio.mda@gmail.com',
    instagram: 'https://www.instagram.com/creative.studio.photography',
    facebook: 'https://www.facebook.com/creativestudio.moldova',
    tiktok: 'https://www.tiktok.com/@creativestudiomoldova',
  };

  useEffect(() => {
    const fetchWeddings = async () => {
      const { data } = await supabase.from('weddings').select('*').eq('is_hidden', false).order('created_at', { ascending: false });
      setWeddings(data || []);
    };
    fetchWeddings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  function openLightbox(index) {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  }

  function nextImage() {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  }

  function prevImage() {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, photos.length]);

  const openWedding = async (id) => {
    setLoadingWedding(true);
    setSelectedWedding(id);
    const { data } = await supabase.from('photos').select('*').eq('wedding_id', id).order('created_at', { ascending: false });
    setPhotos(data || []);
    setLoadingWedding(false);
    setLightboxOpen(false);
  };

  const closeWedding = () => {
    setSelectedWedding(null);
    setPhotos([]);
  };

  return (
    <main>
      {/* Навигация с логотипом по центру и меню в центре */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип слева (на десктопе) */}
            <div className="flex-1 flex justify-start">
              <a href="#" className="flex items-center">
                <Image src="/logo.png" alt="Creative Studio" width={150} height={50} className="h-10 w-auto" priority />
              </a>
            </div>

            {/* Меню по центру (только на десктопе) */}
            <div className="hidden md:flex flex-1 justify-center">
              <ul className="flex gap-8 list-none">
                <li><a href="#despre" className="text-sm uppercase tracking-wide text-gray-900 hover:text-blue-600 font-medium">Despre</a></li>
                <li><a href="#weddings" className="text-sm uppercase tracking-wide text-gray-900 hover:text-blue-600 font-medium">Nunți</a></li>
                <li><a href="#photographer" className="text-sm uppercase tracking-wide text-gray-900 hover:text-blue-600 font-medium">Fotograf</a></li>
                <li><a href="#servicii" className="text-sm uppercase tracking-wide text-gray-900 hover:text-blue-600 font-medium">Servicii</a></li>
                <li><a href="#contact" className="text-sm uppercase tracking-wide text-gray-900 hover:text-blue-600 font-medium">Contact</a></li>
              </ul>
            </div>

            {/* Бургер справа (только на мобильном) */}
            <div className="flex-1 flex justify-end md:hidden">
              <button onClick={() => setMenuOpen(true)} className="p-2 rounded-md text-gray-900 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобильное меню - выезжающее справа с затемнением */}
      <div className={`fixed inset-0 z-[999] transition-all duration-300 ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Затемнение */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMenuOpen(false)}
        ></div>
        
        {/* Само меню (панель справа) */}
        <div className={`absolute top-0 right-0 h-full w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full p-6 pt-20 relative">
            <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 text-3xl text-gray-900 hover:text-blue-600">&times;</button>
            <a href="#" className="flex items-center justify-center mb-8">
              <Image src="/logo.png" alt="Creative Studio" width={150} height={50} className="h-10 w-auto" />
            </a>
            <ul className="flex flex-col gap-6 text-center list-none">
              <li><a href="#despre" onClick={() => setMenuOpen(false)} className="text-xl font-semibold text-gray-900 hover:text-blue-600">Despre</a></li>
              <li><a href="#weddings" onClick={() => setMenuOpen(false)} className="text-xl font-semibold text-gray-900 hover:text-blue-600">Nunți</a></li>
              <li><a href="#photographer" onClick={() => setMenuOpen(false)} className="text-xl font-semibold text-gray-900 hover:text-blue-600">Fotograf</a></li>
              <li><a href="#servicii" onClick={() => setMenuOpen(false)} className="text-xl font-semibold text-gray-900 hover:text-blue-600">Servicii</a></li>
              <li><a href="#contact" onClick={() => setMenuOpen(false)} className="text-xl font-semibold text-gray-900 hover:text-blue-600">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hero Слайдер */}
      <section className="relative h-[80vh] overflow-hidden">
        {slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${slide.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
              <a href="#weddings" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition">Vezi nunțile</a>
            </div>
          </div>
        ))}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full ${i === currentSlide ? 'bg-blue-500' : 'bg-white/60'}`} />
          ))}
        </div>
      </section>

      {/* Despre */}
      <section id="despre" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Despre noi</h2>
        <p className="text-gray-500 mb-12">De peste 5 ani creăm amintiri de neuitat pentru cupluri din Moldova și România.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-8 rounded-2xl"><h3 className="font-bold mb-2">Experiență</h3><p className="text-gray-500">Peste 300 de nunți filmate</p></div>
          <div className="bg-gray-50 p-8 rounded-2xl"><h3 className="font-bold mb-2">Stil unic</h3><p className="text-gray-500">Luminos, natural, emoționant</p></div>
          <div className="bg-gray-50 p-8 rounded-2xl"><h3 className="font-bold mb-2">Termene rapide</h3><p className="text-gray-500">Fotografii gata în 2 luni</p></div>
        </div>
      </section>

      {/* Свадьбы - исправлена сетка для вертикальных фото */}
      <section id="weddings" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Nunțile noastre</h2>
        <p className="text-gray-500 mb-12">Alege o nuntă pentru a vedea toate fotografiile</p>
        {weddings.length === 0 ? (
          <p className="text-gray-500">Nicio nuntă adăugată încă.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {weddings.map((w) => (
              <div key={w.id} className="cursor-pointer group" onClick={() => openWedding(w.id)}>
                <div className="relative overflow-hidden rounded-xl shadow-lg aspect-[4/5]">
                  <Image src={w.cover_image} alt={w.title} width={800} height={1000} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <span className="text-white text-xl font-bold px-4 text-center">{w.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Открытая свадьба */}
      {selectedWedding && (
        <div className="fixed inset-0 bg-white z-[9998] overflow-y-auto">
          <div className="sticky top-0 bg-white/95 backdrop-blur z-10 flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-black">{weddings.find(w => w.id === selectedWedding)?.title}</h2>
            <button onClick={closeWedding} className="text-black text-3xl">&times;</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
            {loadingWedding ? <p className="text-gray-600">Se încarcă...</p> : photos.length === 0 ? <p className="text-gray-600">Nicio fotografie în această nuntă.</p> : photos.map((photo, i) => (
              <div key={photo.id} className="cursor-pointer aspect-[4/5] overflow-hidden rounded-lg" onClick={() => openLightbox(i)}>
                <Image src={photo.image_url} alt={photo.caption || 'Fotografie'} width={600} height={750} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Лайтбокс */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-black text-4xl hover:text-gray-600 transition z-10" onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}>&times;</button>
          <button className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-200 text-black text-3xl p-3 rounded-full hover:bg-gray-300 transition" onClick={(e) => { e.stopPropagation(); prevImage(); }}>‹</button>
          <Image src={photos[currentPhotoIndex].image_url} alt={photos[currentPhotoIndex].caption || 'Fotografie mărită'} width={1600} height={2000} className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-200 text-black text-3xl p-3 rounded-full hover:bg-gray-300 transition" onClick={(e) => { e.stopPropagation(); nextImage(); }}>›</button>
        </div>
      )}

      {/* Фотограф */}
      <section id="photographer" className="py-20 px-6 max-w-6xl mx-auto text-center border-t border-gray-100">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Fotograful</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="w-64 h-64 rounded-full overflow-hidden shadow-lg">
            <Image src="/logo.png" alt={photographer.name} width={256} height={256} className="w-full h-full object-cover" />
          </div>
          <div className="text-left max-w-2xl">
            <h3 className="text-2xl font-bold mb-2">{photographer.name} <span className="text-gray-500 font-normal">| {photographer.brand}</span></h3>
            <p className="text-gray-600 mb-4">{photographer.bio}</p>
            <p className="text-gray-500 mb-6">📍 {photographer.location}</p>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <a href={`tel:${photographer.phone}`} className="text-blue-600 hover:underline">📞 {photographer.phone}</a>
              <a href={`mailto:${photographer.email}`} className="text-blue-600 hover:underline">✉️ {photographer.email}</a>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              <a href={photographer.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Instagram</a>
              <a href={photographer.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook</a>
              <a href={photographer.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TikTok</a>
            </div>
          </div>
        </div>
      </section>

      {/* Пакеты услуг */}
      <section id="servicii" className="py-20 px-6 max-w-6xl mx-auto text-center bg-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Pachete Disponibile</h2>
        <p className="text-gray-500 mb-12">Alege pachetul perfect pentru nunta ta</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold mb-2">Essential Story</h3>
            <div className="text-3xl font-bold text-gray-800 mb-6">1.000 € <span className="text-sm font-normal text-gray-500">de la</span></div>
            <ul className="text-left text-gray-600 space-y-2 text-sm">
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> 1 fotograf profesionist</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Galerie online privată</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Editare JPG profesională</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Min. 800 foto editate</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Livrare link + USB</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Termen livrare: 5 luni</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="text-red-400">✘</span> Preview 48h</li>
            </ul>
            <a href="#contact" className="block mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full font-medium">Rezervă</a>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-yellow-500 relative">
            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Cel Mai Popular</span>
            <h3 className="text-xl font-bold mb-2">Eternal Story</h3>
            <div className="text-3xl font-bold text-gray-800 mb-6">1.300 € <span className="text-sm font-normal text-gray-500">de la</span></div>
            <ul className="text-left text-gray-600 space-y-2 text-sm">
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Fotograf + asistent</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Preview 48h</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Min. 1.000 foto editate</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Termen livrare: 3 luni</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="text-red-400">✘</span> Album foto premium</li>
            </ul>
            <a href="#contact" className="block mt-6 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-full font-medium">Rezervă</a>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold mb-2">Heirloom Story</h3>
            <div className="text-3xl font-bold text-gray-800 mb-6">2.200 € <span className="text-sm font-normal text-gray-500">de la</span></div>
            <ul className="text-left text-gray-600 space-y-2 text-sm">
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> 2 Fotografi + asistent</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Preview 48h</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Sesiune foto after wedding</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Album foto premium inclus</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Min. 1.200 foto editate</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Termen livrare: 2 luni</li>
            </ul>
            <a href="#contact" className="block mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full font-medium">Rezervă</a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Contactează-ne</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="bg-gray-50 p-8 rounded-2xl text-left">
            <h3 className="font-bold mb-4">Date de contact</h3>
            <p className="text-gray-500 mb-2">📞 <a href={`tel:${photographer.phone}`} className="text-blue-600 hover:underline">{photographer.phone}</a></p>
            <p className="text-gray-500 mb-2">✉️ <a href={`mailto:${photographer.email}`} className="text-blue-600 hover:underline">{photographer.email}</a></p>
            <p className="text-gray-500 mb-2">📍 {photographer.location}</p>
            <div className="flex gap-4 mt-4">
              <a href={photographer.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Instagram</a>
              <a href={photographer.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook</a>
              <a href={photographer.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TikTok</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 text-center text-gray-500">
        <p>© 2026 Creative Studio. Toate drepturile rezervate.</p>
        <p className="mt-2">
          <a href={photographer.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Instagram</a> | 
          <a href={photographer.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Facebook</a> | 
          <a href={`tel:${photographer.phone}`} className="text-blue-500 hover:underline">{photographer.phone}</a>
        </p>
      </footer>
    </main>
  );
}