import fs from 'fs';
import path from 'path';
import { Guest, Wish, GalleryItem, WeddingSettings } from '../src/types.js';
import { hashPassword, AdminSecurityRecord } from './auth.js';

export interface DatabaseSchema {
  security: AdminSecurityRecord;
  settings: WeddingSettings;
  guests: Guest[];
  wishes: Wish[];
  gallery: GalleryItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial password is 'admin1234' (can be updated immediately via Admin Settings)
const initialSecurity = hashPassword('admin1234');

const initialSettings: WeddingSettings = {
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
    time: '11:00 - 15:00 WIB',
    venueName: 'The Grand Ballroom Hotel Mulia',
    venueAddress: 'Jl. Asia Afrika Senayan, Gelora, Tanah Abang, Jakarta Pusat',
    mapsUrl: 'https://maps.google.com/?q=Hotel+Mulia+Senayan',
    calendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Resepsi+Pernikahan+Rubi+%26+Silvi&dates=20261024T040000Z/20261024T080000Z&details=Resepsi+Pernikahan+Rubi+dan+Silvi&location=Hotel+Mulia+Senayan+Jakarta',
  },

  audio: {
    title: 'A Thousand Years (Romantic Piano & Violin)',
    artist: 'The Wedding Strings Orchestra',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-wedding-113824.mp3',
    autoPlay: true,
  },

