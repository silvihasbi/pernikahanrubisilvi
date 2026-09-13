import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCountdownHolo3DProps {
  targetDateIso: string;
}

export const ThreeCountdownHolo3D: React.FC<ThreeCountdownHolo3DProps> = ({ targetDateIso }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(targetDateIso) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDateIso]);

  // Three.js spinning 3D holographic jewel crystal in the background of countdown
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 120;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Glowing Wireframe Icosahedron Jewel
    const geometry = new THREE.IcosahedronGeometry(1.2, 0);
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(
      wireframe,
      new THREE.LineBasicMaterial({
        color: 0xf5cf78,
        transparent: true,
        opacity: 0.35,
      })
    );
    scene.add(line);

    // Inner Glowing Core
    const innerGeom = new THREE.OctahedronGeometry(0.6, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const innerCore = new THREE.Mesh(innerGeom, innerMat);
    scene.add(innerCore);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      line.rotation.x = elapsed * 0.4;
      line.rotation.y = elapsed * 0.5;

      innerCore.rotation.x = -elapsed * 0.6;
      innerCore.rotation.y = -elapsed * 0.7;

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      wireframe.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-amber-400/40 shadow-2xl overflow-hidden max-w-xl mx-auto my-10">
      {/* 3D WebGL Background Wireframe */}
      <div
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center"
      />

      <div className="relative z-10 text-center">
        <p className="text-[11px] font-sans text-amber-400 tracking-[0.3em] uppercase mb-4">
          Hitung Mundur Hari Bahagia
        </p>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {[
            { label: 'Hari', val: timeLeft.days },
            { label: 'Jam', val: timeLeft.hours },
            { label: 'Menit', val: timeLeft.minutes },
            { label: 'Detik', val: timeLeft.seconds },
          ].map((item, index) => (
            <div
              key={index}
              className="glass-panel py-3.5 px-2 rounded-2xl border border-amber-400/30 flex flex-col items-center justify-center group hover:border-amber-400/70 transition-all transform hover:-translate-y-1"
            >
              <span className="font-cinzel text-2xl sm:text-4xl font-bold text-amber-100 tracking-wider">
                {String(item.val).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest font-sans mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-neutral-400 mt-4 font-cormorant italic text-center">
          Sabtu, 24 Oktober 2026 • Menuju Janji Suci Abadi
        </p>
      </div>
    </div>
  );
};
