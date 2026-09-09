'use client';

import { useEffect, useRef, useState } from 'react';

export default function PixelPreloader({ onFinish }) {
  const canvasRef = useRef(null);
  const [show, setShow] = useState(true);
  const pixelSize = 8;
  const animationDuration = 1500;
  const scatterDuration = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const img = new Image();
    img.src = '/logo.png';

    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0);
      const imageData = tempCtx.getImageData(0, 0, img.width, img.height);

      const offsetX = (canvas.width - img.width) / 2;
      const offsetY = (canvas.height - img.height) / 2;

      const particles = [];
      for (let y = 0; y < img.height; y += pixelSize) {
        for (let x = 0; x < img.width; x += pixelSize) {
          const data = imageData.data;
          const index = (y * img.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];
          if (a > 128) {
            particles.push({
              targetX: x + offsetX,
              targetY: y + offsetY,
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              color: `rgb(${r},${g},${b})`,
              speed: Math.random() * 0.05 + 0.02,
              size: pixelSize
            });
          }
        }
      }

      let startTime = null;
      let scattering = false;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
          if (!scattering) {
            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;
            particle.x += dx * particle.speed;
            particle.y += dy * particle.speed;
          } else {
            particle.x += particle.vx;
            particle.y += particle.vy;
          }

          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });

        if (elapsed < animationDuration) {
          requestAnimationFrame(animate);
        } else if (!scattering) {
          scattering = true;
          startTime = timestamp;
          particles.forEach(particle => {
            particle.vx = (Math.random() - 0.5) * 4;
            particle.vy = (Math.random() - 0.5) * 4;
          });
          requestAnimationFrame(animate);
        } else if (elapsed < animationDuration + scatterDuration) {
          requestAnimationFrame(animate);
        } else {
          setShow(false);
          onFinish();
        }
      };

      requestAnimationFrame(animate);
    };

    img.onerror = () => {
      setTimeout(() => {
        setShow(false);
        onFinish();
      }, 2000);
    };

    return () => window.removeEventListener('resize', setCanvasSize);
  }, []); // Пустые зависимости — критически важно!

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}