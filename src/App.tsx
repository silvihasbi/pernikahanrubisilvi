import React, { useState, useEffect } from 'react';
import { ThreeBackground } from './components/ThreeBackground.js';
import { CoverEnvelope } from './components/CoverEnvelope.js';
import { MusicPlayerFloating } from './components/MusicPlayerFloating.js';
import { HeroSection } from './components/HeroSection.js';
import { BrideGroomSection } from './components/BrideGroomSection.js';
import { EventRundownSection } from './components/EventRundownSection.js';
import { LoveStorySection } from './components/LoveStorySection.js';
import { GallerySection } from './components/GallerySection.js';
import { DigitalGiftSection } from './components/DigitalGiftSection.js';
import { HealthProtocolSection } from './components/HealthProtocolSection.js';
import { RsvpAndWishesSection } from './components/RsvpAndWishesSection.js';
import { ClosingFooter } from './components/ClosingFooter.js';
import { BottomNavDock } from './components/BottomNavDock.js';
import { ScrollToTop3D } from './components/ScrollToTop3D.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { WeddingSettings, GalleryItem, Wish } from './types.js';

// Default initial fallback
const fallbackSettings: WeddingSettings = {
  groomName: 'Rubi Febrian, S.T.',
  groomShortName: 'Rubi',
  groomParents: 'Putra pertama dari Bpk. Bambang Sutrisno & Ibu Ratna Dewi',
  groomBio: 'Pria yang tenang, penuh dedikasi, dan menemukan pelabuhan hatinya pada Silvi.',
  groomPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  groomInstagram: 'rubifebrian',

  brideName: 'Silvi Novitasari, S.Farm.',
  brideShortName: 'Silvi',
  brideParents: 'Putri kedua dari Bpk. H. Ahmad Fauzi & Ibu Hj. Siti Aminah',
  brideBio: 'Wanita anggun berhati lembut yang senantiasa membawa kehangatan dan kebahagiaan.',
  bridePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  brideInstagram: 'silvinovita',

  weddingDateIso: '2026-10-24T08:00:00+07:00',
  quote: '"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."',
  quoteSource: 'QS. Ar-Rum: 21',

  akad: {
    title: 'Akad Nikah',
    subTitle: 'Momen Sakral Pengikatan Janji Suci',
    date: 'Sabtu, 24 Oktober 2026',
    time: '08:00 - 10:00 WIB',
    venueName: 'Masjid Agung Al-Barkah & Ballroom Hall',
    venueAddress: 'Jl. Veteran No. 45, Kebayoran Baru, Jakarta Selatan',
    mapsUrl: 'https://maps.google.com/?q=Masjid+Agung+Al-Barkah',
    calendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Akad+Nikah+Rubi+%26+Silvi&dates=20261024T010000Z/20261024T030000Z&details=Akad+Nikah+Rubi+dan+Silvi&location=Masjid+Agung+Al-Barkah+Jakarta',
  },
  resepsi: {
    title: 'Resepsi Pernikahan',
    subTitle: 'Perayaan Cinta & Syukuran Bersama',
    date: 'Sabtu, 24 Oktober 2026',
    time: '11:00 - 14:00 WIB',
    venueName: 'Grand Royal Ballroom Hotel Indonesia Kempinski',
    venueAddress: 'Jl. M.H. Thamrin No. 1, Menteng, Jakarta Pusat',
    mapsUrl: 'https://maps.google.com/?q=Hotel+Indonesia+Kempinski+Jakarta',
    calendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Resepsi+Nikah+Rubi+%26+Silvi&dates=20261024T040000Z/20261024T070000Z&details=Resepsi+Rubi+dan+Silvi&location=Grand+Royal+Ballroom+Jakarta',
  },

  audio: {
    title: 'A Thousand Years (Instrumental Violin & Piano)',
    artist: 'The Piano Guys / Romantic Strings',
    audioUrl: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg', // Safe fallback audio
    autoPlay: true,
  },

  bankAccounts: [
    {
      id: 'bank-1',
      bankName: 'BCA',
      accountNumber: '8820394812',
      accountHolder: 'Rubi Febrian',
    },
    {
      id: 'bank-2',
      bankName: 'Mandiri',
      accountNumber: '1370019283948',
      accountHolder: 'Silvi Novitasari',
    },
    {
      id: 'bank-3',
      bankName: 'BSI (Bank Syariah)',
      accountNumber: '7192837465',
      accountHolder: 'Rubi Febrian',
    }
  ],

  loveStories: [
    {
      year: '2020',
      title: 'Pertemuan Pertama',
      story: 'Takdir mempertemukan kami dalam sebuah proyek kolaborasi kampus. Percakapan singkat tentang impian dan visi masa depan menjadi benih awal kisah kami.',
    },
    {
      year: '2023',
      title: 'Menjalin Komitmen',
      story: 'Setelah tiga tahun saling mendukung dalam karir dan kehidupan, kami menyadari bahwa setiap langkah ke depan terasa lebih indah saat dilalui bersama.',
    },
    {
      year: '2025',
      title: 'Lamaran & Restu',
      story: 'Di bawah hangatnya matahari senja dan disaksikan kedua keluarga besar yang penuh ridho, kami mengikat janji suci pertunangan.',
    },
    {
      year: '2026',
      title: 'Menuju Hari Bahagia',
      story: 'Kini dengan memohon rahmat Allah SWT, kami melangkah menuju lembaran baru pernikahan yang abadi dan penuh berkah.',
    }
  ],

  physicalGiftAddress: 'Penerima: Rubi & Silvi\nAlamat: Cluster Jasmine No. 12, Jl. Kemang Melati Raya, Jakarta Selatan 12730\nNo. HP: 0812-9876-5432'
};

