import React from 'react';
import { Calendar, Clock, MapPin, ExternalLink, CalendarPlus } from 'lucide-react';
import { EventRundown } from '../types.js';
import { ThreeCard3D } from './ThreeCard3D.js';

interface EventRundownSectionProps {
  akad: EventRundown;
  resepsi: EventRundown;
}

export const EventRundownSection: React.FC<EventRundownSectionProps> = ({
  akad,
  resepsi,
}) => {
  return (
    <section id="section-acara" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-xs text-amber-400 font-sans tracking-[0.3em] uppercase mb-2">
          Jadwal Rangkaian
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-wider gold-gradient-text">
          Waktu & Lokasi
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-4 font-sans">
          Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan acara pernikahan kami pada:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {/* Akad Nikah 3D Tilt Card */}
        <ThreeCard3D>
          <div
            id="card-event-akad"
            className="glass-panel rounded-3xl p-8 border border-amber-400/30 flex flex-col justify-between relative overflow-hidden group hover:border-amber-400/60 transition-all duration-300 shadow-xl h-full"
          >
            <div className="space-y-6">
              <div className="border-b border-amber-400/20 pb-5">
                <span className="text-[10px] tracking-widest text-amber-400 uppercase font-sans font-semibold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                  Sesi I
                </span>
                <h3 className="font-cinzel text-2xl font-bold text-amber-100 mt-3 mb-1">
                  {akad.title}
                </h3>
                <p className="text-xs text-neutral-400 italic font-cormorant text-base">
                  {akad.subTitle}
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-neutral-300 font-sans">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-neutral-400 text-[11px] uppercase tracking-wider">Tanggal</p>
                    <p className="font-semibold text-amber-100">{akad.date}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-neutral-400 text-[11px] uppercase tracking-wider">Waktu</p>
                    <p className="font-semibold text-amber-100">{akad.time}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-neutral-400 text-[11px] uppercase tracking-wider">Tempat</p>
                    <p className="font-semibold text-amber-100">{akad.venueName}</p>
                    <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">{akad.venueAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-3">
              <a
                id="btn-maps-akad"
                href={akad.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-semibold tracking-wider transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Google Maps</span>
              </a>
              {akad.calendarUrl && (
                <a
                  id="btn-cal-akad"
                  href={akad.calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 hover:text-amber-200 border border-neutral-700 text-xs tracking-wider transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kalender</span>
                </a>
              )}
            </div>
          </div>
        </ThreeCard3D>

        {/* Resepsi 3D Tilt Card */}
        <ThreeCard3D>
          <div
            id="card-event-resepsi"
            className="glass-panel rounded-3xl p-8 border border-amber-400/30 flex flex-col justify-between relative overflow-hidden group hover:border-amber-400/60 transition-all duration-300 shadow-xl h-full"
          >
            <div className="space-y-6">
              <div className="border-b border-amber-400/20 pb-5">
                <span className="text-[10px] tracking-widest text-amber-400 uppercase font-sans font-semibold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                  Sesi II
                </span>
                <h3 className="font-cinzel text-2xl font-bold text-amber-100 mt-3 mb-1">
                  {resepsi.title}
                </h3>
                <p className="text-xs text-neutral-400 italic font-cormorant text-base">
                  {resepsi.subTitle}
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-neutral-300 font-sans">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-neutral-400 text-[11px] uppercase tracking-wider">Tanggal</p>
                    <p className="font-semibold text-amber-100">{resepsi.date}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-neutral-400 text-[11px] uppercase tracking-wider">Waktu</p>
                    <p className="font-semibold text-amber-100">{resepsi.time}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-neutral-400 text-[11px] uppercase tracking-wider">Tempat</p>
                    <p className="font-semibold text-amber-100">{resepsi.venueName}</p>
                    <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">{resepsi.venueAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-3">
              <a
                id="btn-maps-resepsi"
                href={resepsi.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-semibold tracking-wider transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Google Maps</span>
              </a>
              {resepsi.calendarUrl && (
                <a
                  id="btn-cal-resepsi"
                  href={resepsi.calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 hover:text-amber-200 border border-neutral-700 text-xs tracking-wider transition-colors"
                >
                  <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kalender</span>
                </a>
              )}
            </div>
          </div>
        </ThreeCard3D>
      </div>
    </section>
  );
};
