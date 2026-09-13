import React from 'react';
import { MailOpen, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { WeddingSettings } from '../types.js';
import { ThreeWeddingRings3D } from './ThreeWeddingRings3D.js';

interface CoverEnvelopeProps {
  settings: WeddingSettings;
  guestName: string;
  onOpen: () => void;
}

export const CoverEnvelope: React.FC<CoverEnvelopeProps> = ({
  settings,
  guestName,
  onOpen,
}) => {
  return (
    <motion.div
      id="cover-envelope"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -80, transition: { duration: 0.8, ease: 'easeInOut' } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-[#090a10]/95 backdrop-blur-md overflow-hidden text-center select-none"
      style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.18) 0%, rgba(9,10,16,0.98) 75%)',
      }}
    >
      {/* Top Ornamental Header */}
      <div className="pt-6 flex flex-col items-center space-y-1">
        <div className="flex items-center space-x-2 text-amber-300/90 text-[11px] tracking-[0.3em] uppercase font-sans">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>The Wedding Invitation</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>
        <p className="text-neutral-400 text-[10px] tracking-widest font-sans uppercase">
          Walimatul &apos;Ursy
        </p>
      </div>

      {/* Main Couple Card & 3D Rings */}
      <div className="w-full max-w-md my-auto flex flex-col items-center">
        {/* Interactive 3D Gold Rings */}
        <div className="mb-2">
          <ThreeWeddingRings3D className="w-48 h-48 sm:w-56 sm:h-56 mx-auto" interactive={true} />
        </div>

        <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider gold-gradient-text leading-tight mb-1">
          {settings.groomShortName} & {settings.brideShortName}
        </h1>

        <p className="text-amber-200/70 text-xs sm:text-sm tracking-[0.2em] font-sans uppercase mb-6">
          {settings.akad.date}
        </p>

        {/* Personalized Guest Badge */}
        <div className="w-full max-w-sm glass-panel rounded-2xl p-4 sm:p-5 border border-amber-400/30 text-center shadow-2xl">
          <p className="text-neutral-400 text-xs tracking-wider uppercase mb-1">
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>
          <h2 className="text-lg sm:text-xl font-semibold text-amber-100 tracking-wide font-serif capitalize mb-1">
            {guestName || 'Tamu Undangan Yang Berbahagia'}
          </h2>
          <p className="text-neutral-400 text-[11px] italic font-sans">
            *Mohon maaf bila ada kesalahan penulisan nama/gelar
          </p>
        </div>
      </div>

      {/* Bottom Action Trigger */}
      <div className="pb-8 w-full max-w-xs">
        <button
          id="btn-open-invitation"
          onClick={onOpen}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 cursor-pointer border border-amber-200/60"
        >
          <MailOpen className="w-4 h-4 text-neutral-950" />
          <span>Buka Undangan</span>
        </button>
      </div>
    </motion.div>
  );
};