export default function App() {
  const [settings, setSettings] = useState<WeddingSettings>(fallbackSettings);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isInvitationOpened, setIsInvitationOpened] = useState(false);
  const [guestName, setGuestName] = useState('Tamu Undangan Yang Berbahagia');
  const [showAdmin, setShowAdmin] = useState(false);

  // Extract personalized guest name from URL query and handle /admin route
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const toParam = searchParams.get('to') || searchParams.get('u') || searchParams.get('nama');
    if (toParam) {
      setGuestName(toParam);
    }

    // Direct /admin or #admin check (strictly separated from public UI)
    const checkAdminRoute = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setShowAdmin(true);
        setIsInvitationOpened(true); // bypass cover if accessing admin directly
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Fetch wedding public settings & gallery
  useEffect(() => {
    fetch('/api/wedding')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.gallery) setGallery(data.gallery);
      })
      .catch((err) => {
        console.error('Error fetching wedding data:', err);
      });

    // Fetch initial public wishes
    fetch('/api/wishes')
      .then((res) => res.json())
      .then((data) => {
        if (data.wishes) setWishes(data.wishes);
      })
      .catch((err) => {
        console.error('Error fetching wishes:', err);
      });

    // Real-time synchronization via Server-Sent Events (SSE) across all devices
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/wishes/stream');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'new_wish' && payload.wish) {
            setWishes((prev) => {
              const exists = prev.some((w) => w.id === payload.wish.id);
              if (exists) return prev;
              return [payload.wish, ...prev];
            });
          } else if (payload.type === 'reply_wish' && payload.wish) {
            setWishes((prev) =>
              prev.map((w) => (w.id === payload.wish.id ? payload.wish : w))
            );
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };
    } catch (err) {
      console.error('SSE initialization error:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const handleOpenInvitation = () => {
    setIsInvitationOpened(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWishSubmitted = (newWish: Wish) => {
    setWishes((prev) => {
      const exists = prev.some((w) => w.id === newWish.id);
      if (exists) return prev;
      return [newWish, ...prev];
    });
  };

  const handleScrollToMempelai = () => {
    const el = document.getElementById('section-mempelai');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#090a10] text-neutral-100 overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Persistent 3D Ambient Cosmic & Gold Canvas Background (Three.js WebGL - never turns white on scroll up or down) */}
      <ThreeBackground />

      {/* 2. Cover / Envelope Opening Screen */}
      {!isInvitationOpened && (
        <CoverEnvelope
          settings={settings}
          guestName={guestName}
          onOpen={handleOpenInvitation}
        />
      )}

      {/* 3. Main Wedding Content Container */}
      <div className={`relative z-10 transition-opacity duration-1000 ${isInvitationOpened ? 'opacity-100' : 'opacity-0'}`}>
        {/* Floating Audio Player */}
        <MusicPlayerFloating
          audioSettings={settings.audio}
          autoPlayTrigger={isInvitationOpened}
        />

        {/* Hero Section with 3D Rings & Holographic Countdown */}
        <HeroSection
          settings={settings}
          onScrollDown={handleScrollToMempelai}
        />

        {/* Groom & Bride Section */}
        <BrideGroomSection settings={settings} />

        {/* Event Rundown Section with 3D Tilt Perspective */}
        <EventRundownSection
          akad={settings.akad}
          resepsi={settings.resepsi}
        />

        {/* Love Story Timeline Section */}
        <LoveStorySection stories={settings.loveStories} />

        {/* Photo Gallery Section */}
        <GallerySection gallery={gallery} />

        {/* Digital Gift / Amplop Section */}
        <DigitalGiftSection
          bankAccounts={settings.bankAccounts}
          physicalGiftAddress={settings.physicalGiftAddress}
        />

        {/* Health & Etiquette Protocols */}
        <HealthProtocolSection />

        {/* RSVP & Wishes Section with Real-Time Multi-Device Sync */}
        <RsvpAndWishesSection
          initialGuestName={guestName}
          wishes={wishes}
          onWishSubmitted={handleWishSubmitted}
        />

        {/* Closing Footer (Strictly Public - No Admin Link) */}
        <ClosingFooter settings={settings} />

        {/* Bottom Floating Navigation Dock (Persistent across scroll) */}
        <BottomNavDock />

        {/* 3D Floating Scroll To Top Button */}
        <ScrollToTop3D />
      </div>

      {/* 4. Full-Featured Integrated Admin Dashboard Modal (Accessible strictly via /admin or #admin) */}
      {showAdmin && (
        <AdminDashboard
          onClose={() => {
            setShowAdmin(false);
            if (window.location.hash === '#admin') {
              window.history.pushState(null, '', window.location.pathname + window.location.search);
            }
          }}
          onSettingsUpdated={(newSettings) => setSettings(newSettings)}
          onGalleryUpdated={(newGallery) => setGallery(newGallery)}
        />
      )}
    </div>
  );
}
