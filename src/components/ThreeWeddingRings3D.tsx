import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeWeddingRings3DProps {
  className?: string;
  interactive?: boolean;
}

export const ThreeWeddingRings3D: React.FC<ThreeWeddingRings3DProps> = ({
  className = 'w-64 h-64 mx-auto',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 256;
    let height = container.clientHeight || 256;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for both rings
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // Gold Materials (Specular & PBR Gold)
    const goldMaterial1 = new THREE.MeshStandardMaterial({
      color: 0xf5cf78,
      metalness: 0.95,
      roughness: 0.18,
      emissive: 0x3d2708,
    });

    const goldMaterial2 = new THREE.MeshStandardMaterial({
      color: 0xedd69e,
      metalness: 0.92,
      roughness: 0.22,
      emissive: 0x2a1b05,
    });

    // Ring 1 (Groom's Band)
    const torusGeom1 = new THREE.TorusGeometry(1.0, 0.13, 36, 120);
    const ring1 = new THREE.Mesh(torusGeom1, goldMaterial1);
    ring1.rotation.x = Math.PI / 4;
    ring1.rotation.y = Math.PI / 6;
    ring1.position.x = -0.35;
    ringGroup.add(ring1);

    // Ring 2 (Bride's Band - with diamond mount)
    const torusGeom2 = new THREE.TorusGeometry(0.85, 0.11, 36, 120);
    const ring2 = new THREE.Mesh(torusGeom2, goldMaterial2);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.y = -Math.PI / 4;
    ring2.position.x = 0.35;
    ringGroup.add(ring2);

    // Diamond Gem on Bride's Ring
    const diamondGeom = new THREE.OctahedronGeometry(0.18, 1);
    const diamondMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.95,
      transparent: true,
      opacity: 0.95,
      ior: 2.4,
    });
    const diamond = new THREE.Mesh(diamondGeom, diamondMaterial);
    diamond.position.set(0, 0.88, 0);
    diamond.scale.set(1, 1.4, 1);
    ring2.add(diamond);

    // Golden Sparkle Particles
    const particleCount = 60;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 4;
      particlePositions[i + 1] = (Math.random() - 0.5) * 4;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffe28a,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // Lighting (Warm Key & Cool Rim)
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff3db, 2.5);
    dirLight1.position.set(5, 6, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xbfa56d, 1.8);
    dirLight2.position.set(-5, -4, -3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffd700, 2.2, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // Interaction handling (Drag & Touch 3D Rotation)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !interactive) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;
      prevMouseX = clientX;
      prevMouseY = clientY;

      targetRotY += deltaX * 0.012;
      targetRotX += deltaY * 0.012;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Resize observer
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

    // Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth auto-rotation if not dragging
      if (!isDragging) {
        targetRotY += 0.006;
      }

      ringGroup.rotation.y += (targetRotY - ringGroup.rotation.y) * 0.1;
      ringGroup.rotation.x += (targetRotX - ringGroup.rotation.x) * 0.1;

      // Floating gentle bobbing
      ringGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

      // Rotate sparkles
      particles.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
      torusGeom1.dispose();
      torusGeom2.dispose();
      diamondGeom.dispose();
      goldMaterial1.dispose();
      goldMaterial2.dispose();
      diamondMaterial.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      <span className="absolute -bottom-2 text-[10px] text-amber-400/60 tracking-widest uppercase font-sans pointer-events-none">
        Putar Cincin 3D
      </span>
    </div>
  );
};
