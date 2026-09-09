'use client';

import { useEffect, useRef, useState } from 'react';

export default function PixelPreloader({ onFinish }) {
  const canvasRef = useRef(null);
  const [show, setShow] = useState(true);
  const pixelSize = 8; // размер пикселя
  const animationDuration = 1500; // время сборки логотипа в мс
  const scatterDuration = 600; // время рассыпания в мс

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Устанавливаем размер канваса
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Загружаем логотип как изображение
    const img = new Image();
    img.src = '/logo.png'; // путь к логотипу
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const pixels = [];

      // Создаём сетку пикселей из логотипа
      // Проходим по каждому пикселю логотипа
      for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
          // Получаем цвет пикселя
          const data = ctx.getImageData(x, y, 1, 1).data;
          if (data[3] > 128) { // если непрозрачный
            pixels.push({ x: x, y: y, color: `rgb(${data[0]},${data[1]},${data[2]})` });
          }
        }
      }

      // Инициализируем частицы в центре с хаотичным разбросом
      const particles = pixels.map(pixel => ({
        targetX: pixel.x,
        targetY: pixel.y,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        color: pixel.color,
        speed: Math.random() * 0.05 + 0.02, // скорость движения
        size: pixelSize
      }));

      let startTime = null;
      let scattering = false;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Двигаем частицы к их целевым позициям
        particles.forEach(particle => {
          const dx = particle.targetX - particle.x;
          const dy = particle.targetY - particle.y;
          particle.x += dx * particle.speed;
          particle.y += dy * particle.speed;

          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });

        if (elapsed < animationDuration) {
          requestAnimationFrame(animate);
        } else {
          // Если прошло время сборки, начинаем рассыпание (если нужно)
          if (!scattering) {
            scattering = true;
            startTime = timestamp;
            // Устанавливаем случайное направление разлёта
            particles.forEach(particle => {
              particle.vx = (Math.random() - 0.5) * 4;
              particle.vy = (Math.random() - 0.5) * 4;
            });
          }
          // Рассыпаем частицы
          particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
          });

          // Если время рассыпания истекло, скрываем прелоадер
          if (elapsed > animationDuration + scatterDuration) {
            setShow(false);
            onFinish();
            return;
          }
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    return () => window.removeEventListener('resize', setCanvasSize);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}