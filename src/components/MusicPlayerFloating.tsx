import React, { useState, useEffect, useRef } from 'react';
import { Disc3, Volume2, VolumeX, Music } from 'lucide-react';
import { AudioSettings } from '../types.js';

interface MusicPlayerFloatingProps {
  audioSettings: AudioSettings;
  autoPlayTrigger: boolean;
}

export const MusicPlayerFloating: React.FC<MusicPlayerFloatingProps> = ({
  audioSettings,
  autoPlayTrigger,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When invitation is opened, attempt autoplay
  useEffect(() => {
    if (autoPlayTrigger && !hasInteracted && audioSettings.autoPlay) {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch((err) => {
            console.log('Autoplay deferred until user interaction:', err);
          });
      }
    }
  }, [autoPlayTrigger, hasInteracted, audioSettings.autoPlay]);

  // Handle URL change from backend
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [audioSettings.audioUrl]);

  const togglePlay = () => {
    setHasInteracted(true);
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('Audio play error:', err);
        });
    }
  };

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-40 flex items-center">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={audioSettings.audioUrl}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Track info tooltip */}
      {showTooltip && (
        <div className="mr-3 px-3.5 py-1.5 rounded-xl glass-panel border border-amber-400/40 text-xs text-amber-200 shadow-xl max-w-[200px] truncate animate-in fade-in slide-in-from-right duration-200">
          <p className="font-semibold truncate">{audioSettings.title}</p>
          <p className="text-[10px] text-neutral-400 truncate">{audioSettings.artist}</p>
        </div>
      )}

      {/* Floating control button */}
      <button
        id="btn-music-player-toggle"
        onClick={togglePlay}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
        className="relative group p-3.5 rounded-full glass-panel border border-amber-400/50 text-amber-300 hover:text-amber-100 hover:border-amber-300 shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer bg-neutral-900/80"
      >
        {/* Glow halo */}
        <div
          className={`absolute -inset-1 rounded-full blur-sm transition-opacity duration-300 ${
            isPlaying ? 'bg-amber-400/20 opacity-100 animate-pulse' : 'opacity-0'
          }`}
        />

        {/* Vinyl disc icon with rotation */}
        <div className="relative flex items-center justify-center">
          <Disc3
            className={`w-6 h-6 ${isPlaying ? 'animate-[spin_4s_linear_infinite] text-amber-400' : 'text-neutral-400'}`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {isPlaying ? (
              <Volume2 className="w-2.5 h-2.5 text-neutral-950 fill-amber-300" />
            ) : (
              <VolumeX className="w-2.5 h-2.5 text-neutral-950 fill-neutral-400" />
            )}
          </div>
        </div>

        {/* Equalizer animation bars */}
        {isPlaying && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        )}
      </button>
    </div>
  );
};
