'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LenisProvider({ children }) {
  useEffect(() => {
    // Определяем мобильное устройство
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return; // На мобильных не используем Lenis, там нативный скролл быстрее

    const lenis = new Lenis({
      lerp: 0.15, // Более быстрый отклик, меньше "тяжести"
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}