  bankAccounts: [
    {
      id: 'bank-1',
      bankName: 'BCA (Bank Central Asia)',
      accountNumber: '8210394812',
      accountHolder: 'Rubi Febrian',
      logoType: 'bca',
    },
    {
      id: 'bank-2',
      bankName: 'Bank Mandiri',
      accountNumber: '1370019284729',
      accountHolder: 'Silvi Novitasari',
      logoType: 'mandiri',
    },
    {
      id: 'bank-3',
      bankName: 'QRIS Digital Gift (Gopay / OVO / Dana / BCA)',
      accountNumber: '081298765432',
      accountHolder: 'Pernikahan Rubi & Silvi',
      logoType: 'qris',
      qrisImageUrl: 'https://images.unsplash.com/photo-1595079672139-545c60201e51?auto=format&fit=crop&w=500&q=80',
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

  physicalGiftAddress: 'Penerima: Rubi & Silvi\nAlamat: Cluster Jasmine No. 12, Jl. Kemang Melati Raya, Jakarta Selatan 12730\nNo. HP: 0812-9876-5432',

  videoTeaser: {
    enabled: true,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-groom-adjusting-his-cufflinks-43403-large.mp4',
    title: 'Kisah Kasih Menuju Hari Bahagia',
    caption: 'Cuplikan momen terindah dan komitmen cinta suci Rubi & Silvi',
  }
};

const initialGallery: GalleryItem[] = [
  {
    id: 'g-1',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    title: 'Harmoni Dalam Tatapan',
    category: 'Prewedding',
    featured: true,
  },
  {
    id: 'g-2',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    title: 'Senyuman Menuju Bahagia',
    category: 'Prewedding',
  },
  {
    id: 'g-3',
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
    title: 'Janji di Bawah Cincin',
    category: 'Engagement',
  },
  {
    id: 'g-4',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    title: 'Langkah Bersama',
    category: 'Prewedding',
  },
  {
    id: 'g-5',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    title: 'Abadi Dalam Doa',
    category: 'Moments',
    featured: true,
  },
  {
    id: 'g-6',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    title: 'Kehangatan Kasih',
    category: 'Moments',
  }
];

const initialGuests: Guest[] = [
  {
    id: 'guest-1',
    name: 'Bapak H. Joko & Keluarga',
    slug: 'bapak-h-joko-dan-keluarga',
    category: 'VIP',
    phone: '081234567890',
    pax: 2,
    rsvpStatus: 'Hadir',
    actualPax: 2,
    notes: 'Meja VIP A1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'guest-2',
    name: 'Dr. Budi Santoso, Sp.A',
    slug: 'dr-budi-santoso',
    category: 'Sahabat',
    phone: '081398765432',
    pax: 2,
    rsvpStatus: 'Hadir',
    actualPax: 2,
    notes: 'Sahabat SMA Rubi',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'guest-3',
    name: 'Anisa Rahmawati & Pasangan',
    slug: 'anisa-rahmawati',
    category: 'Rekan Kerja',
    phone: '081512345678',
    pax: 2,
    rsvpStatus: 'Belum Konfirmasi',
    actualPax: 0,
    notes: 'Rekan Lab Silvi',
    createdAt: new Date().toISOString(),
  }
];

const initialWishes: Wish[] = [
  {
    id: 'wish-1',
    guestName: 'Bapak H. Joko',
    relationship: 'Keluarga Besar',
    message: 'Barakallahu laka wa baraka alaika wa jamaa bainakuma fii khoir. Selamat menempuh hidup baru untuk ananda Rubi dan Silvi. Semoga menjadi keluarga yang sakinah, mawaddah, wa rahmah hingga jannah.',
    attendance: 'Hadir',
    paxCount: 2,
    isApproved: true,
    isPinned: true,
    adminReply: 'Aamiin ya rabbal alamin. Terima kasih banyak atas doa dan restu tulus dari Bapak Joko & Keluarga 🙏',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'wish-2',
    guestName: 'Dr. Budi Santoso',
    relationship: 'Sahabat Karib',
    message: 'Selamat bro Rubi dan Silvi! Akhirnya hari yang dinanti-nanti tiba. Bahagia selalu berdua, saling melengkapi dan menyayangi selamanya!',
    attendance: 'Hadir',
    paxCount: 2,
    isApproved: true,
    isPinned: false,
    adminReply: 'Terima kasih Budi! Sampai jumpa di hari H nanti ya bro! 🍻',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure all top-level keys exist
        return {
          security: parsed.security || {
            passwordHash: initialSecurity.hash,
            salt: initialSecurity.salt,
            lastUpdated: new Date().toISOString(),
          },
          settings: { ...initialSettings, ...(parsed.settings || {}) },
          guests: Array.isArray(parsed.guests) ? parsed.guests : initialGuests,
          wishes: Array.isArray(parsed.wishes) ? parsed.wishes : initialWishes,
          gallery: Array.isArray(parsed.gallery) ? parsed.gallery : initialGallery,
        };
      }
    } catch (err) {
      console.error('Error loading DB file, falling back to defaults:', err);
    }

    const defaultData: DatabaseSchema = {
      security: {
        passwordHash: initialSecurity.hash,
        salt: initialSecurity.salt,
        lastUpdated: new Date().toISOString(),
      },
      settings: initialSettings,
      guests: initialGuests,
      wishes: initialWishes,
      gallery: initialGallery,
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  // Security
  public getSecurity(): AdminSecurityRecord {
    return this.data.security;
  }

  public updatePassword(newHash: string, newSalt: string): void {
    this.data.security = {
      passwordHash: newHash,
      salt: newSalt,
      lastUpdated: new Date().toISOString(),
    };
    this.saveData(this.data);
  }

  // Settings
  public getSettings(): WeddingSettings {
    return this.data.settings;
  }

  public updateSettings(partial: Partial<WeddingSettings>): WeddingSettings {
    this.data.settings = {
      ...this.data.settings,
      ...partial,
      audio: {
        ...this.data.settings.audio,
        ...(partial.audio || {}),
      },
      akad: {
        ...this.data.settings.akad,
        ...(partial.akad || {}),
      },
      resepsi: {
        ...this.data.settings.resepsi,
        ...(partial.resepsi || {}),
      },
      videoTeaser: partial.videoTeaser !== undefined
        ? (partial.videoTeaser ? { ...(this.data.settings.videoTeaser || { enabled: true, videoUrl: '', title: '', caption: '' }), ...partial.videoTeaser } : undefined)
        : this.data.settings.videoTeaser
    };
    this.saveData(this.data);
    return this.data.settings;
  }

  // Guests
  public getGuests(): Guest[] {
    return this.data.guests;
  }

  public findGuestBySlug(slug: string): Guest | undefined {
    const clean = slug.trim().toLowerCase();
    return this.data.guests.find(
      (g) => g.slug.toLowerCase() === clean || g.name.toLowerCase() === clean
    );
  }

  public addGuest(guest: Omit<Guest, 'id' | 'createdAt'>): Guest {
    const newGuest: Guest = {
      ...guest,
      id: 'guest-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    this.data.guests.unshift(newGuest);
    this.saveData(this.data);
    return newGuest;
  }

  public updateGuest(id: string, partial: Partial<Guest>): Guest | null {
    const index = this.data.guests.findIndex((g) => g.id === id);
    if (index === -1) return null;
    this.data.guests[index] = { ...this.data.guests[index], ...partial };
    this.saveData(this.data);
    return this.data.guests[index];
  }

  public deleteGuest(id: string): boolean {
    const initialLen = this.data.guests.length;
    this.data.guests = this.data.guests.filter((g) => g.id !== id);
    if (this.data.guests.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Wishes
  public getWishes(includeUnapproved = false): Wish[] {
    if (includeUnapproved) {
      return [...this.data.wishes].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return this.data.wishes
      .filter((w) => w.isApproved)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  public addWish(wishData: {
    guestName: string;
    relationship?: string;
    message: string;
    attendance: 'Hadir' | 'Tidak Hadir' | 'Ragu-ragu';
    paxCount?: number;
  }): Wish {
    const newWish: Wish = {
      id: 'wish-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      guestName: wishData.guestName.trim(),
      relationship: wishData.relationship?.trim() || 'Tamu Undangan',
      message: wishData.message.trim(),
      attendance: wishData.attendance,
      paxCount: wishData.paxCount || 1,
      isApproved: true, // Default auto-approve with moderation toggle in admin
      isPinned: false,
      createdAt: new Date().toISOString(),
    };
    this.data.wishes.unshift(newWish);

    // Also update or link guest RSVP if matching guest exists
    const matchingGuest = this.data.guests.find(
      (g) => g.name.toLowerCase() === wishData.guestName.trim().toLowerCase()
    );
    if (matchingGuest) {
      matchingGuest.rsvpStatus = wishData.attendance;
      matchingGuest.actualPax = wishData.paxCount || 1;
    }

    this.saveData(this.data);
    return newWish;
  }

  public updateWish(id: string, partial: Partial<Wish>): Wish | null {
    const index = this.data.wishes.findIndex((w) => w.id === id);
    if (index === -1) return null;
    this.data.wishes[index] = { ...this.data.wishes[index], ...partial };
    this.saveData(this.data);
    return this.data.wishes[index];
  }

  public deleteWish(id: string): boolean {
    const initialLen = this.data.wishes.length;
    this.data.wishes = this.data.wishes.filter((w) => w.id !== id);
    if (this.data.wishes.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Gallery
  public getGallery(): GalleryItem[] {
    return this.data.gallery;
  }

  public addGalleryItem(item: Omit<GalleryItem, 'id'>): GalleryItem {
    const newItem: GalleryItem = {
      ...item,
      id: 'g-' + Date.now(),
    };
    this.data.gallery.push(newItem);
    this.saveData(this.data);
    return newItem;
  }

  public deleteGalleryItem(id: string): boolean {
    const initialLen = this.data.gallery.length;
    this.data.gallery = this.data.gallery.filter((g) => g.id !== id);
    if (this.data.gallery.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }
}

export const db = new Database();
