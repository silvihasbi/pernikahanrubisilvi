import React from 'react';
import { Shirt, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';

export const HealthProtocolSection: React.FC = () => {
  const protocols = [
    {
      icon: <Shirt className="w-6 h-6 text-amber-400" />,
      title: 'Dress Code Elegan',
      desc: 'Disarankan mengenakan busana bertema Earth Tone, Champagne Gold, Navy, atau Batik Tradisional Formal.',
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-400" />,
      title: 'Hadir Tepat Waktu',
      desc: 'Mohon hadir 15 menit sebelum acara dimulai demi kenyamanan dan kelancaran prosesi sakral.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      title: 'Kenyamanan Bersama',
      desc: 'Disediakan hand sanitizer dan area steril demi menjaga kesehatan seluruh tamu undangan.',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-amber-400" />,
      title: 'Doa & Restu Tulus',
      desc: 'Kehadiran serta doa restu yang tulus dari Anda adalah kado paling istimewa dan bermakna bagi kami.',
    },
  ];

  return (
    <section id="section-panduan" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-xs text-amber-400 font-sans tracking-[0.3em] uppercase mb-2">
          Panduan Acara
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-wider gold-gradient-text">
          Etika & Kenyamanan
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {protocols.map((p, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-2xl p-6 border border-amber-400/20 text-center flex flex-col items-center justify-start group hover:border-amber-400/50 transition-all duration-300 shadow-lg"
          >
            <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 mb-4 group-hover:scale-110 transition-transform">
              {p.icon}
            </div>
            <h4 className="font-cinzel text-base font-bold text-amber-100 mb-2">
              {p.title}
            </h4>
            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
