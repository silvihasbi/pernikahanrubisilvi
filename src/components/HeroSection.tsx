import React from 'react';
import { ChevronDown, Calendar, MapPin } from 'lucide-react';
import { WeddingSettings } from '../types.js';
import { ThreeWeddingRings3D } from './ThreeWeddingRings3D.js';
import { ThreeCountdownHolo3D } from './ThreeCountdownHolo3D.js';

interface HeroSectionProps {
  settings: WeddingSettings;
  onScrollDown: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings, onScrollDown }) => {
  return (
    <section
      id="section-hero"
      className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 py-16"
    >
      {/* Arabic Calligraphy */}
      <div className="mb-4">
        <p className="font-serif text-amber-200/90 text-2xl md:text-3xl tracking-widest leading-relaxed">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="text-xs text-neutral-400 font-sans tracking-[0.25em] uppercase mt-2">
          Walimatul &apos;Ursy
        </p>
      </div>

      {/* Interactive 3D Golden Wedding Rings (Three.js WebGL) */}
      <div className="my-2">
        <ThreeWeddingRings3D className="w-56 h-56 sm:w-64 sm:h-64 mx-auto" interactive={true} />
      </div>

      {/* Main Title */}
      <div className="max-w-3xl mx-auto space-y-4 mb-6">
        <h2 className="text-xs md:text-sm tracking-[0.35em] text-amber-300 font-sans uppercase font-medium">
          The Wedding Celebration of
        </h2>
        <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider gold-gradient-text leading-tight">
          {settings.groomShortName} & {settings.brideShortName}
        </h1>
        <p className="font-cormorant italic text-lg sm:text-xl text-neutral-300 max-w-xl mx-auto">
          &ldquo;Dua hati yang dipersatukan oleh takdir, kini mengikat janji suci di hadapan Sang Khalik.&rdquo;
        </p>
      </div>

      {/* Date & Location Snapshot */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-neutral-300 mb-6">
        <div className="flex items-center space-x-2 glass-panel px-4 py-2 rounded-full border border-amber-400/20">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>{settings.akad.date}</span>
        </div>
        <div className="flex items-center space-x-2 glass-panel px-4 py-2 rounded-full border border-amber-400/20">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Jakarta, Indonesia</span>
        </div>
      </div>

      {/* 3D Holographic Interactive Countdown Timer */}
      <div className="w-full max-w-xl mb-10">
        <ThreeCountdownHolo3D targetDateIso={settings.weddingDateIso} />
      </div>

      {/* Scroll Indicator */}
      <button
        id="btn-scroll-down"
        onClick={onScrollDown}
        aria-label="Scroll ke profil mempelai"
        className="flex flex-col items-center text-neutral-400 hover:text-amber-300 transition-colors duration-200 cursor-pointer animate-bounce"
      >
        <span className="text-[10px] tracking-widest uppercase mb-1">Jelajahi Undangan</span>
        <ChevronDown className="w-5 h-5" />
      </button>
    </section>
  );
};
