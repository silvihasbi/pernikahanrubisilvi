import React from 'react';
import { Heart } from 'lucide-react';
import { WeddingSettings } from '../types.js';

interface ClosingFooterProps {
  settings: WeddingSettings;
}

export const ClosingFooter: React.FC<ClosingFooterProps> = ({ settings }) => {
  return (
    <footer className="relative pt-20 pb-28 px-4 text-center border-t border-amber-400/20 max-w-4xl mx-auto">
      <div className="flex flex-col items-center space-y-6">
        <div className="w-12 h-12 rounded-full p-2.5 glass-panel border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-lg">
          <Heart className="w-6 h-6 fill-amber-400/30" />
        </div>

        <div className="space-y-2">
          <p className="font-cormorant italic text-lg sm:text-xl text-neutral-300 max-w-md mx-auto">
            &ldquo;Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.&rdquo;
          </p>
          <p className="text-xs text-amber-400 font-sans tracking-widest uppercase">
            Kami Yang Berbahagia,
          </p>
        </div>

        <h3 className="font-cinzel text-3xl sm:text-4xl font-bold gold-gradient-text tracking-wider">
          {settings.groomShortName} & {settings.brideShortName}
        </h3>

        <p className="text-xs text-neutral-400 font-sans tracking-wider">
          Beserta Seluruh Keluarga Besar Kedua Mempelai
        </p>
      </div>
    </footer>
  );
};
