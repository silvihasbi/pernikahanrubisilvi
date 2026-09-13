import React, { useRef, useState } from 'react';

interface ThreeCard3DProps {
  children: React.ReactNode;
  className?: string;
}

export const ThreeCard3D: React.FC<ThreeCard3DProps> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max tilt 10 deg
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
    );

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.15 });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className={`relative overflow-hidden rounded-3xl ${className}`}
    >
      {/* Glossy 3D Light Refraction Sheen */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-3xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 235, 180, 0.4) 0%, transparent 60%)`,
          opacity: glarePosition.opacity,
        }}
      />
      <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
    </div>
  );
};
