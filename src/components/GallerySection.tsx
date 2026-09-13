import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { GalleryItem } from '../types.js';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery }) => {
  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Prewedding' | 'Engagement' | 'Moments'>('Semua');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const categories = ['Semua', 'Prewedding', 'Engagement', 'Moments'] as const;

  const filteredItems = activeFilter === 'Semua'
    ? gallery
    : gallery.filter((item) => item.category === activeFilter);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === 'Escape') setActiveImageIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null));
      }
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, filteredItems.length]);

  return (
    <section id="section-galeri" className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-xs text-amber-400 font-sans tracking-[0.3em] uppercase mb-2">
          Momen Berharga
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-wider gold-gradient-text">
          Galeri Foto
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-4 font-sans">
          Potret kebahagiaan dan perjalanan cinta kami dalam mengukir kenangan abadi.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
              activeFilter === cat
                ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20'
                : 'glass-panel text-neutral-400 hover:text-amber-200 border border-amber-400/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setActiveImageIndex(index)}
            className="group relative rounded-2xl overflow-hidden glass-panel border border-amber-400/20 cursor-pointer shadow-xl aspect-4/5 transform transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-400/50"
          >
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-105"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <span className="text-[10px] tracking-widest text-amber-400 uppercase font-sans mb-1">
                {item.category}
              </span>
              <h4 className="font-cinzel text-lg font-bold text-amber-100">
                {item.title}
              </h4>
              <div className="flex items-center space-x-1.5 text-xs text-neutral-300 mt-2">
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Lihat Foto Penuh</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && filteredItems[activeImageIndex] && (
        <div
          id="gallery-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-200"
        >
          {/* Top Bar with Counter & Close */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10 max-w-5xl mx-auto">
            <div className="text-xs text-amber-300 font-sans tracking-widest uppercase">
              Foto {activeImageIndex + 1} dari {filteredItems.length}
            </div>
            <button
              id="btn-close-lightbox"
              onClick={() => setActiveImageIndex(null)}
              aria-label="Tutup Galeri"
              className="p-2.5 rounded-full bg-neutral-900/80 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Arrows */}
          <button
            id="btn-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) =>
                prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null
              );
            }}
            aria-label="Foto Sebelumnya"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 border border-amber-400/30 text-amber-300 hover:bg-neutral-800 transition-colors z-10 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            id="btn-lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) =>
                prev !== null ? (prev + 1) % filteredItems.length : null
              );
            }}
            aria-label="Foto Berikutnya"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-900/80 border border-amber-400/30 text-amber-300 hover:bg-neutral-800 transition-colors z-10 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Main Photo */}
          <div className="max-w-4xl max-h-[75vh] flex flex-col items-center justify-center p-2">
            <img
              src={filteredItems[activeImageIndex].url}
              alt={filteredItems[activeImageIndex].title}
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-amber-400/20"
              referrerPolicy="no-referrer"
            />
            <div className="text-center mt-4">
              <h3 className="font-cinzel text-xl font-bold text-amber-100">
                {filteredItems[activeImageIndex].title}
              </h3>
              <p className="text-xs text-amber-400/80 font-sans tracking-widest uppercase mt-1">
                {filteredItems[activeImageIndex].category}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
