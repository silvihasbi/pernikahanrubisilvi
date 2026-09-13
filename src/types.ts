export interface Guest {
  id: string;
  name: string;
  slug: string;
  category: 'Keluarga' | 'Sahabat' | 'VIP' | 'Rekan Kerja' | 'Umum';
  phone?: string;
  pax: number; // kuota undangan
  rsvpStatus: 'Belum Konfirmasi' | 'Hadir' | 'Tidak Hadir' | 'Ragu-ragu';
  actualPax?: number; // jumlah konfirmasi kehadiran
  notes?: string;
  createdAt: string;
}

export interface Wish {
  id: string;
  guestName: string;
  relationship?: string;
  message: string;
  attendance: 'Hadir' | 'Tidak Hadir' | 'Ragu-ragu';
  paxCount?: number;
  isApproved: boolean;
  isPinned: boolean;
  adminReply?: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: 'Prewedding' | 'Engagement' | 'Moments';
  featured?: boolean;
}

export interface EventRundown {
  title: string;
  subTitle: string;
  date: string; // e.g. "Minggu, 24 Mei 2026"
  time: string; // e.g. "08:00 - 10:00 WIB"
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  calendarUrl?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  logoType?: 'bca' | 'mandiri' | 'bri' | 'bni' | 'qris';
  qrisImageUrl?: string;
}

export interface LoveStory {
  year: string;
  title: string;
  story: string;
  icon?: string;
}

export interface AudioSettings {
  title: string;
  artist: string;
  audioUrl: string;
  autoPlay: boolean;
}

export interface WeddingSettings {
  groomName: string;
  groomShortName: string;
  groomParents: string;
  groomBio: string;
  groomPhoto: string;
  groomInstagram?: string;

  brideName: string;
  brideShortName: string;
  brideParents: string;
  brideBio: string;
  bridePhoto: string;
  brideInstagram?: string;

  weddingDateIso: string; // e.g. "2026-10-24T08:00:00+07:00"
  quote: string;
  quoteSource: string;

  akad: EventRundown;
  resepsi: EventRundown;

  audio: AudioSettings;
  bankAccounts: BankAccount[];
  loveStories: LoveStory[];
  physicalGiftAddress: string;
}

export interface WeddingPublicData {
  settings: WeddingSettings;
  gallery: GalleryItem[];
}
