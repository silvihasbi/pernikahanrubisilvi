import React from 'react';
import { Sparkles, Calendar, HeartHandshake, Gem, Flame } from 'lucide-react';
import { LoveStory } from '../types.js';

interface LoveStorySectionProps {
  stories: LoveStory[];
}

export const LoveStorySection: React.FC<LoveStorySectionProps> = ({ stories }) => {
  const getIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 1:
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 2:
        return <Gem className="w-4 h-4 text-amber-400" />;
      default:
        return <HeartHandshake className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <section id="section-cerita" className="py-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-xs text-amber-400 font-sans tracking-[0.3em] uppercase mb-2">
          Kisah Cinta Kami
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-wider gold-gradient-text">
          Our Love Story
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-4 font-sans">
          Setiap kisah cinta itu indah, namun bagi kami, kisah ini adalah anugerah terindah dari Sang Pencipta.
        </p>
      </div>

      <div className="relative border-l-2 border-amber-400/30 ml-4 sm:ml-32 space-y-12 py-4">
        {stories.map((item, idx) => (
          <div key={idx} className="relative pl-8 sm:pl-10 group">
            {/* Timeline Dot with Icon */}
            <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full glass-panel border border-amber-400/60 flex items-center justify-center bg-neutral-950 group-hover:scale-110 group-hover:border-amber-400 transition-all shadow-lg">
              {getIcon(idx)}
            </div>

            {/* Floating Year badge for desktop on left */}
            <div className="hidden sm:block absolute -left-36 top-1 text-right w-24">
              <span className="font-cinzel font-bold text-amber-300 text-lg tracking-wider">
                {item.year}
              </span>
            </div>

            {/* Story Card */}
            <div className="glass-panel rounded-2xl p-6 border border-amber-400/20 group-hover:border-amber-400/40 transition-all duration-300 shadow-xl">
              <div className="sm:hidden flex items-center space-x-2 text-amber-300 font-cinzel font-bold text-sm mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{item.year}</span>
              </div>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-amber-100 mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                {item.story}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
