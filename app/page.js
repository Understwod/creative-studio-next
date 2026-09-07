'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [images, setImages] = useState([]);

  const fallbackImages = [
    { src: '/photo1.jpg', alt: 'Nuntă 1', full: '/photo1.jpg' },
    { src: '/photo2.jpg', alt: 'Nuntă 2', full: '/photo2.jpg' },
    { src: '/photo3.jpg', alt: 'Nuntă 3', full: '/photo3.jpg' },
    { src: '/photo4.jpg', alt: 'Nuntă 4', full: '/photo4.jpg' },
    { src: '/photo5.jpg', alt: 'Nuntă 5', full: '/photo5.jpg' },
  ];

  const slides = [
    { bg: '/photo1.jpg', title: 'Povestea voastră în fiecare cadru' },
    { bg: '/photo2.jpg', title: 'Momente unice, capturate cu eleganță' },
    { bg: '/photo3.jpg', title: 'Emoții transformate în artă' },
  ];

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error(error);
        setImages(fallbackImages);
      } else {
        if (data && data.length > 0) {
          const mapped = data.map(item => ({
            src: item.image_url,
            alt: item.caption || 'Nuntă',
            full: item.image_url
          }));
          setImages(mapped);
        } else {
          setImages(fallbackImages);
        }
      }
    };
    fetchImages();
  }, []);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function openLightbox(index) {
    setCurrentImage(index);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function nextImage() {
    setCurrentImage((prev) => (prev + 1) % images.length);
  }

  function prevImage() {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen]);

  let touchStartX = 0;
  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
  }
  function handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) nextImage();
    if (touchEndX - touchStartX > 50) prevImage();
  }

  return (
    <main>
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur border-b border-gray-100">
        <a href="#" className="flex items-center">
          <Image src="/logo.png" alt="Creative Studio" width={150} height={50} className="h-10 w-auto" priority />
        </a>
        <ul className={`flex gap-8 list-none ${menuOpen ? 'max-md:flex-col max-md:absolute max-md:top-16 max-md:right-0 max-md:bg-white max-md:p-8 max-md:shadow-lg max-md:rounded-b-xl' : 'max-md:hidden'}`}>
          <li><a href="#despre" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Despre</a></li>
          <li><a href="#galerie" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Galerie</a></li>
          <li><a href="#servicii" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Servicii</a></li>
          <li><a href="#contact" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-wide text-gray-500 hover:text-blue-500">Contact</a></li>
        </ul>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className="w-6 h-0.5 bg-black"></span>
          <span className="w-6 h-0.5 bg-black"></span>
          <span className="w-6 h-0.5 bg-black"></span>
        </button>
      </nav>

      <section className="relative h-[80vh] overflow-hidden">
        {slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url(${slide.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
              <a href="#galerie" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition">Vezi galeria</a>
            </div>
          </div>
        ))}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full ${i === currentSlide ? 'bg-blue-500' : 'bg-white/60'}`} />
          ))}
        </div>
      </section>

      <section id="despre" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Despre noi</h2>
        <p className="text-gray-500 mb-12 reveal">De peste 5 ani creăm amintiri de neuitat pentru cupluri din Moldova și România.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-8 rounded-2xl reveal"><h3 className="font-bold mb-2">Experiență</h3><p className="text-gray-500">Peste 300 de nunți filmate</p></div>
          <div className="bg-gray-50 p-8 rounded-2xl reveal"><h3 className="font-bold mb-2">Stil unic</h3><p className="text-gray-500">Luminos, natural, emoționant</p></div>
          <div className="bg-gray-50 p-8 rounded-2xl reveal"><h3 className="font-bold mb-2">Termene rapide</h3><p className="text-gray-500">Fotografii gata în 2 luni</p></div>
        </div>
      </section>

      <section id="galerie" className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Galerie</h2>
        <p className="text-gray-500 mb-12 reveal">Cele mai frumoase momente surprinse</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl cursor-pointer group reveal" onClick={() => openLightbox(i)}>
              <Image src={img.src} alt={img.alt} width={600} height={400} className="w-full h-48 object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                <span className="text-white text-sm uppercase tracking-wider">Vezi</span>
              </div>
            </div>
          ))}
        </div>
      </section>

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

      <footer className="bg-gray-50 py-8 text-center text-gray-500">
        <p>© 2026 Creative Studio. Toate drepturile rezervate.</p>
        <p className="mt-2">
          <a href="#" className="text-blue-500 hover:underline">Instagram</a> | <a href="#" className="text-blue-500 hover:underline">Facebook</a> | <a href="tel:+37360000000" className="text-blue-500 hover:underline">+373 60 000 000</a>
        </p>
      </footer>

      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center" onClick={closeLightbox}>
          <button className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/50 text-white text-3xl p-3 rounded-full" onClick={(e) => { e.stopPropagation(); prevImage(); }}>‹</button>
          <Image src={images[currentImage].full} alt={images[currentImage].alt} width={1200} height={800} className="max-w-[95%] max-h-[95%] rounded-lg" onClick={(e) => e.stopPropagation()} />
          <button className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/50 text-white text-3xl p-3 rounded-full" onClick={(e) => { e.stopPropagation(); nextImage(); }}>›</button>
        </div>
      )}
    </main>
  );
}