import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090a10, 0.0012);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x090a10, 1.0); // Solid dark obsidian, prevents white screen flash on scroll
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Layer 1: Gold Star Particles
    const starCount = 800;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const goldPalette = [
      new THREE.Color(0xf5d77f),
      new THREE.Color(0xe0be67),
      new THREE.Color(0xffe8a3),
      new THREE.Color(0xd4af37),
      new THREE.Color(0x8a7238),
    ];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 1200;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1200;

      const col = goldPalette[Math.floor(Math.random() * goldPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Layer 2: Deep Ambient Floating Nebula Clouds
    const cloudCount = 150;
    const cloudGeometry = new THREE.BufferGeometry();
    const cloudPositions = new Float32Array(cloudCount * 3);
    for (let i = 0; i < cloudCount * 3; i += 3) {
      cloudPositions[i] = (Math.random() - 0.5) * 800;
      cloudPositions[i + 1] = (Math.random() - 0.5) * 800;
      cloudPositions[i + 2] = (Math.random() - 0.5) * 600;
    }
    cloudGeometry.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));
    const cloudMaterial = new THREE.PointsMaterial({
      size: 8.0,
      color: 0xaa8c46,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const cloudField = new THREE.Points(cloudGeometry, cloudMaterial);
    scene.add(cloudField);

    // Track scroll & mouse
    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.05;
      mouseY = (e.clientY - height / 2) * 0.05;
    };

    const handleScroll = () => {
      scrollY = window.scrollY * 0.15;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle celestial rotation
      starField.rotation.y = elapsedTime * 0.02;
      starField.rotation.x = elapsedTime * 0.008;

      cloudField.rotation.y = -elapsedTime * 0.015;

      // Camera responds smoothly to mouse and scroll
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - scrollY * 0.2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#090a10]"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    />
  );
};
