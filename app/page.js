'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

  // Данные фотографа
  const photographer = {
    name: 'Ursachi Igor',
    brand: 'Creative Studio',
    bio: 'Sunt Igor, fondator al Creative Studio, și de peste un deceniu mă dedic artei fotografice. Cu expertiză în nunți, evenimente private, precum și sesiuni foto personale și de familie, transform fiecare moment într-o poveste vizuală captivantă. Dorința mea este să evoluez constant, să-mi perfecționez tehnica și să ofer clienților mei imagini care să dăinuiască peste timp. Fiecare ședință este o oportunitate de a crea amintiri prețioase și de a construi relații bazate pe încredere, pasiune și satisfacție deplină.',
    location: 'Activează în Chișinău; disponibil să călătorească în întreaga Moldovă și Europa.',
    phone: '069434361',
    email: 'creative.studio.mda@gmail.com',
    instagram: 'https://www.instagram.com/creative.studio.photography',
    facebook: 'https://www.facebook.com/creativestudio.moldova',
    tiktok: 'https://www.tiktok.com/@creativestudiomoldova',
  };

  // Загружаем свадьбы
  useEffect(() => {
    const fetchWeddings = async () => {
      const { data } = await supabase.from('weddings').select('*').eq('is_hidden', false).order('created_at', { ascending: false });
      setWeddings(data || []);
    };
    fetchWeddings();
  }, []);

  // Плавный скролл (Lenis уже в layout, но на всякий случай можно использовать)
  // GSAP ScrollTrigger для каскадных анимаций
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Появление секций
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el, 
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      });

      // Каскад для карточек свадеб
      gsap.utils.toArray('.wedding-card').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, delay: i * 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: el.parentElement, start: 'top 80%' }
          }
        );
      });

      // Параллакс на hero
      gsap.to('.hero-bg', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-slider',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    return () => ctx.revert();
  }, []);

  // Логика слайдера
  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Лайтбокс
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

  // Открытие свадьбы
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
      {/* Навигация */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-b border-gray-100">
        <a href="#" className="flex items-center">
          <Image src="/logo.png" alt="Creative Studio" width={150} height={50} className="h-10 w-auto" priority />
        </a>
        <ul className={`flex gap-8 list-none ${menuOpen ? 'max-md:flex-col max-md:absolute max-md:top-16 max-md:right-0 max-md:bg-white max-md:p-8 max-md:shadow-lg max-md:rounded-b-xl' : 'max-md:hidden'}`}>
          <li><a href="#despre" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Despre</a></li>
          <li><a href="#weddings" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Nunți</a></li>
          <li><a href="#photographer" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Fotograf</a></li>
          <li><a href="#servicii" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Servicii</a></li>
          <li><a href="#contact" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Contact</a></li>
        </ul>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className="w-6 h-0.5 bg-black"></span>
          <span className="w-6 h-0.5 bg-black"></span>
          <span className="w-6 h-0.5 bg-black"></span>
        </button>
      </nav>

      {/* Hero Слайдер с параллаксом */}
      <section className="relative h-[80vh] overflow-hidden hero-slider">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${slide.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50 hero-bg"></div>
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
        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Despre noi</h2>
        <p className="text-gray-500 mb-12 reveal">De peste 5 ani creăm amintiri de neuitat pentru cupluri din Moldova și România.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-8 rounded-2xl reveal"><h3 className="font-bold mb-2">Experiență</h3><p className="text-gray-500">Peste 300 de nunți filmate</p></div>
          <div className="bg-gray-50 p-8 rounded-2xl reveal"><h3 className="font-bold mb-2">Stil unic</h3><p className="text-gray-500">Luminos, natural, emoționant</p></div>
          <div className="bg-gray-50 p-8 rounded-2xl reveal"><h3 className="font-bold mb-2">Termene rapide</h3><p className="text-gray-500">Fotografii gata în 2 luni</p></div>
        </div>
      </section>

      {/* Свадьбы */}
      <section id="weddings" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Nunțile noastre</h2>
        <p className="text-gray-500 mb-12 reveal">Alege o nuntă pentru a vedea toate fotografiile</p>
        
        {weddings.length === 0 ? (
          <p className="text-gray-500">Nicio nuntă adăugată încă.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weddings.map((w) => (
              <div key={w.id} className="cursor-pointer group wedding-card" onClick={() => openWedding(w.id)}>
                <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:scale-105 transition duration-300">
                  <img src={w.cover_image} alt={w.title} className="w-full h-64 object-cover" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{w.title}</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {loadingWedding ? <p className="text-gray-600">Se încarcă...</p> : photos.length === 0 ? <p className="text-gray-600">Nicio fotografie în această nuntă.</p> : photos.map((photo, i) => (
              <div key={photo.id} className="cursor-pointer" onClick={() => openLightbox(i)}>
                <img src={photo.image_url} alt={photo.caption || 'Fotografie'} className="w-full h-48 object-cover rounded-lg shadow-sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Лайтбокс с крестиком */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button 
            className="absolute top-4 right-4 text-black text-4xl hover:text-gray-600 transition z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            aria-label="Închide"
          >
            &times;
          </button>
          <button className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-200 text-black text-3xl p-3 rounded-full hover:bg-gray-300 transition" onClick={(e) => { e.stopPropagation(); prevImage(); }}>‹</button>
          <img src={photos[currentPhotoIndex].image_url} alt="Fotografie mărită" className="max-w-[90%] max-h-[90%] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-200 text-black text-3xl p-3 rounded-full hover:bg-gray-300 transition" onClick={(e) => { e.stopPropagation(); nextImage(); }}>›</button>
        </div>
      )}

      {/* Фотограф */}
      <section id="photographer" className="py-20 px-6 max-w-6xl mx-auto text-center border-t border-gray-100">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 reveal">Fotograful</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="w-64 h-64 rounded-full overflow-hidden shadow-lg reveal">
            <img src="/logo.png" alt={photographer.name} className="w-full h-full object-cover" />
          </div>
          <div className="text-left max-w-2xl reveal">
            <h3 className="text-2xl font-bold mb-2">{photographer.name} <span className="text-gray-500 font-normal">| {photographer.brand}</span></h3>
            <p className="text-gray-600 mb-4">{photographer.bio}</p>
            <p className="text-gray-500 mb-6">📍 {photographer.location}</p>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <a href={`tel:${photographer.phone}`} className="text-blue-600 hover:underline">📞 {photographer.phone}</a>
              <a href={`mailto:${photographer.email}`} className="text-blue-600 hover:underline">✉️ {photographer.email}</a>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              {photographer.instagram && <a href={photographer.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Instagram</a>}
              {photographer.facebook && <a href={photographer.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook</a>}
              {photographer.tiktok && <a href={photographer.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TikTok</a>}
            </div>
          </div>
        </div>
      </section>

      {/* Пакеты услуг */}
      <section id="servicii" className="py-20 px-6 max-w-6xl mx-auto text-center bg-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Pachete Disponibile</h2>
        <p className="text-gray-500 mb-12 reveal">Alege pachetul perfect pentru nunta ta</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Essential Story */}
          <div className="bg-gray-50 p-8 rounded-2xl shadow-lg reveal border border-gray-200">
            <h3 className="text-xl font-bold mb-2">Essential Story</h3>
            <p className="text-gray-500 text-sm mb-4">Documentare completă a zilei dvs. Speciale</p>
            <div className="text-3xl font-bold text-gray-800 mb-6">1.000 € <span className="text-sm font-normal text-gray-500">de la</span></div>
            <ul className="text-left text-gray-600 space-y-2 text-sm">
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> 1 fotograf profesionist</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Galerie online privată</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Editare JPG profesională</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Min. 800 foto editate</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Livrare link + USB</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Termen livrare: 5 luni</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="text-red-400">✘</span> Preview 48h</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="text-red-400">✘</span> Video scurt reels/story</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="text-red-400">✘</span> Album foto premium</li>
            </ul>
            <a href="#contact" className="block mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full font-medium">Rezervă</a>
          </div>

          {/* Eternal Story */}
          <div className="bg-white p-8 rounded-2xl shadow-xl reveal border-2 border-yellow-500 relative">
            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Cel Mai Popular</span>
            <h3 className="text-xl font-bold mb-2">Eternal Story</h3>
            <p className="text-gray-500 text-sm mb-4">Pachetul cel mai solicitat — acoperire completă</p>
            <div className="text-3xl font-bold text-gray-800 mb-6">1.300 € <span className="text-sm font-normal text-gray-500">de la</span></div>
            <ul className="text-left text-gray-600 space-y-2 text-sm">
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Fotograf + asistent</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Preview 48h</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Video scurt reels/story</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Editare JPG profesională</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Min. 1.000 foto editate</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Galerie online privată</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Livrare link + USB</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Termen livrare: 3 luni</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="text-red-400">✘</span> Album foto premium</li>
            </ul>
            <a href="#contact" className="block mt-6 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-full font-medium">Rezervă</a>
          </div>

          {/* Heirloom Story */}
          <div className="bg-gray-50 p-8 rounded-2xl shadow-lg reveal border border-gray-200">
            <h3 className="text-xl font-bold mb-2">Heirloom Story</h3>
            <p className="text-gray-500 text-sm mb-4">Documentare premium — o moștenire de familie</p>
            <div className="text-3xl font-bold text-gray-800 mb-6">2.200 € <span className="text-sm font-normal text-gray-500">de la</span></div>
            <ul className="text-left text-gray-600 space-y-2 text-sm">
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> 2 Fotografi + asistent</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Preview 48h</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Video scurt reels/story</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Sesiune foto after wedding</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Album foto premium inclus</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Min. 1.200 foto editate</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Galerie online privată</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Livrare link + USB</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Editare JPG profesională</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Termen livrare: 2 luni</li>
            </ul>
            <a href="#contact" className="block mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full font-medium">Rezervă</a>
          </div>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          <p>Termen livrare: 5/3/2 luni · Durată maximă: 16 ore · Livrare urgență disponibilă · Republica Moldova</p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Contactează-ne</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-8">
          <div className="bg-gray-50 p-8 rounded-2xl reveal">
            <h3 className="font-bold mb-4">Date de contact</h3>
            <p className="text-gray-500 mb-2">Telefon: {photographer.phone}</p>
            <p className="text-gray-500 mb-2">Email: {photographer.email}</p>
            <p className="text-gray-500">Locație: Chișinău, Moldova</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg reveal">
            <form onSubmit={(e) => { e.preventDefault(); alert('Mulțumim! Cererea a fost trimisă.'); }}>
              <input type="text" placeholder="Numele tău" className="w-full mb-4 p-3 border border-gray-200 rounded-lg" required />
              <input type="tel" placeholder="Telefon" className="w-full mb-4 p-3 border border-gray-200 rounded-lg" required />
              <input type="text" placeholder="ZZ.LL.AAAA" className="w-full mb-4 p-3 border border-gray-200 rounded-lg" />
              <textarea rows="4" placeholder="Povestea nunții tale" className="w-full mb-4 p-3 border border-gray-200 rounded-lg"></textarea>
              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-full font-medium">Trimite cererea</button>
            </form>
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