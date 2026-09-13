import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop3D: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      id="btn-scroll-to-top-3d"
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className="fixed bottom-6 right-4 sm:right-6 z-40 p-3 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 text-neutral-950 font-bold shadow-2xl shadow-amber-500/40 border border-amber-300/60 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group flex items-center justify-center"
      style={{
        boxShadow: '0 10px 25px -5px rgba(212, 175, 55, 0.5), inset 0 2px 4px rgba(255,255,255,0.6)',
      }}
    >
      <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
    </button>
  );
};
