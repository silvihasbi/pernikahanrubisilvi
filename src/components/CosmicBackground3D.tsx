import React, { useEffect, useRef } from 'react';

/**
 * 3D Ambient Cosmic & Gold Sparkle Background
 * Specially engineered to NEVER turn white or glitch when scrolling up/down.
 * Uses persistent canvas buffer, fixed viewport binding, and pure obsidian background clears.
 */
export const CosmicBackground3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Generate 3D stars and gold sparkling particles
    const PARTICLE_COUNT = Math.min(120, Math.floor((width * height) / 10000));
    interface Particle3D {
      x: number;
      y: number;
      z: number;
      size: number;
      baseAlpha: number;
      alpha: number;
      speed: number;
      twinkleSpeed: number;
      color: string;
      rotSpeed: number;
      angle: number;
    }

    const particles: Particle3D[] = [];
    const goldTones = [
      'rgba(212, 175, 55, ',
      'rgba(245, 215, 120, ',
      'rgba(255, 235, 180, ',
      'rgba(180, 140, 40, ',
      'rgba(255, 255, 255, ',
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 1000 + 100, // 3D depth
        size: Math.random() * 2.5 + 0.8,
        baseAlpha: Math.random() * 0.7 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.4 + 0.15,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: goldTones[Math.floor(Math.random() * goldTones.length)],
        rotSpeed: (Math.random() - 0.5) * 0.005,
        angle: Math.random() * Math.PI * 2,
      });
    }

    // Handle smooth window resize without white flash
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Parallax response on mouse/touch
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      targetMouseX = (clientX - width / 2) * 0.15;
      targetMouseY = (clientY - height / 2) * 0.15;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Floating gold ring & sacred geometry mesh
    let geometryAngle = 0;

    const render = () => {
      // Smooth camera parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      geometryAngle += 0.002;

      // Always clear with rock-solid deep midnight color: #090a10
      ctx.fillStyle = '#090a10';
      ctx.fillRect(0, 0, width, height);

      // Deep ambient radiant lighting
      const grad = ctx.createRadialGradient(
        width / 2 + mouseX * 0.5,
        height / 2 + mouseY * 0.5,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.85
      );
      grad.addColorStop(0, 'rgba(28, 24, 18, 0.4)');
      grad.addColorStop(0.5, 'rgba(14, 16, 26, 0.6)');
      grad.addColorStop(1, '#090a10');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle 3D celestial rings in the background
      ctx.save();
      ctx.translate(width / 2 + mouseX * 0.2, height * 0.35 + mouseY * 0.2);
      ctx.rotate(geometryAngle);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.min(width, height) * 0.35, Math.min(width, height) * 0.18, geometryAngle * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, 0, Math.min(width, height) * 0.42, Math.min(width, height) * 0.22, -geometryAngle * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.03)';
      ctx.stroke();
      ctx.restore();

      // Render 3D particles with depth perspective projection
      const fov = 400;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle forward in 3D
        p.z -= p.speed;
        p.angle += p.rotSpeed;

        // Reset particle if it passes the camera
        if (p.z <= 10) {
          p.z = 1000;
          p.x = (Math.random() - 0.5) * width * 2;
          p.y = (Math.random() - 0.5) * height * 2;
        }

        // 3D perspective projection formula
        const scale = fov / (fov + p.z);
        const projX = (p.x + mouseX * 0.5) * scale + width / 2;
        const projY = (p.y + mouseY * 0.5) * scale + height / 2;

        if (projX < -50 || projX > width + 50 || projY < -50 || projY > height + 50) {
          continue;
        }

        // Twinkle effect
        p.alpha = p.baseAlpha + Math.sin(Date.now() * p.twinkleSpeed) * 0.25;
        const finalAlpha = Math.max(0.1, Math.min(1, p.alpha * scale * 1.5));

        ctx.fillStyle = `${p.color}${finalAlpha})`;
        const drawSize = p.size * scale * 2.2;

        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(0.5, drawSize), 0, Math.PI * 2);
        ctx.fill();

        // Add romantic glow on closer gold sparkles
        if (scale > 0.45 && p.size > 2) {
          ctx.beginPath();
          ctx.arc(projX, projY, drawSize * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 175, 55, ${finalAlpha * 0.25})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, []);

  return (
    <div
      id="cosmic-3d-container"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#090a10]"
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#090a10',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#090a10',
        }}
      />
    </div>
  );
};
