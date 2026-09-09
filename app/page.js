'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase';
import { useLanguage } from './LanguageContext';

// Встроенный компонент прелоадера
function Preloader() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHide(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center bg-white transition-opacity duration-700 ${hide ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">
          Creative <span className="text-blue-500">Studio</span>
        </h1>
        <p className="text-gray-400 mt-2 animate-pulse">Fotografie & Videografie</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { language, changeLanguage } = useLanguage();
  const [weddings, setWeddings] = useState([]);
  const [selectedWedding, setSelectedWedding] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loadingWedding, setLoadingWedding] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const t = {
    ro: {
      nav: { despre: 'Despre', nunti: 'Nunți', fotograf: 'Fotograf', servicii: 'Servicii', contact: 'Contact' },
      hero: [
        { title: 'Povestea voastră în fiecare cadru' },
        { title: 'Momente unice, capturate cu eleganță' },
        { title: 'Emoții transformate în artă' },
      ],
      despre: { title: 'Despre noi', subtitle: 'De peste 5 ani creăm amintiri de neuitat pentru cupluri din Moldova și România.', stats: [{ title: 'Experiență', text: 'Peste 300 de nunți filmate' }, { title: 'Stil unic', text: 'Luminos, natural, emoționant' }, { title: 'Termene rapide', text: 'Fotografii gata în 2 luni' }] },
      weddings: { title: 'Nunțile noastre', subtitle: 'Alege o nuntă pentru a vedea toate fotografiile', empty: 'Nicio nuntă adăugată încă.', loading: 'Se încarcă...', noPhotos: 'Nicio fotografie în această nuntă.' },
      photographer: { title: 'Fotograful', name: 'Ursachi Igor', brand: 'Creative Studio', bio: 'Sunt Igor, fondator al Creative Studio, și de peste un deceniu mă dedic artei fotografice. Cu expertiză în nunți, evenimente private, precum și sesiuni foto personale și de familie, transform fiecare moment într-o poveste vizuală captivantă.', location: 'Activează în Chișinău; disponibil să călătorească în întreaga Moldovă și Europa.' },
      services: { title: 'Pachete Disponibile', subtitle: 'Alege pachetul perfect pentru nunta ta', packages: [
        { name: 'Essential Story', price: '1.000 €', currency: 'de la', features: ['1 fotograf profesionist', 'Galerie online privată', 'Editare JPG profesională', 'Min. 800 foto editate', 'Livrare link + USB', 'Termen livrare: 5 luni'], notIncluded: ['Preview 48h'] },
        { name: 'Eternal Story', price: '1.300 €', currency: 'de la', features: ['Fotograf + asistent', 'Preview 48h', 'Min. 1.000 foto editate', 'Termen livrare: 3 luni'], notIncluded: ['Album foto premium'] },
        { name: 'Heirloom Story', price: '2.200 €', currency: 'de la', features: ['2 Fotografi + asistent', 'Preview 48h', 'Sesiune foto after wedding', 'Album foto premium inclus', 'Min. 1.200 foto editate', 'Termen livrare: 2 luni'], notIncluded: [] },
      ] },
      contact: { title: 'Contactează-ne', subtitle: 'Pentru rezervări și informații suplimentare ne contactați' },
    },
    en: {
      nav: { despre: 'About', nunti: 'Weddings', fotograf: 'Photographer', servicii: 'Services', contact: 'Contact' },
      hero: [
        { title: 'Your story in every frame' },
        { title: 'Unique moments captured with elegance' },
        { title: 'Emotions turned into art' },
      ],
      despre: { title: 'About us', subtitle: 'For over 5 years we have been creating unforgettable memories for couples from Moldova and Romania.', stats: [{ title: 'Experience', text: 'Over 300 weddings filmed' }, { title: 'Unique style', text: 'Bright, natural, emotional' }, { title: 'Fast turnaround', text: 'Photos ready in 2 months' }] },
      weddings: { title: 'Our weddings', subtitle: 'Choose a wedding to see all photos', empty: 'No weddings added yet.', loading: 'Loading...', noPhotos: 'No photos in this wedding.' },
      photographer: { title: 'Photographer', name: 'Ursachi Igor', brand: 'Creative Studio', bio: 'I am Igor, founder of Creative Studio, and for over a decade I have been dedicated to the art of photography. With expertise in weddings, private events, as well as personal and family photo sessions, I transform every moment into a captivating visual story.', location: 'Based in Chisinau; available to travel throughout Moldova and Europe.' },
      services: { title: 'Available packages', subtitle: 'Choose the perfect package for your wedding', packages: [
        { name: 'Essential Story', price: '1.000 €', currency: 'from', features: ['1 professional photographer', 'Private online gallery', 'Professional JPG editing', 'Min. 800 edited photos', 'Delivery link + USB', 'Delivery time: 5 months'], notIncluded: ['48h preview'] },
        { name: 'Eternal Story', price: '1.300 €', currency: 'from', features: ['Photographer + assistant', '48h preview', 'Min. 1.000 edited photos', 'Delivery time: 3 months'], notIncluded: ['Premium album'] },
        { name: 'Heirloom Story', price: '2.200 €', currency: 'from', features: ['2 Photographers + assistant', '48h preview', 'After wedding photo session', 'Premium album included', 'Min. 1.200 edited photos', 'Delivery time: 2 months'], notIncluded: [] },
      ] },
      contact: { title: 'Contact us', subtitle: 'For reservations and additional information, contact us' },
    },
  };

  const currentLang = t[language] || t.ro;
  const slides = currentLang.hero.map((item, index) => ({ bg: `/photo${index + 1}.jpg`, title: item.title }));

  const photographer = {
    name: currentLang.photographer.name,
    brand: currentLang.photographer.brand,
    bio: currentLang.photographer.bio,
    location: currentLang.photographer.location,
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
    <>
      <Preloader />
      <main>
        {/* Навигация */}
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex justify-between items-center h-16">
              <div className="flex-1 flex justify-start">
                <a href="#" className="flex items-center">
                  <Image src="/logo.png" alt="Creative Studio" width={150} height={50} className="h-10 w-auto" priority />
                </a>
              </div>
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                <ul className="flex gap-8 list-none whitespace-nowrap">
                  <li><a href="#despre" className="text-sm uppercase tracking-wide text-gray-900 hover:text-blue-600 font-medium">{currentLang.nav.despre}</a></li>
                  <li><a href="#weddings" className="text-sm uppercase tracking-wide text-gray-900 hover:text-blue-600 font-medium">{currentLang.nav.nunti}</a></li>
                  <li><a href="#photographer" className="text-sm uppercase tracking-wide text-gray-900 hover:text-blue-600 font-medium">{currentLang.nav.fotograf}</a></li>
                  <li><a href="#servicii" className="text-sm uppercase tracking-wide text-gray-900 hover:text-blue-600 font-medium">{currentLang.nav.servicii}</a></li>
                  <li><a href="#contact" className="text-sm uppercase tracking-wide text-gray-900 hover:text-blue-600 font-medium">{currentLang.nav.contact}</a></li>
                </ul>
              </div>
              <div className="flex-1 flex justify-end items-center gap-4">
                <div className="hidden md:flex items-center bg-gray-100 rounded-full p-1 transition-all duration-300">
                  <button onClick={() => changeLanguage('ro')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${language === 'ro' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>RO</button>
                  <button onClick={() => changeLanguage('en')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${language === 'en' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>EN</button>
                </div>
                <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 rounded-md text-gray-900 hover:text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Мобильное меню */}
        <div className={`fixed inset-0 z-[999] transition-all duration-300 ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMenuOpen(false)}></div>
          <div className={`absolute top-0 right-0 h-full w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full p-6 pt-20 relative">
              <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 text-3xl text-gray-900 hover:text-blue-600">&times;</button>
              <a href="#" className="flex items-center justify-center mb-8">
                <Image src="/logo.png" alt="Creative Studio" width={150} height={50} className="h-10 w-auto" />
              </a>
              <ul className="flex flex-col gap-6 text-center list-none">
                <li><a href="#despre" onClick={() => setMenuOpen(false)} className="text-xl font-semibold text-gray-900 hover:text-blue-600">{currentLang.nav.despre}</a></li>
                <li><a href="#weddings" onClick={() => setMenuOpen(false)} className="text-xl font-semibold text-gray-900 hover:text-blue-600">{currentLang.nav.nunti}</a></li>
                <li><a href="#photographer" onClick={() => setMenuOpen(false)} className="text-xl font-semibold text-gray-900 hover:text-blue-600">{currentLang.nav.fotograf}</a></li>
                <li><a href="#servicii" onClick={() => setMenuOpen(false)} className="text-xl font-semibold text-gray-900 hover:text-blue-600">{currentLang.nav.servicii}</a></li>
                <li><a href="#contact" onClick={() => setMenuOpen(false)} className="text-xl font-semibold text-gray-900 hover:text-blue-600">{currentLang.nav.contact}</a></li>
              </ul>
              <div className="flex justify-center gap-4 mt-8">
                <div className="flex items-center bg-gray-100 rounded-full p-1">
                  <button onClick={() => changeLanguage('ro')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${language === 'ro' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>RO</button>
                  <button onClick={() => changeLanguage('en')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${language === 'en' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'}`}>EN</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="relative h-[80vh] overflow-hidden">
          {slides.map((slide, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url(${slide.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                <a href="#weddings" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition">{currentLang.nav.nunti}</a>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentLang.despre.title}</h2>
          <p className="text-gray-500 mb-12">{currentLang.despre.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentLang.despre.stats.map((stat, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="font-bold mb-2">{stat.title}</h3>
                <p className="text-gray-500">{stat.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Свадьбы */}
        <section id="weddings" className="py-20 px-6 max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentLang.weddings.title}</h2>
          <p className="text-gray-500 mb-12">{currentLang.weddings.subtitle}</p>
          {weddings.length === 0 ? (
            <p className="text-gray-500">{currentLang.weddings.empty}</p>
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
              {loadingWedding ? <p className="text-gray-600">{currentLang.weddings.loading}</p> : photos.length === 0 ? <p className="text-gray-600">{currentLang.weddings.noPhotos}</p> : photos.map((photo, i) => (
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
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{currentLang.photographer.title}</h2>
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
              {/* Иконки соцсетей */}
              <div className="flex gap-4 mt-6">
                <a href={photographer.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center transition-transform hover:scale-110" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href={photographer.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center transition-transform hover:scale-110" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href={photographer.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black flex items-center justify-center transition-transform hover:scale-110" aria-label="TikTok">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Услуги */}
        <section id="servicii" className="py-20 px-6 max-w-6xl mx-auto text-center bg-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentLang.services.title}</h2>
          <p className="text-gray-500 mb-12">{currentLang.services.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {currentLang.services.packages.map((pkg, idx) => (
              <div key={idx} className={`bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200 ${idx === 1 ? 'border-2 border-yellow-500 relative bg-white shadow-xl' : ''}`}>
                {idx === 1 && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Popular</span>
                )}
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <div className="text-3xl font-bold text-gray-800 mb-6">{pkg.price} <span className="text-sm font-normal text-gray-500">{pkg.currency}</span></div>
                <ul className="text-left text-gray-600 space-y-2 text-sm">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2"><span className="text-green-500">✔</span> {feature}</li>
                  ))}
                  {pkg.notIncluded.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-400"><span className="text-red-400">✘</span> {feature}</li>
                  ))}
                </ul>
                <a href="#contact" className="block mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full font-medium">{currentLang.nav.contact}</a>
              </div>
            ))}
          </div>
        </section>

        {/* Контакты */}
        <section id="contact" className="py-20 px-6 max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentLang.contact.title}</h2>
          <p className="text-gray-500 mb-12">{currentLang.contact.subtitle}</p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl text-left">
              <h3 className="font-bold mb-4">{currentLang.contact.title}</h3>
              <p className="text-gray-500 mb-2">📞 <a href={`tel:${photographer.phone}`} className="text-blue-600 hover:underline">{photographer.phone}</a></p>
              <p className="text-gray-500 mb-2">✉️ <a href={`mailto:${photographer.email}`} className="text-blue-600 hover:underline">{photographer.email}</a></p>
              <p className="text-gray-500 mb-2">📍 {photographer.location}</p>
              {/* Иконки соцсетей */}
              <div className="flex gap-4 mt-4">
                <a href={photographer.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center transition-transform hover:scale-110" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href={photographer.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center transition-transform hover:scale-110" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href={photographer.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black flex items-center justify-center transition-transform hover:scale-110" aria-label="TikTok">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Футер */}
        <footer className="bg-gray-50 py-8 text-center text-gray-500">
          <p>© 2026 Creative Studio. Toate drepturile rezervate.</p>
        </footer>

        {/* Плавающие кнопки для мобильных */}
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 md:hidden">
          <a href={`tel:${photographer.phone}`} className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
          <a href={`https://wa.me/${photographer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </a>
        </div>
      </main>
    </>
  );
}