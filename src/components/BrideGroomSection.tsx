import React from 'react';
import { Heart, Instagram } from 'lucide-react';
import { WeddingSettings } from '../types.js';

interface BrideGroomSectionProps {
  settings: WeddingSettings;
}

export const BrideGroomSection: React.FC<BrideGroomSectionProps> = ({ settings }) => {
  return (
    <section id="section-mempelai" className="py-20 px-4 max-w-5xl mx-auto">
      {/* Quran Verse */}
      <div className="text-center max-w-2xl mx-auto mb-20">
        <div className="inline-block p-2 rounded-full border border-amber-400/20 mb-4 bg-amber-500/5">
          <Heart className="w-4 h-4 text-amber-400" />
        </div>
        <p className="font-cormorant italic text-base sm:text-lg text-neutral-300 leading-relaxed mb-3">
          {settings.quote}
        </p>
        <p className="text-xs tracking-widest uppercase font-semibold text-amber-400 font-sans">
          {settings.quoteSource}
        </p>
      </div>

      {/* Section Header */}
      <div className="text-center mb-16">
        <p className="text-xs text-amber-400 font-sans tracking-[0.3em] uppercase mb-2">
          Kedua Mempelai
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-wider gold-gradient-text">
          Groom & Bride
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
      </div>

      {/* The Couple Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-stretch relative">
        {/* Central Connecting Heart Emblem for Desktop */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass-panel border border-amber-400/40 items-center justify-center shadow-xl">
          <Heart className="w-5 h-5 text-amber-400 fill-amber-400/30 animate-pulse" />
        </div>

        {/* Groom Card */}
        <div
          id="card-mempelai-pria"
          className="glass-panel rounded-3xl p-8 border border-amber-400/30 flex flex-col items-center text-center relative overflow-hidden group hover:border-amber-400/60 transition-all duration-300 shadow-2xl"
        >
          <div className="relative mb-6">
            <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-full p-1.5 border-2 border-amber-400/40 gold-border-glow overflow-hidden bg-neutral-900 shadow-xl group-hover:scale-105 transition-transform duration-500">
              <img
                src={settings.groomPhoto}
                alt={settings.groomName}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-1 right-2 bg-amber-500 text-neutral-950 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow">
              Mempelai Pria
            </div>
          </div>

          <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-100 mb-1 tracking-wide">
            {settings.groomName}
          </h3>
          <p className="text-xs text-amber-300/80 font-sans tracking-widest uppercase mb-4">
            — {settings.groomShortName} —
          </p>

          <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed font-sans mb-3">
            {settings.groomParents}
          </p>

          <p className="text-xs italic text-neutral-400 font-cormorant text-base mb-6 max-w-xs">
            &ldquo;{settings.groomBio}&rdquo;
          </p>

          {settings.groomInstagram && (
            <a
              id="link-ig-groom"
              href={`https://instagram.com/${settings.groomInstagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-amber-400/30 text-amber-200 hover:bg-amber-400/10 text-xs tracking-wider transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-amber-400" />
              <span>@{settings.groomInstagram}</span>
            </a>
          )}
        </div>

        {/* Bride Card */}
        <div
          id="card-mempelai-wanita"
          className="glass-panel rounded-3xl p-8 border border-amber-400/30 flex flex-col items-center text-center relative overflow-hidden group hover:border-amber-400/60 transition-all duration-300 shadow-2xl"
        >
          <div className="relative mb-6">
            <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-full p-1.5 border-2 border-amber-400/40 gold-border-glow overflow-hidden bg-neutral-900 shadow-xl group-hover:scale-105 transition-transform duration-500">
              <img
                src={settings.bridePhoto}
                alt={settings.brideName}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-1 right-2 bg-amber-500 text-neutral-950 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow">
              Mempelai Wanita
            </div>
          </div>

          <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-100 mb-1 tracking-wide">
            {settings.brideName}
          </h3>
          <p className="text-xs text-amber-300/80 font-sans tracking-widest uppercase mb-4">
            — {settings.brideShortName} —
          </p>

          <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed font-sans mb-3">
            {settings.brideParents}
          </p>

          <p className="text-xs italic text-neutral-400 font-cormorant text-base mb-6 max-w-xs">
            &ldquo;{settings.brideBio}&rdquo;
          </p>

          {settings.brideInstagram && (
            <a
              id="link-ig-bride"
              href={`https://instagram.com/${settings.brideInstagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-amber-400/30 text-amber-200 hover:bg-amber-400/10 text-xs tracking-wider transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-amber-400" />
              <span>@{settings.brideInstagram}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
