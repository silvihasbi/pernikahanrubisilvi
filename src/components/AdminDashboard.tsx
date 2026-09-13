import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Users,
  MessageSquare,
  Music,
  Settings,
  Shield,
  Search,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Check,
  Copy,
  Download,
  Play,
  Pause,
  Pin,
  PinOff,
  CornerDownRight,
  LogOut,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Video,
  Film,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Upload,
  Smartphone,
  Laptop,
  CheckCircle2,
  Lock,
  Key,
  Globe,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Guest, Wish, WeddingSettings, GalleryItem, BankAccount, EventRundown, VideoTeaser } from '../types.js';

interface AdminDashboardProps {
  onClose: () => void;
  onSettingsUpdated: (newSettings: WeddingSettings) => void;
  onGalleryUpdated: (newGallery: GalleryItem[]) => void;
}

type TabKey = 'stats' | 'events' | 'video' | 'music' | 'gallery' | 'guests' | 'wishes' | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onSettingsUpdated,
  onGalleryUpdated,
}) => {
  // Authentication State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('wedding_admin_token'));
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('stats');

  // Stats Data
  const [stats, setStats] = useState<any>(null);

  // Guests Data
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestSearch, setGuestSearch] = useState('');
  const [guestFilterCategory, setGuestFilterCategory] = useState('Semua');
  const [guestFilterStatus, setGuestFilterStatus] = useState('Semua');
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    category: 'Umum' as Guest['category'],
    phone: '',
    pax: 2,
    notes: '',
  });
  const [bulkNamesText, setBulkNamesText] = useState('');
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Wishes Data
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [wishFilter, setWishFilter] = useState<'all' | 'pinned' | 'pending'>('all');
  const [replyingWishId, setReplyingWishId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Settings & Media Data
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Wedding Details Form State
  const [eventsForm, setEventsForm] = useState<WeddingSettings | null>(null);
  const [isSavingEvents, setIsSavingEvents] = useState(false);

  // Video Teaser Form State
  const [videoForm, setVideoForm] = useState<VideoTeaser>({
    enabled: true,
    videoUrl: '',
    title: '',
    caption: '',
  });
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Music Form State
  const [audioForm, setAudioForm] = useState({
    title: '',
    artist: '',
    audioUrl: '',
    autoPlay: true,
  });
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isSavingAudio, setIsSavingAudio] = useState(false);
  const [previewAudioPlaying, setPreviewAudioPlaying] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Gallery Item Modal State
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [selectedGalleryFile, setSelectedGalleryFile] = useState<File | null>(null);
  const [galleryPreviewSrc, setGalleryPreviewSrc] = useState<string | null>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: '',
    url: '',
    category: 'Prewedding' as GalleryItem['category'],
    featured: false,
    mediaType: 'image' as 'image' | 'video',
  });

  // Security Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastPasswordUpdate, setLastPasswordUpdate] = useState<string | null>(null);

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Preset Romantic Songs
  const songPresets = [
    {
      title: 'A Thousand Years (Romantic Piano & Strings)',
      artist: 'The Wedding Strings Orchestra',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-wedding-113824.mp3',
    },
    {
      title: 'Canon in D (Gentle Acoustic Piano)',
      artist: 'Johann Pachelbel',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_24f54668b5.mp3?filename=piano-moment-9835.mp3',
    },
    {
      title: 'Romantic Cinematic Dream',
      artist: 'Ethereal Harmony',
      url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=warm-memories-romantic-piano-10903.mp3',
    },
    {
      title: 'Forever With You (Wedding Ballad)',
      artist: 'Sweet Romance Ensemble',
      url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0579998144.mp3?filename=romantic-love-1393.mp3',
    },
  ];

  // Load Data on Mount or Token Change
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      // 1. Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.status === 401) {
        handleLogout();
        return;
      }
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Guests
      const guestsRes = await fetch('/api/admin/guests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const guestsData = await guestsRes.json();
      if (guestsData.guests) setGuests(guestsData.guests);

      // 3. Wishes
      const wishesRes = await fetch('/api/admin/wishes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wishesData = await wishesRes.json();
      if (wishesData.wishes) setWishes(wishesData.wishes);

      // 4. Settings
      const settingsRes = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const settingsData = await settingsRes.json();
      if (settingsData.settings) {
        setSettings(settingsData.settings);
        setEventsForm(JSON.parse(JSON.stringify(settingsData.settings)));
        if (settingsData.settings.audio) {
          setAudioForm({
            title: settingsData.settings.audio.title,
            artist: settingsData.settings.audio.artist,
            audioUrl: settingsData.settings.audio.audioUrl,
            autoPlay: settingsData.settings.audio.autoPlay,
          });
        }
        if (settingsData.settings.videoTeaser) {
          setVideoForm(settingsData.settings.videoTeaser);
        }
      }

      // 5. Gallery
      const publicWeddingRes = await fetch('/api/wedding');
      const publicData = await publicWeddingRes.json();
      if (publicData.gallery) setGallery(publicData.gallery);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  // --- AUTHENTICATION ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password admin salah.');
      }

      localStorage.setItem('wedding_admin_token', data.token);
      setToken(data.token);
      setPasswordInput('');
      showToast('Berhasil masuk ke panel admin terproteksi.');
    } catch (err: any) {
      setLoginError(err.message || 'Gagal login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem('wedding_admin_token');
    setToken(null);
    setPasswordInput('');
    showToast('Sesi admin telah ditutup.');
  };

  // --- DIRECT FILE UPLOAD HELPER (Phone & Laptop) ---
  const uploadFileFromDevice = async (file: File): Promise<{ url: string; mediaType: 'image' | 'video' | 'audio' }> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal mengunggah file dari perangkat.');
    }

    return { url: data.url, mediaType: data.mediaType };
  };

  // --- WEDDING EVENTS & DATES SAVE ---
  const handleSaveEvents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventsForm) return;
    setIsSavingEvents(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventsForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pengaturan.');

      setSettings(data.settings);
      setEventsForm(JSON.parse(JSON.stringify(data.settings)));
      onSettingsUpdated(data.settings);
      showToast('Detail pernikahan & countdown berhasil disimpan dan disinkronkan ke semua tamu!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingEvents(false);
    }
  };

  // --- MEMPELAI PHOTO UPLOAD FROM DEVICE ---
  const handleUploadGroomPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventsForm) return;

    try {
      showToast('Mengunggah foto mempelai pria dari perangkat...');
      const { url } = await uploadFileFromDevice(file);
      setEventsForm({ ...eventsForm, groomPhoto: url });
      showToast('Foto mempelai pria berhasil diunggah! Klik Simpan Perubahan.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUploadBridePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventsForm) return;

    try {
      showToast('Mengunggah foto mempelai wanita dari perangkat...');
      const { url } = await uploadFileFromDevice(file);
      setEventsForm({ ...eventsForm, bridePhoto: url });
      showToast('Foto mempelai wanita berhasil diunggah! Klik Simpan Perubahan.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUploadQrisImage = async (e: React.ChangeEvent<HTMLInputElement>, bankIndex: number) => {
    const file = e.target.files?.[0];
    if (!file || !eventsForm) return;

    try {
      showToast('Mengunggah barcode QRIS dari perangkat...');
      const { url } = await uploadFileFromDevice(file);
      const updatedBanks = [...eventsForm.bankAccounts];
      updatedBanks[bankIndex] = { ...updatedBanks[bankIndex], qrisImageUrl: url };
      setEventsForm({ ...eventsForm, bankAccounts: updatedBanks });
      showToast('Barcode QRIS berhasil diunggah! Klik Simpan Perubahan.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- VIDEO ANIMATION MANAGEMENT ---
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      showToast('Mengunggah video animasi dari perangkat Anda...');
      const { url } = await uploadFileFromDevice(file);
      setVideoForm((prev) => ({
        ...prev,
        videoUrl: url,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
      showToast('Video animasi berhasil diunggah langsung dari perangkat! Klik Simpan.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVideo(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoTeaser: videoForm }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan video animasi.');

      setSettings(data.settings);
      onSettingsUpdated(data.settings);
      showToast('Video animasi berhasil disimpan ke database dan ditampilkan di frontend!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingVideo(false);
    }
  };

  // --- MUSIC MANAGEMENT (Upload MP3 from Device) ---
  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    try {
      showToast('Mengunggah file musik MP3 langsung dari perangkat...');
      const { url } = await uploadFileFromDevice(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      setAudioForm((prev) => ({
        ...prev,
        audioUrl: url,
        title: cleanTitle,
        artist: 'Pilihan Pengantin',
      }));
      showToast('File MP3 berhasil diunggah! Klik Simpan Lagu ke Database.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const togglePreviewAudio = () => {
    if (!audioPreviewRef.current) {
      const audio = new Audio(audioForm.audioUrl);
      audioPreviewRef.current = audio;
      audio.onended = () => setPreviewAudioPlaying(false);
    }

    if (previewAudioPlaying) {
      audioPreviewRef.current.pause();
      setPreviewAudioPlaying(false);
    } else {
      audioPreviewRef.current.src = audioForm.audioUrl;
      audioPreviewRef.current
        .play()
        .then(() => setPreviewAudioPlaying(true))
        .catch(() => alert('Gagal memutar pratinjau lagu.'));
    }
  };

  const handleSaveAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAudio(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ audio: audioForm }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengaturan lagu.');

      setSettings(data.settings);
      onSettingsUpdated(data.settings);
      showToast('Lagu baru disimpan di database & otomatis terputar di semua layar undangan!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingAudio(false);
    }
  };

  // --- GALLERY MANAGEMENT (Direct File Upload) ---
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedGalleryFile(file);
      const objectUrl = URL.createObjectURL(file);
      setGalleryPreviewSrc(objectUrl);
      const isVideo = file.type.startsWith('video/');
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewGalleryItem((prev) => ({
        ...prev,
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        mediaType: isVideo ? 'video' : 'image',
      }));
    }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingGallery(true);

    try {
      let finalUrl = newGalleryItem.url;
      let finalMediaType = newGalleryItem.mediaType;

      if (selectedGalleryFile) {
        const uploadResult = await uploadFileFromDevice(selectedGalleryFile);
        finalUrl = uploadResult.url;
        finalMediaType = uploadResult.mediaType === 'video' ? 'video' : 'image';
      }

      if (!finalUrl) {
        throw new Error('Silakan pilih file foto atau video dari perangkat Anda.');
      }

      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newGalleryItem,
          url: finalUrl,
          mediaType: finalMediaType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan ke galeri.');

      const updatedGallery = [...gallery, data.item];
      setGallery(updatedGallery);
      onGalleryUpdated(updatedGallery);
      setShowAddPhotoModal(false);
      setSelectedGalleryFile(null);
      setGalleryPreviewSrc(null);
      setNewGalleryItem({ title: '', url: '', category: 'Prewedding', featured: false, mediaType: 'image' });
      showToast(`${finalMediaType === 'video' ? 'Video animasi' : 'Foto'} berhasil ditambahkan ke galeri!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Hapus media ini dari galeri?')) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = gallery.filter((g) => g.id !== id);
        setGallery(updated);
        onGalleryUpdated(updated);
        showToast('Media berhasil dihapus dari galeri.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- GUEST MANAGEMENT ---
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGuest),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGuests([data.guest, ...guests]);
      setShowAddGuestModal(false);
      setNewGuest({ name: '', category: 'Umum', phone: '', pax: 2, notes: '' });
      showToast(`Tamu "${data.guest.name}" berhasil ditambahkan.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBulkAddGuests = async (e: React.FormEvent) => {
    e.preventDefault();
    const names = bulkNamesText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      alert('Masukkan setidaknya satu nama tamu.');
      return;
    }

    try {
      const res = await fetch('/api/admin/guests/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ names, category: 'Umum', pax: 2 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGuests([...data.created, ...guests]);
      setShowBulkAddModal(false);
      setBulkNamesText('');
      showToast(`${data.created.length} tamu berhasil ditambahkan secara massal.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGuest = async (id: string, name: string) => {
    if (!confirm(`Hapus tamu "${name}" dari daftar undangan?`)) return;
    try {
      const res = await fetch(`/api/admin/guests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setGuests(guests.filter((g) => g.id !== id));
        showToast('Tamu berhasil dihapus.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Copy personalized invitation link
  const copyInvitationLink = (guest: Guest) => {
    const origin = window.location.origin;
    const url = `${origin}/?to=${encodeURIComponent(guest.name)}`;
    navigator.clipboard.writeText(url);
    showToast(`Link undangan untuk ${guest.name} berhasil disalin!`);
  };

  const shareViaWhatsApp = (guest: Guest) => {
    const origin = window.location.origin;
    const link = `${origin}/?to=${encodeURIComponent(guest.name)}`;
    const text = `Kepada Yth. Bapak/Ibu/Saudara/i *${guest.name}*,\n\nDengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Anda untuk menghadiri pernikahan kami: Rubi Febrian & Silvi Novitasari.\n\nUndangan digital resmi Anda dapat dibuka melalui tautan berikut:\n${link}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.\n\nTerima kasih.`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}${
      guest.phone ? `&phone=${guest.phone.replace(/[^0-9]/g, '')}` : ''
    }`;
    window.open(waUrl, '_blank');
  };

  // --- WISHES MANAGEMENT ---
  const handleTogglePin = async (wish: Wish) => {
    try {
      const res = await fetch(`/api/admin/wishes/${wish.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned: !wish.isPinned }),
      });
      if (res.ok) {
        setWishes(wishes.map((w) => (w.id === wish.id ? { ...w, isPinned: !wish.isPinned } : w)));
        showToast(wish.isPinned ? 'Sematkan doa dilepas.' : 'Doa disematkan di paling atas!');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReplyWish = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/admin/wishes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminReply: replyText.trim() }),
      });
      if (res.ok) {
        setWishes(wishes.map((w) => (w.id === id ? { ...w, adminReply: replyText.trim() } : w)));
        setReplyingWishId(null);
        setReplyText('');
        showToast('Balasan doa berhasil dikirim dan tampil di website!');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Hapus ucapan/doa ini?')) return;
    try {
      const res = await fetch(`/api/admin/wishes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWishes(wishes.filter((w) => w.id !== id));
        showToast('Ucapan berhasil dihapus.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- SECURITY & PASSWORD UPDATE ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityStatus(null);

    if (newPassword.length < 6) {
      setSecurityStatus({ type: 'error', message: 'Password baru minimal 6 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityStatus({ type: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSecurityStatus({ type: 'success', message: data.message });
      setLastPasswordUpdate(data.lastUpdated);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password admin berhasil diubah!');
    } catch (err: any) {
      setSecurityStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div
      id="admin-dashboard-container"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col text-neutral-100 overflow-hidden font-sans"
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-amber-500 text-neutral-950 font-bold text-xs tracking-wider shadow-2xl flex items-center space-x-2 animate-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="px-6 py-4 border-b border-amber-400/20 flex items-center justify-between bg-neutral-950/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cinzel text-lg font-bold gold-gradient-text">
              Panel Pengendalian Admin
            </h2>
            <p className="text-[11px] text-neutral-400 tracking-wider">
              Rubi Febrian & Silvi Novitasari • Sistem Terisolasi & Anti-Hacker
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {token && (
            <button
              id="btn-admin-logout"
              onClick={handleLogout}
              className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors flex items-center space-x-1.5 text-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
          <button
            id="btn-close-admin-dashboard"
            onClick={onClose}
            aria-label="Tutup Dashboard"
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      {!token ? (
        // Login Screen (Secure Masked Input, No Plaintext Password Hint)
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-amber-400/40 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-1">
              Autentikasi Akses Khusus
            </h3>
            <p className="text-xs text-neutral-400 mb-6 font-sans leading-relaxed">
              Area terenkripsi untuk mengelola seluruh data pernikahan, lagu, tanggal, foto, dan video animasi secara langsung dari perangkat Anda.
            </p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Kata Sandi Admin
                </label>
                <div className="relative">
                  <input
                    id="input-admin-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-amber-400/30 text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-3.5 text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
                    aria-label={showPasswords ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                id="btn-submit-admin-login"
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-full text-neutral-950 font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Sandi...</span>
                  </>
                ) : (
                  <span>Masuk Panel Pengendalian</span>
                )}
              </button>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 text-center flex items-center justify-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400/70" />
                <span>Terlindungi enkripsi PBKDF2-SHA512 & Anti Brute-Force Lockout</span>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // Authenticated Dashboard
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-64 border-r border-amber-400/20 p-3 space-y-1 bg-neutral-950/50 shrink-0 overflow-x-auto md:overflow-y-auto flex md:flex-col">
            {[
              { id: 'stats', label: 'Ringkasan & Metrik', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'events', label: 'Detail Acara & Tanggal', icon: <Calendar className="w-4 h-4" /> },
              { id: 'video', label: 'Video & Animasi', icon: <Film className="w-4 h-4" /> },
              { id: 'music', label: 'Lagu & Pemutar Musik', icon: <Music className="w-4 h-4" /> },
              { id: 'gallery', label: 'Galeri Foto & Video', icon: <ImageIcon className="w-4 h-4" /> },
              { id: 'guests', label: 'Manajemen Tamu', icon: <Users className="w-4 h-4" /> },
              { id: 'wishes', label: 'Kelola Ucapan & RSVP', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'security', label: 'Keamanan & Isolasi Domain', icon: <Shield className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-3 transition-all cursor-pointer text-left whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-neutral-400 hover:text-amber-200 hover:bg-neutral-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </aside>

          {/* Main Tab Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gradient-to-b from-neutral-950 to-[#0c0d14]">
            {/* 1. TAB: OVERVIEW & STATS */}
            {activeTab === 'stats' && (
              <div className="space-y-8 max-w-5xl">
                <div>
                  <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-1">
                    Ringkasan Acara & Pengunjung
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Pantau statistik kehadiran tamu, doa restu, lagu aktif, dan kesiapan acara secara real-time.
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-5 rounded-2xl border border-amber-400/30">
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest font-sans">
                      Total Tamu
                    </span>
                    <h4 className="font-cinzel text-3xl font-bold text-amber-100 mt-1">
                      {stats?.totalGuests ?? guests.length}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1">Undangan terdaftar</p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-sans">
                      Konfirmasi Hadir
                    </span>
                    <h4 className="font-cinzel text-3xl font-bold text-emerald-300 mt-1">
                      {stats?.rsvpAttending ?? guests.filter((g) => g.rsvpStatus === 'Hadir').length}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      {stats?.totalPaxAttending ?? guests.reduce((acc, g) => (g.rsvpStatus === 'Hadir' ? acc + (g.actualPax || g.pax) : acc), 0)} orang (pax)
                    </p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-amber-400/30">
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest font-sans">
                      Total Doa & Ucapan
                    </span>
                    <h4 className="font-cinzel text-3xl font-bold text-amber-100 mt-1">
                      {stats?.totalWishes ?? wishes.length}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1">Pesan penuh berkah</p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-amber-400/30">
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest font-sans">
                      Status Musik Latar
                    </span>
                    <h4 className="font-cinzel text-base font-bold text-amber-200 mt-2 truncate">
                      {settings?.audio.title || 'Lagu Aktif'}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      {settings?.audio.artist || 'Orchestra'}
                    </p>
                  </div>
                </div>

                {/* Quick Action Shortcuts */}
                <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 space-y-4">
                  <h4 className="font-cinzel text-lg font-bold text-amber-100 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Aksi Cepat Pengaturan Mandiri</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveTab('events')}
                      className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/60 text-left transition-all cursor-pointer group"
                    >
                      <Calendar className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-white">Ubah Tanggal & Jam Acara</p>
                      <p className="text-[11px] text-neutral-400 mt-1">Edit tanggal akad, resepsi, & hitung mundur</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('video')}
                      className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/60 text-left transition-all cursor-pointer group"
                    >
                      <Film className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-white">Unggah Video Animasi</p>
                      <p className="text-[11px] text-neutral-400 mt-1">Upload video langsung dari HP / laptop</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('music')}
                      className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/60 text-left transition-all cursor-pointer group"
                    >
                      <Music className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-white">Ganti Lagu Pernikahan</p>
                      <p className="text-[11px] text-neutral-400 mt-1">Upload file MP3 sendiri dari perangkat</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TAB: DETAIL ACARA, TANGGAL & COUNTDOWN (Manual Manusia) */}
            {activeTab === 'events' && eventsForm && (
              <form onSubmit={handleSaveEvents} className="space-y-8 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-cinzel text-2xl font-bold text-amber-100">
                      Kelola Acara, Waktu & Tanggal
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Anda dapat mengubah tanggal pernikahan, jam akad/resepsi, dan nama pengantin dengan ketikan tangan secara manual.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingEvents}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSavingEvents ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{isSavingEvents ? 'Menyimpan...' : 'Simpan Perubahan ke Database'}</span>
                  </button>
                </div>

                {/* Section: Countdown Target Date */}
                <div className="glass-panel p-6 rounded-3xl border border-amber-400/40 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <h4 className="font-cinzel text-base font-bold text-amber-100">
                      Waktu Sasaran Hitung Mundur (Countdown 3D)
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Masukkan format tanggal dan jam standar (ISO 8601). Countdown 3D di website akan otomatis menghitung mundur ke tanggal ini secara presisi.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Format Waktu ISO (Ketikan Manual)
                      </label>
                      <input
                        type="text"
                        value={eventsForm.weddingDateIso}
                        onChange={(e) => setEventsForm({ ...eventsForm, weddingDateIso: e.target.value })}
                        required
                        placeholder="2026-10-24T08:00:00+07:00"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 font-mono focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">
                        Contoh: 2026-10-24T08:00:00+07:00 (Tahun-Bulan-Tanggal Jam:Menit:Detik)
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Atau Pilih Menggunakan Pemilih Tanggal
                      </label>
                      <input
                        type="datetime-local"
                        value={(() => {
                          try {
                            const d = new Date(eventsForm.weddingDateIso);
                            if (!isNaN(d.getTime())) {
                              const pad = (n: number) => String(n).padStart(2, '0');
                              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                            }
                          } catch {}
                          return '';
                        })()}
                        onChange={(e) => {
                          if (e.target.value) {
                            setEventsForm({ ...eventsForm, weddingDateIso: `${e.target.value}:00+07:00` });
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Akad & Resepsi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Akad */}
                  <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 space-y-4">
                    <h4 className="font-cinzel text-base font-bold text-amber-200 flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-amber-400" />
                      <span>Detail Akad Nikah</span>
                    </h4>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Judul Sesi</label>
                      <input
                        type="text"
                        value={eventsForm.akad.title}
                        onChange={(e) =>
                          setEventsForm({
                            ...eventsForm,
                            akad: { ...eventsForm.akad, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Hari & Tanggal</label>
                        <input
                          type="text"
                          value={eventsForm.akad.date}
                          onChange={(e) =>
                            setEventsForm({
                              ...eventsForm,
                              akad: { ...eventsForm.akad, date: e.target.value },
                            })
                          }
                          placeholder="Sabtu, 24 Oktober 2026"
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Waktu & Jam</label>
                        <input
                          type="text"
                          value={eventsForm.akad.time}
                          onChange={(e) =>
                            setEventsForm({
                              ...eventsForm,
                              akad: { ...eventsForm.akad, time: e.target.value },
                            })
                          }
                          placeholder="08:00 - 10:00 WIB"
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Nama Tempat / Masjid</label>
                      <input
                        type="text"
                        value={eventsForm.akad.venueName}
                        onChange={(e) =>
                          setEventsForm({
                            ...eventsForm,
                            akad: { ...eventsForm.akad, venueName: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Alamat Lengkap</label>
                      <textarea
                        rows={2}
                        value={eventsForm.akad.venueAddress}
                        onChange={(e) =>
                          setEventsForm({
                            ...eventsForm,
                            akad: { ...eventsForm.akad, venueAddress: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Tautan Google Maps</label>
                      <input
                        type="url"
                        value={eventsForm.akad.mapsUrl}
                        onChange={(e) =>
                          setEventsForm({
                            ...eventsForm,
                            akad: { ...eventsForm.akad, mapsUrl: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 font-mono"
                      />
                    </div>
                  </div>

                  {/* Resepsi */}
                  <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 space-y-4">
                    <h4 className="font-cinzel text-base font-bold text-amber-200 flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-amber-400" />
                      <span>Detail Resepsi Pernikahan</span>
                    </h4>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Judul Sesi</label>
                      <input
                        type="text"
                        value={eventsForm.resepsi.title}
                        onChange={(e) =>
                          setEventsForm({
                            ...eventsForm,
                            resepsi: { ...eventsForm.resepsi, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Hari & Tanggal</label>
                        <input
                          type="text"
                          value={eventsForm.resepsi.date}
                          onChange={(e) =>
                            setEventsForm({
                              ...eventsForm,
                              resepsi: { ...eventsForm.resepsi, date: e.target.value },
                            })
                          }
                          placeholder="Sabtu, 24 Oktober 2026"
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Waktu & Jam</label>
                        <input
                          type="text"
                          value={eventsForm.resepsi.time}
                          onChange={(e) =>
                            setEventsForm({
                              ...eventsForm,
                              resepsi: { ...eventsForm.resepsi, time: e.target.value },
                            })
                          }
                          placeholder="11:00 - 15:00 WIB"
                          className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Nama Tempat / Gedung</label>
                      <input
                        type="text"
                        value={eventsForm.resepsi.venueName}
                        onChange={(e) =>
                          setEventsForm({
                            ...eventsForm,
                            resepsi: { ...eventsForm.resepsi, venueName: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Alamat Lengkap</label>
                      <textarea
                        rows={2}
                        value={eventsForm.resepsi.venueAddress}
                        onChange={(e) =>
                          setEventsForm({
                            ...eventsForm,
                            resepsi: { ...eventsForm.resepsi, venueAddress: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Tautan Google Maps</label>
                      <input
                        type="url"
                        value={eventsForm.resepsi.mapsUrl}
                        onChange={(e) =>
                          setEventsForm({
                            ...eventsForm,
                            resepsi: { ...eventsForm.resepsi, mapsUrl: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Mempelai Pria & Wanita */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pria */}
                  <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 space-y-4">
                    <h4 className="font-cinzel text-base font-bold text-amber-100">
                      Mempelai Pria
                    </h4>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Nama Lengkap & Gelar</label>
                      <input
                        type="text"
                        value={eventsForm.groomName}
                        onChange={(e) => setEventsForm({ ...eventsForm, groomName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Nama Panggilan</label>
                      <input
                        type="text"
                        value={eventsForm.groomShortName}
                        onChange={(e) => setEventsForm({ ...eventsForm, groomShortName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Nama Orang Tua</label>
                      <input
                        type="text"
                        value={eventsForm.groomParents}
                        onChange={(e) => setEventsForm({ ...eventsForm, groomParents: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Unggah Foto Langsung dari HP / Laptop</label>
                      <div className="flex items-center gap-3">
                        <img
                          src={eventsForm.groomPhoto}
                          alt="Groom"
                          className="w-12 h-12 rounded-full object-cover border border-amber-400/40"
                        />
                        <label className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs text-amber-300 font-semibold cursor-pointer flex items-center justify-center space-x-1.5">
                          <Upload className="w-4 h-4" />
                          <span>Pilih Foto dari Perangkat</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadGroomPhoto}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Wanita */}
                  <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 space-y-4">
                    <h4 className="font-cinzel text-base font-bold text-amber-100">
                      Mempelai Wanita
                    </h4>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Nama Lengkap & Gelar</label>
                      <input
                        type="text"
                        value={eventsForm.brideName}
                        onChange={(e) => setEventsForm({ ...eventsForm, brideName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Nama Panggilan</label>
                      <input
                        type="text"
                        value={eventsForm.brideShortName}
                        onChange={(e) => setEventsForm({ ...eventsForm, brideShortName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Nama Orang Tua</label>
                      <input
                        type="text"
                        value={eventsForm.brideParents}
                        onChange={(e) => setEventsForm({ ...eventsForm, brideParents: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Unggah Foto Langsung dari HP / Laptop</label>
                      <div className="flex items-center gap-3">
                        <img
                          src={eventsForm.bridePhoto}
                          alt="Bride"
                          className="w-12 h-12 rounded-full object-cover border border-amber-400/40"
                        />
                        <label className="flex-1 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs text-amber-300 font-semibold cursor-pointer flex items-center justify-center space-x-1.5">
                          <Upload className="w-4 h-4" />
                          <span>Pilih Foto dari Perangkat</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadBridePhoto}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Amplop & Rekening Digital */}
                <div className="glass-panel p-6 rounded-3xl border border-amber-400/30 space-y-4">
                  <h4 className="font-cinzel text-base font-bold text-amber-100">
                    Rekening Amplop Digital & Barcode QRIS
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {eventsForm.bankAccounts.map((bank, index) => (
                      <div key={bank.id} className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                        <span className="text-xs font-bold text-amber-400">{bank.bankName}</span>
                        <div>
                          <label className="block text-[10px] text-neutral-400">Nomor Rekening</label>
                          <input
                            type="text"
                            value={bank.accountNumber}
                            onChange={(e) => {
                              const updated = [...eventsForm.bankAccounts];
                              updated[index].accountNumber = e.target.value;
                              setEventsForm({ ...eventsForm, bankAccounts: updated });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-amber-100 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-neutral-400">Atas Nama Pemilik</label>
                          <input
                            type="text"
                            value={bank.accountHolder}
                            onChange={(e) => {
                              const updated = [...eventsForm.bankAccounts];
                              updated[index].accountHolder = e.target.value;
                              setEventsForm({ ...eventsForm, bankAccounts: updated });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-amber-100"
                          />
                        </div>

                        {bank.logoType === 'qris' && (
                          <div className="pt-2">
                            <label className="block text-[10px] text-neutral-400 mb-1">Unggah Barcode QRIS dari HP/Laptop</label>
                            <label className="w-full py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] text-amber-300 font-semibold cursor-pointer flex items-center justify-center space-x-1 border border-neutral-700">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{bank.qrisImageUrl ? 'Ganti Gambar QRIS' : 'Pilih File QRIS'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUploadQrisImage(e, index)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Alamat Pengiriman Kado Fisik
                    </label>
                    <textarea
                      rows={2}
                      value={eventsForm.physicalGiftAddress}
                      onChange={(e) => setEventsForm({ ...eventsForm, physicalGiftAddress: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingEvents}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSavingEvents ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{isSavingEvents ? 'Menyimpan...' : 'Simpan Perubahan ke Database'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* 3. TAB: VIDEO ANIMASI & SINEMATIK (Direct Upload) */}
            {activeTab === 'video' && (
              <form onSubmit={handleSaveVideo} className="space-y-8 max-w-4xl">
                <div>
                  <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-1">
                    Video Animasi & Sinematik Momen Bahagia
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Unggah video kisah kasih atau animasi momen pernikahan langsung dari file laptop atau ponsel Anda. Video akan langsung tampil dengan bingkai emas sinematik di frontend!
                  </p>
                </div>

                {/* Upload Box */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/40 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-2">
                      <Film className="w-4 h-4" />
                      <span>Unggah Video Langsung dari Perangkat (Laptop / HP)</span>
                    </span>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={videoForm.enabled}
                        onChange={(e) => setVideoForm({ ...videoForm, enabled: e.target.checked })}
                        className="rounded border-neutral-700 text-amber-400 focus:ring-amber-400"
                      />
                      <span className="text-xs text-neutral-300">Tampilkan di Frontend</span>
                    </label>
                  </div>

                  {/* Drag and Drop / File Input */}
                  <label className="border-2 border-dashed border-amber-400/40 hover:border-amber-400/80 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-neutral-900/40 hover:bg-neutral-900/80 transition-all text-center">
                    <Upload className="w-10 h-10 text-amber-400 mb-2 animate-bounce" />
                    <span className="text-xs font-bold text-white mb-1">
                      Klik untuk Pilih Video Animasi dari HP / Laptop Anda
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Mendukung format MP4, WebM, MOV (Maksimal 100 MB)
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                  </label>

                  {isUploadingVideo && (
                    <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-200 flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Sedang mengunggah video ke server backend... Mohon tunggu sebentar.</span>
                    </div>
                  )}

                  {/* Video URL & Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        URL File Video (Terisi Otomatis saat Diunggah)
                      </label>
                      <input
                        type="text"
                        value={videoForm.videoUrl}
                        onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                        placeholder="/uploads/video-pernikahan.mp4"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Judul Video Animasi
                      </label>
                      <input
                        type="text"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                        placeholder="Contoh: Kilas Kisah Kasih Menuju Janji Suci"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Narasi / Keterangan Singkat
                      </label>
                      <textarea
                        rows={2}
                        value={videoForm.caption}
                        onChange={(e) => setVideoForm({ ...videoForm, caption: e.target.value })}
                        placeholder="Contoh: Cuplikan momen terindah dan komitmen cinta suci Rubi & Silvi"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 resize-none focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Video Preview */}
                  {videoForm.videoUrl && (
                    <div className="pt-2">
                      <span className="block text-xs font-bold text-amber-300 mb-2">Pratinjau Video Saat Ini:</span>
                      <div className="aspect-video max-w-lg rounded-2xl overflow-hidden border border-amber-400/40 shadow-xl bg-neutral-950">
                        <video src={videoForm.videoUrl} controls className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSavingVideo || isUploadingVideo}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSavingVideo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{isSavingVideo ? 'Menyimpan...' : 'Simpan Video ke Database & Tampilkan'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* 4. TAB: MUSIC & AUDIO MANAGEMENT (Upload from Device) */}
            {activeTab === 'music' && (
              <div className="space-y-8 max-w-4xl">
                <div>
                  <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-1">
                    Lagu Pernikahan & Pemutar Musik
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Lagu latar dapat diunggah langsung dari file MP3 di laptop atau ponsel Anda. Begitu Anda simpan ke database, lagu di layar seluruh pengunjung akan otomatis berganti dan terputar!
                  </p>
                </div>

                {/* Direct Audio Upload from Device */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/40 space-y-6">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <Laptop className="w-4 h-4" />
                    <span>Unggah File Lagu MP3 Langsung dari Perangkat Anda</span>
                  </div>

                  <label className="border-2 border-dashed border-amber-400/40 hover:border-amber-400/80 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-neutral-900/40 hover:bg-neutral-900/80 transition-all text-center">
                    <Music className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
                    <span className="text-xs font-bold text-white mb-1">
                      Pilih File Lagu MP3 / WAV dari Laptop atau Ponsel Anda
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      File akan disimpan langsung di database backend server internal Anda
                    </span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="hidden"
                    />
                  </label>

                  {isUploadingAudio && (
                    <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-200 flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Sedang mengunggah audio ke server... Mohon tunggu sebentar.</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveAudio} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Judul Lagu
                        </label>
                        <input
                          type="text"
                          value={audioForm.title}
                          onChange={(e) => setAudioForm({ ...audioForm, title: e.target.value })}
                          required
                          placeholder="Contoh: A Thousand Years"
                          className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Nama Artis / Musisi
                        </label>
                        <input
                          type="text"
                          value={audioForm.artist}
                          onChange={(e) => setAudioForm({ ...audioForm, artist: e.target.value })}
                          required
                          placeholder="Contoh: Christina Perri"
                          className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        URL File Audio
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={audioForm.audioUrl}
                          onChange={(e) => setAudioForm({ ...audioForm, audioUrl: e.target.value })}
                          required
                          className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 font-mono focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={togglePreviewAudio}
                          className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                        >
                          {previewAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span>{previewAudioPlaying ? 'Jeda' : 'Dengar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="check-autoplay"
                        checked={audioForm.autoPlay}
                        onChange={(e) => setAudioForm({ ...audioForm, autoPlay: e.target.checked })}
                        className="rounded border-neutral-700 text-amber-400 focus:ring-amber-400 cursor-pointer"
                      />
                      <label htmlFor="check-autoplay" className="text-xs text-neutral-300 cursor-pointer">
                        Putar otomatis saat tamu klik &ldquo;Buka Undangan&rdquo;
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingAudio || isUploadingAudio}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSavingAudio ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isSavingAudio ? 'Menyimpan...' : 'Simpan Lagu ke Database & Sinkronkan'}</span>
                    </button>
                  </form>
                </div>

                {/* Preset Romance Songs */}
                <div className="space-y-3">
                  <h4 className="font-cinzel text-lg font-bold text-amber-100">
                    Pilihan Lagu Cadangan Romantis
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {songPresets.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setAudioForm({
                            title: preset.title,
                            artist: preset.artist,
                            audioUrl: preset.url,
                            autoPlay: true,
                          });
                          showToast(`Lagu "${preset.title}" dipilih! Klik Simpan.`);
                        }}
                        className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer hover:border-amber-400/60 ${
                          audioForm.audioUrl === preset.url
                            ? 'border-amber-400 bg-amber-400/10'
                            : 'border-neutral-800'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                            <Music className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs text-amber-100">{preset.title}</h5>
                            <p className="text-[11px] text-neutral-400">{preset.artist}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. TAB: GALLERY & ANIMATED MEDIA */}
            {activeTab === 'gallery' && (
              <div className="space-y-8 max-w-5xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-cinzel text-2xl font-bold text-amber-100">
                      Kelola Galeri Foto & Animasi
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Unggah foto dan klip video animasi momen prewedding langsung dari kamera atau galeri HP/laptop Anda.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddPhotoModal(true)}
                    className="px-4 py-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider flex items-center space-x-1.5 cursor-pointer hover:bg-amber-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Media dari Perangkat</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gallery.map((item) => {
                    const isVideo = item.mediaType === 'video' || /\.(mp4|webm|mov)$/i.test(item.url);
                    return (
                      <div
                        key={item.id}
                        className="group relative rounded-2xl overflow-hidden glass-panel border border-neutral-800 aspect-square shadow-lg bg-neutral-950"
                      >
                        {isVideo ? (
                          <video
                            src={item.url}
                            muted
                            loop
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        {isVideo && (
                          <div className="absolute top-2 right-2 p-1 rounded-md bg-neutral-950/80 text-amber-300 border border-amber-400/40">
                            <Film className="w-3 h-3" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-neutral-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                          <span className="text-[10px] text-amber-400 uppercase tracking-wider">
                            {item.category}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-1">{item.title}</p>
                            <button
                              onClick={() => handleDeleteGalleryItem(item.id)}
                              className="mt-2 w-full py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Media</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. TAB: GUEST MANAGEMENT */}
            {activeTab === 'guests' && (
              <div className="space-y-6 max-w-6xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-cinzel text-2xl font-bold text-amber-100">
                      Daftar Tamu Undangan
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Kelola daftar tamu, buat link personalisasi, dan pantau status RSVP.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowBulkAddModal(true)}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-xs border border-neutral-700 cursor-pointer"
                    >
                      Impor Massal
                    </button>
                    <button
                      onClick={() => setShowAddGuestModal(true)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-400/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Tamu</span>
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                      placeholder="Cari nama tamu undangan..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Guest Table */}
                <div className="glass-panel rounded-2xl border border-neutral-800 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900/60 border-b border-neutral-800 text-neutral-400 font-mono text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Nama Tamu</th>
                        <th className="p-4">Kategori</th>
                        <th className="p-4">Status RSVP</th>
                        <th className="p-4">Kuota Pax</th>
                        <th className="p-4 text-right">Tautan & Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {guests
                        .filter((g) => g.name.toLowerCase().includes(guestSearch.toLowerCase()))
                        .map((guest) => (
                          <tr key={guest.id} className="hover:bg-neutral-900/40">
                            <td className="p-4 font-semibold text-amber-100">{guest.name}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px]">
                                {guest.category}
                              </span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  guest.rsvpStatus === 'Hadir'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                    : guest.rsvpStatus === 'Tidak Hadir'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {guest.rsvpStatus}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-neutral-300">{guest.pax} orang</td>
                            <td className="p-4 text-right space-x-1">
                              <button
                                onClick={() => copyInvitationLink(guest)}
                                title="Salin Tautan Khusus"
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 transition-colors cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => shareViaWhatsApp(guest)}
                                title="Kirim via WhatsApp"
                                className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 transition-colors cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteGuest(guest.id, guest.name)}
                                title="Hapus Tamu"
                                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. TAB: WISHES & RSVP */}
            {activeTab === 'wishes' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-1">
                    Kelola Ucapan, Doa & Balasan
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Sematkan doa terbaik ke posisi atas atau berikan balasan langsung dari mempelai.
                  </p>
                </div>

                <div className="space-y-4">
                  {wishes.map((wish) => (
                    <div
                      key={wish.id}
                      className={`glass-panel p-5 rounded-2xl border transition-all ${
                        wish.isPinned
                          ? 'border-amber-400 bg-amber-400/5 shadow-lg shadow-amber-400/10'
                          : 'border-neutral-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-bold text-sm text-amber-100">{wish.guestName}</h5>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                wish.attendance === 'Hadir'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}
                            >
                              {wish.attendance}
                            </span>
                            {wish.isPinned && (
                              <span className="text-[10px] text-amber-400 flex items-center space-x-1 font-semibold">
                                <Pin className="w-3 h-3" />
                                <span>Disematkan</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-300 mt-2 font-serif italic leading-relaxed">
                            &ldquo;{wish.message}&rdquo;
                          </p>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleTogglePin(wish)}
                            title={wish.isPinned ? 'Lepas Sematan' : 'Sematkan di Atas'}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                              wish.isPinned
                                ? 'bg-amber-400 text-neutral-950 font-bold'
                                : 'bg-neutral-800 text-neutral-300 hover:text-amber-300'
                            }`}
                          >
                            {wish.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingWishId(wish.id);
                              setReplyText(wish.adminReply || '');
                            }}
                            title="Balas Ucapan"
                            className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWish(wish.id)}
                            title="Hapus Ucapan"
                            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Admin Reply Display */}
                      {wish.adminReply && replyingWishId !== wish.id && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs">
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">
                            Balasan Mempelai:
                          </span>
                          <p className="text-neutral-200">{wish.adminReply}</p>
                        </div>
                      )}

                      {/* Reply Input Form */}
                      {replyingWishId === wish.id && (
                        <div className="mt-3 p-3 rounded-xl bg-neutral-900 border border-amber-400/40 space-y-2">
                          <label className="text-[11px] font-bold text-amber-300">Tulis Balasan Mempelai:</label>
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Aamiin ya Rabbal alamin, terima kasih banyak atas doa dan restunya..."
                            className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-amber-100 resize-none focus:outline-none focus:border-amber-400"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setReplyingWishId(null)}
                              className="px-3 py-1 rounded-lg text-xs text-neutral-400 hover:text-white"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleReplyWish(wish.id)}
                              className="px-4 py-1 rounded-lg bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer hover:bg-amber-300"
                            >
                              Kirim Balasan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. TAB: SECURITY & DOMAIN ISOLATION ARCHITECTURE */}
            {activeTab === 'security' && (
              <div className="space-y-8 max-w-3xl">
                <div>
                  <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-1">
                    Keamanan & Arsitektur Terisolasi Anti-Hacker
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Sistem dirancang dengan arsitektur modern standar industri untuk 10 tahun ke depan, menjamin perlindungan privasi pengantin dan keamanan database.
                  </p>
                </div>

                {/* Domain Isolation Guidance (Decoupled Setup) */}
                <div className="glass-panel p-6 rounded-3xl border border-amber-400/40 space-y-4">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <Globe className="w-4 h-4" />
                    <span>Panduan Integrasi Domain Terpisah (Frontend & Backend Decoupled)</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Sesuai dengan kebutuhan arsitektur Anda, aplikasi ini sepenuhnya mendukung pemisahan domain (Decoupled Domain Deployment) agar panel admin dan backend tidak dapat dilihat oleh publik:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">1. Domain Frontend (User Publik)</span>
                      <p className="font-mono text-white text-[11px]">https://undangan.domainanda.com</p>
                      <p className="text-[11px] text-neutral-400">
                        Hanya berisi tampilan undangan publik, animasi 3D, galeri, dan pemutar musik. Bebas dari tombol admin atau script manajemen.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">2. Domain Backend & API Database</span>
                      <p className="font-mono text-white text-[11px]">https://api.domainanda.com</p>
                      <p className="text-[11px] text-neutral-400">
                        Berdiri sendiri sebagai REST API & SSE, terlindungi CORS ketat, JWT Token Bearer, dan hashing PBKDF2-SHA512.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    <span>
                      <strong>Perlindungan Brute-Force:</strong> Jika terjadi 5 kali kegagalan login berturut-turut, IP penyerang otomatis diblokir selama 15 menit.
                    </span>
                  </div>
                </div>

                {/* Change Password Form */}
                <form onSubmit={handleChangePassword} className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/30 space-y-4">
                  <h4 className="font-cinzel text-lg font-bold text-amber-100 flex items-center space-x-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Perbarui Kata Sandi Admin</span>
                  </h4>

                  {securityStatus && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                        securityStatus.type === 'success'
                          ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
                          : 'bg-rose-950/80 border border-rose-500 text-rose-200'
                      }`}
                    >
                      {securityStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{securityStatus.message}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Kata Sandi Saat Ini
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Kata Sandi Baru (Min. 6 Karakter)
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Ulangi Kata Sandi Baru
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Simpan Kata Sandi Baru
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      )}

      {/* MODAL: ADD GALLERY ITEM DIRECT FROM DEVICE */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-amber-400/40 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel text-lg font-bold text-amber-100">
                Unggah Foto atau Video Animasi
              </h4>
              <button
                onClick={() => {
                  setShowAddPhotoModal(false);
                  setSelectedGalleryFile(null);
                  setGalleryPreviewSrc(null);
                }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGalleryItem} className="space-y-4">
              <label className="border-2 border-dashed border-amber-400/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-neutral-900/40 hover:bg-neutral-900/80 text-center">
                <Upload className="w-8 h-8 text-amber-400 mb-2" />
                <span className="text-xs font-bold text-white mb-1">
                  Pilih Foto atau Video Animasi dari HP/Laptop
                </span>
                <span className="text-[10px] text-neutral-400">
                  Foto (JPG, PNG, WebP) atau Video (MP4, WebM)
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleGalleryFileChange}
                  className="hidden"
                />
              </label>

              {galleryPreviewSrc && (
                <div className="rounded-xl overflow-hidden max-h-48 border border-neutral-700 bg-neutral-950 flex items-center justify-center">
                  {newGalleryItem.mediaType === 'video' ? (
                    <video src={galleryPreviewSrc} controls className="max-h-48 w-full object-contain" />
                  ) : (
                    <img src={galleryPreviewSrc} alt="Preview" className="max-h-48 object-contain" />
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Judul Media</label>
                <input
                  type="text"
                  value={newGalleryItem.title}
                  onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                  required
                  placeholder="Contoh: Senyuman Menuju Bahagia"
                  className="w-full px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Kategori</label>
                <select
                  value={newGalleryItem.category}
                  onChange={(e) =>
                    setNewGalleryItem({
                      ...newGalleryItem,
                      category: e.target.value as GalleryItem['category'],
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="Prewedding">Prewedding</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Moments">Moments</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingGallery}
                  className="px-6 py-2 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingGallery ? 'Mengunggah...' : 'Simpan ke Galeri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GUEST */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-amber-400/40 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel text-lg font-bold text-amber-100">Tambah Tamu Undangan</h4>
              <button onClick={() => setShowAddGuestModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nama Tamu</label>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  required
                  placeholder="Contoh: Bpk. H. Ansori & Keluarga"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Kategori</label>
                  <select
                    value={newGuest.category}
                    onChange={(e) => setNewGuest({ ...newGuest, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Sahabat">Sahabat</option>
                    <option value="VIP">VIP</option>
                    <option value="Rekan Kerja">Rekan Kerja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Kuota Tamu (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newGuest.pax}
                    onChange={(e) => setNewGuest({ ...newGuest, pax: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nomor WhatsApp (Opsional)</label>
                <input
                  type="tel"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 cursor-pointer"
                >
                  Simpan Tamu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BULK ADD GUESTS */}
      {showBulkAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-amber-400/40 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel text-lg font-bold text-amber-100">Impor Tamu Massal</h4>
              <button onClick={() => setShowBulkAddModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Ketik atau tempel daftar nama tamu undangan (satu nama per baris):
            </p>

            <form onSubmit={handleBulkAddGuests} className="space-y-4">
              <textarea
                rows={6}
                value={bulkNamesText}
                onChange={(e) => setBulkNamesText(e.target.value)}
                placeholder={"Bpk. Ahmad Subarjo\nIbu Siti Aminah\nDr. Hendra Wijaya\nKeluarga Besar Bpk. Suparman"}
                required
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 font-sans focus:outline-none focus:border-amber-400"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBulkAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 cursor-pointer"
                >
                  Proses & Simpan Semua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
