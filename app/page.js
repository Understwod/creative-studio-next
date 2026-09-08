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

  // Загружаем список свадеб
  useEffect(() => {
    const fetchWeddings = async () => {
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Eroare la încărcarea nunților:', error);
        // Если таблица пустая или не существует, показываем пустой массив
        setWeddings([]);
      } else {
        setWeddings(data || []);
      }
    };
    fetchWeddings();
  }, []);

  // Загружаем фото конкретной свадьбы
  const openWedding = async (id) => {
    setLoadingWedding(true);
    setSelectedWedding(id);
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('wedding_id', id)
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setPhotos(data || []);
    setLoadingWedding(false);
    setLightboxOpen(false); // Закрыть лайтбокс, если был открыт
  };

  const closeWedding = () => {
    setSelectedWedding(null);
    setPhotos([]);
  };

  // Слайдер
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
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

  // Анимации появления
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

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
          <li><a href="#servicii" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Servicii</a></li>
          <li><a href="#contact" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Contact</a></li>
        </ul>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className="w-6 h-0.5 bg-black"></span>
          <span className="w-6 h-0.5 bg-black"></span>
          <span className="w-6 h-0.5 bg-black"></span>
        </button>
      </nav>

      {/* Hero Слайдер */}
      <section className="relative h-[80vh] overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${slide.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
              <a href="#weddings" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition">Vezi nunțile</a>
            </div>
          </div>
        ))}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full ${i === currentSlide ? 'bg-blue-500' : 'bg-white/60'}`}
            />
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

      {/* Секция со списком свадеб */}
      <section id="weddings" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Nunțile noastre</h2>
        <p className="text-gray-500 mb-12 reveal">Alege o nuntă pentru a vedea toate fotografiile</p>
        
        {weddings.length === 0 ? (
          <p className="text-gray-500">Nicio nuntă adăugată încă.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weddings.map((w) => (
              <div key={w.id} className="cursor-pointer group" onClick={() => openWedding(w.id)}>
                <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:scale-105 transition duration-300">
                  <img src={w.cover_image} alt={w.title} className="w-full h-64 object-cover" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{w.title}</h3>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Если выбрана свадьба - показываем её фотографии */}
      {selectedWedding && (
        <div className="fixed inset-0 bg-black/95 z-[9998] overflow-y-auto">
          <div className="sticky top-0 bg-black/90 backdrop-blur z-10 flex justify-between items-center p-6">
            <h2 className="text-2xl font-bold text-white">{weddings.find(w => w.id === selectedWedding)?.title}</h2>
            <button onClick={closeWedding} className="text-white text-3xl">&times;</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            {loadingWedding ? (
              <p className="text-white">Se încarcă...</p>
            ) : photos.length === 0 ? (
              <p className="text-white">Nicio fotografie în această nuntă.</p>
            ) : (
              photos.map((photo, i) => (
                <div key={photo.id} className="cursor-pointer" onClick={() => openLightbox(i)}>
                  <img src={photo.image_url} alt={photo.caption || 'Fotografie'} className="w-full h-48 object-cover rounded-lg" />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Лайтбокс для фото внутри выбранной свадьбы */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/20 text-white text-3xl p-3 rounded-full" onClick={(e) => { e.stopPropagation(); prevImage(); }}>‹</button>
          <img src={photos[currentPhotoIndex].image_url} alt="Fotografie mărită" className="max-w-[90%] max-h-[90%] rounded-lg" onClick={(e) => e.stopPropagation()} />
          <button className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/20 text-white text-3xl p-3 rounded-full" onClick={(e) => { e.stopPropagation(); nextImage(); }}>›</button>
        </div>
      )}

      {/* Servicii */}
      <section id="servicii" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Servicii</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-50 p-8 rounded-2xl reveal">
            <h3 className="font-bold mb-2">Essential</h3>
            <div className="text-blue-500 text-2xl font-bold">9 000 lei <span className="text-sm font-normal text-gray-500">/ 5 ore</span></div>
            <ul className="mt-4 text-left text-gray-500 space-y-2">
              <li>1 fotograf</li>
              <li>150 fotografii</li>
              <li>Videoclip scurt</li>
            </ul>
            <a href="#contact" className="block mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full font-medium">Rezervă</a>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl reveal border-2 border-blue-500">
            <h3 className="font-bold mb-2">Signature</h3>
            <div className="text-blue-500 text-2xl font-bold">15 000 lei <span className="text-sm font-normal text-gray-500">/ 10 ore</span></div>
            <ul className="mt-4 text-left text-gray-500 space-y-2">
              <li>2 fotografi + videograf</li>
              <li>500 fotografii + film</li>
              <li>Album tipărit</li>
            </ul>
            <a href="#contact" className="block mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full font-medium">Rezervă</a>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl reveal">
            <h3 className="font-bold mb-2">Luxury</h3>
            <div className="text-blue-500 text-2xl font-bold">25 000 lei <span className="text-sm font-normal text-gray-500">/ toată ziua</span></div>
            <ul className="mt-4 text-left text-gray-500 space-y-2">
              <li>3 fotografi + 2 videografi</li>
              <li>1000+ fotografii + film</li>
              <li>Design personalizat</li>
            </ul>
            <a href="#contact" className="block mt-6 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-full font-medium">Rezervă</a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Contactează-ne</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-8">
          <div className="bg-gray-50 p-8 rounded-2xl reveal">
            <h3 className="font-bold mb-4">Date de contact</h3>
            <p className="text-gray-500 mb-2">Telefon: +373 60 000 000</p>
            <p className="text-gray-500">Email: hello@creativestudio.md</p>
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
          <a href="#" className="text-blue-500 hover:underline">Instagram</a> | 
          <a href="#" className="text-blue-500 hover:underline">Facebook</a> | 
          <a href="tel:+37360000000" className="text-blue-500 hover:underline">+373 60 000 000</a>
        </p>
      </footer>
    </main>
  );
}