import React, { useState, useEffect } from 'react';
import { Home, Users, Calendar, BookOpen, Image, Gift, MessageSquare } from 'lucide-react';

export const BottomNavDock: React.FC = () => {
  const [activeSection, setActiveSection] = useState('section-hero');

  const navItems = [
    { id: 'section-hero', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'section-mempelai', label: 'Mempelai', icon: <Users className="w-4 h-4" /> },
    { id: 'section-acara', label: 'Acara', icon: <Calendar className="w-4 h-4" /> },
    { id: 'section-cerita', label: 'Cerita', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'section-galeri', label: 'Galeri', icon: <Image className="w-4 h-4" /> },
    { id: 'section-amplop', label: 'Amplop', icon: <Gift className="w-4 h-4" /> },
    { id: 'section-rsvp', label: 'RSVP', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav aria-label="Navigasi Halaman" className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
      <div className="glass-panel border border-amber-400/40 rounded-full px-3 py-2 flex items-center space-x-1 sm:space-x-2 shadow-2xl pointer-events-auto backdrop-blur-xl bg-neutral-950/80">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-btn-${item.id}`}
            onClick={() => scrollTo(item.id)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs transition-all duration-300 cursor-pointer ${
              activeSection === item.id
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/30'
                : 'text-neutral-400 hover:text-amber-200 hover:bg-neutral-800/60'
            }`}
          >
            {item.icon}
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
