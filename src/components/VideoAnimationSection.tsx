import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Film } from 'lucide-react';
import { VideoTeaser } from '../types.js';

interface VideoAnimationSectionProps {
  videoTeaser?: VideoTeaser;
}

export const VideoAnimationSection: React.FC<VideoAnimationSectionProps> = ({ videoTeaser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!videoTeaser || !videoTeaser.enabled || !videoTeaser.videoUrl) {
    return null;
  }

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section id="section-video-cinematic" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel border border-amber-400/30 text-amber-300 text-xs tracking-widest uppercase mb-3">
          <Film className="w-3.5 h-3.5" />
          <span>Sinematik Pernikahan</span>
        </div>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-wider gold-gradient-text">
          {videoTeaser.title || 'Video & Animasi Momen Bahagia'}
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto mt-4 font-sans leading-relaxed">
          {videoTeaser.caption || 'Kilas balik kisah kasih, janji suci, dan perayaan cinta menuju lembaran baru.'}
        </p>
      </div>

      {/* Cinematic Golden Frame Player */}
      <div className="relative group rounded-3xl overflow-hidden glass-panel border border-amber-400/40 shadow-2xl shadow-amber-500/10 max-w-4xl mx-auto aspect-video bg-neutral-950">
        {/* Soft Golden Glow Ring */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/20 rounded-3xl blur-sm pointer-events-none" />

        <video
          ref={videoRef}
          src={videoTeaser.videoUrl}
          playsInline
          loop
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
        />

        {/* Big Central Play Button (when paused) */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-neutral-950/40 backdrop-blur-[2px] cursor-pointer transition-all"
          >
            <div className="p-5 sm:p-6 rounded-full bg-amber-400/90 hover:bg-amber-300 text-neutral-950 shadow-2xl shadow-amber-400/50 transform hover:scale-110 active:scale-95 transition-all">
              <Play className="w-8 h-8 fill-neutral-950 translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Video Bottom Control Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-transparent flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Jeda Video' : 'Putar Video'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 transition-colors cursor-pointer"
              aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-[11px] text-neutral-300 font-sans hidden sm:inline">
              {isPlaying ? 'Memutar Video Animasi...' : 'Klik untuk memutar'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 transition-colors cursor-pointer"
              aria-label="Layar Penuh"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
