import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Guest, Wish, WeddingSettings, GalleryItem } from '../types.js';

interface AdminDashboardProps {
  onClose: () => void;
  onSettingsUpdated: (newSettings: WeddingSettings) => void;
  onGalleryUpdated: (newGallery: GalleryItem[]) => void;
}

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
  const [activeTab, setActiveTab] = useState<'stats' | 'guests' | 'wishes' | 'music' | 'settings' | 'security'>('stats');

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

  // Settings & Music Data
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [audioForm, setAudioForm] = useState({
    title: '',
    artist: '',
    audioUrl: '',
    autoPlay: true,
  });
  const [previewAudioPlaying, setPreviewAudioPlaying] = useState(false);
  const [audioPreviewRef, setAudioPreviewRef] = useState<HTMLAudioElement | null>(null);

  // New Gallery Item Modal
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [photoUploadType, setPhotoUploadType] = useState<'file' | 'url'>('file');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreviewSrc, setPhotoPreviewSrc] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    url: '',
    category: 'Prewedding' as GalleryItem['category'],
    featured: false,
  });

  // Security Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastPasswordUpdate, setLastPasswordUpdate] = useState<string | null>(null);

  // Feedback Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  // Check login on load
  useEffect(() => {
    if (token) {
      fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then((data) => {
          setLastPasswordUpdate(data.lastPasswordUpdate);
          loadAllAdminData();
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem('wedding_admin_token');
        });
    }
  }, [token]);

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
        throw new Error(data.error || 'Login gagal.');
      }

      setToken(data.token);
      localStorage.setItem('wedding_admin_token', data.token);
      setLastPasswordUpdate(data.lastUpdated);
      setPasswordInput('');
      loadAllAdminData();
      showToast('Login berhasil!');
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setToken(null);
    localStorage.removeItem('wedding_admin_token');
  };

  const loadAllAdminData = () => {
    if (!token) return;

    // Load Stats
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});

    // Load Guests
    fetch('/api/admin/guests', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setGuests(d.guests || []))
      .catch(() => {});

    // Load Wishes
    fetch('/api/admin/wishes', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setWishes(d.wishes || []))
      .catch(() => {});

    // Load Settings
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setSettings(d.settings);
          setAudioForm({
            title: d.settings.audio.title,
            artist: d.settings.audio.artist,
            audioUrl: d.settings.audio.audioUrl,
            autoPlay: d.settings.audio.autoPlay,
          });
        }
      })
      .catch(() => {});

    // Load Gallery
    fetch('/api/wedding')
      .then((r) => r.json())
      .then((d) => setGallery(d.gallery || []))
      .catch(() => {});
  };

  // --- GUEST MANAGEMENT ACTIONS ---
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
      showToast('Tamu berhasil ditambahkan!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/guests/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ namesText: bulkNamesText, category: 'Umum', pax: 2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowBulkAddModal(false);
      setBulkNamesText('');
      loadAllAdminData();
      showToast(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tamu ini?')) return;
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

  const handleUpdateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    try {
      const res = await fetch(`/api/admin/guests/${editingGuest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingGuest),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGuests(guests.map((g) => (g.id === editingGuest.id ? data.guest : g)));
      setEditingGuest(null);
      showToast('Data tamu berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // WhatsApp link generator
  const getWhatsAppLink = (guest: Guest) => {
    const origin = window.location.origin;
    const invitationLink = `${origin}?to=${encodeURIComponent(guest.name)}`;
    const text = `Kepada Yth. Bpk/Ibu/Sdr/i ${guest.name},\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di pernikahan kami (Rubi & Silvi):\n\n${invitationLink}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.\n\nTerima kasih.`;

    const phone = guest.phone ? guest.phone.replace(/[^0-9]/g, '').replace(/^0/, '62') : '';
    if (phone) {
      return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const copyGuestLink = (guest: Guest) => {
    const origin = window.location.origin;
    const link = `${origin}?to=${encodeURIComponent(guest.name)}`;
    navigator.clipboard.writeText(link);
    showToast(`Link untuk ${guest.name} tersalin!`);
  };

  // Export to CSV
  const exportGuestsCsv = () => {
    const headers = ['Nama Tamu', 'Kategori', 'No. WhatsApp', 'Kuota Pax', 'Status RSVP', 'Pax Hadir', 'Catatan'];
    const rows = guests.map((g) => [
      `"${g.name}"`,
      `"${g.category}"`,
      `"${g.phone || '-'}"`,
      g.pax,
      `"${g.rsvpStatus}"`,
      g.actualPax || 0,
      `"${g.notes || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Tamu_Rubi_Silvi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh!');
  };

  // --- WISHES MANAGEMENT ACTIONS ---
  const handleTogglePinWish = async (wish: Wish) => {
    try {
      const res = await fetch(`/api/admin/wishes/${wish.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned: !wish.isPinned }),
      });
      const data = await res.json();
      if (res.ok) {
        setWishes(wishes.map((w) => (w.id === wish.id ? data.wish : w)));
        showToast(wish.isPinned ? 'Pin dilepas.' : 'Ucapan berhasil disematkan di paling atas!');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReplyWish = async (wishId: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/admin/wishes/${wishId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminReply: replyText.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setWishes(wishes.map((w) => (w.id === wishId ? data.wish : w)));
        setReplyingWishId(null);
        setReplyText('');
        showToast('Balasan doa berhasil dipublikasikan!');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm('Hapus ucapan ini?')) return;
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

  // --- AUDIO & MUSIC SETTINGS ---
  const handleSaveAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          audio: audioForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSettings(data.settings);
      onSettingsUpdated(data.settings);
      showToast('Pengaturan musik & lagu berhasil disimpan ke database!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const togglePreviewAudio = () => {
    if (!audioPreviewRef) {
      const audio = new Audio(audioForm.audioUrl);
      setAudioPreviewRef(audio);
      audio.play().then(() => setPreviewAudioPlaying(true));
      audio.onended = () => setPreviewAudioPlaying(false);
    } else {
      if (previewAudioPlaying) {
        audioPreviewRef.pause();
        setPreviewAudioPlaying(false);
      } else {
        audioPreviewRef.src = audioForm.audioUrl;
        audioPreviewRef.play().then(() => setPreviewAudioPlaying(true));
      }
    }
  };

  // --- GALLERY MANAGEMENT ---
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhotoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreviewSrc(objectUrl);
      if (!newPhoto.title) {
        // Auto-generate title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewPhoto((prev) => ({ ...prev, title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1) }));
      }
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingPhoto(true);

    try {
      let finalUrl = newPhoto.url;

      // If uploading file directly from device (phone / laptop)
      if (photoUploadType === 'file') {
        if (!selectedPhotoFile) {
          throw new Error('Silakan pilih file foto dari perangkat Anda terlebih dahulu.');
        }

        const formData = new FormData();
        formData.append('photo', selectedPhotoFile);

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Gagal mengunggah foto ke server.');
        }

        finalUrl = uploadData.url;
      }

      if (!finalUrl) {
        throw new Error('URL foto tidak valid.');
      }

      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newPhoto,
          url: finalUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updatedGallery = [...gallery, data.item];
      setGallery(updatedGallery);
      onGalleryUpdated(updatedGallery);
      setShowAddPhotoModal(false);
      setSelectedPhotoFile(null);
      setPhotoPreviewSrc(null);
      setNewPhoto({ title: '', url: '', category: 'Prewedding', featured: false });
      showToast('Foto dari perangkat berhasil disimpan ke galeri pernikahan!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Hapus foto ini dari galeri?')) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = gallery.filter((g) => g.id !== id);
        setGallery(updated);
        onGalleryUpdated(updated);
        showToast('Foto berhasil dihapus.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- SECURITY & PASSWORD UPDATE ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityStatus(null);

    if (newPassword !== confirmPassword) {
      setSecurityStatus({ type: 'error', message: 'Konfirmasi password baru tidak cocok!' });
      return;
    }

    if (newPassword.length < 6) {
      setSecurityStatus({ type: 'error', message: 'Password baru minimal harus 6 karakter.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
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
          <Sparkles className="w-4 h-4" />
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
              Dashboard Admin Pernikahan
            </h2>
            <p className="text-[11px] text-neutral-400 tracking-wider">
              Rubi Febrian & Silvi Novitasari • Sistem Keamanan Terenkripsi
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
        // Login Screen
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-amber-400/40 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-1">
              Login Autentikasi
            </h3>
            <p className="text-xs text-neutral-400 mb-6 font-sans">
              Masukkan password admin untuk mengakses pengelolaan tamu, doa, musik, dan pengaturan pernikahan.
            </p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                  Password Admin
                </label>
                <div className="relative">
                  <input
                    id="input-admin-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password..."
                    required
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-amber-400/30 text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-amber-300"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                id="btn-submit-admin-login"
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-full text-neutral-950 font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {loginLoading ? 'Memverifikasi...' : 'Masuk Dashboard'}
              </button>

              <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 text-[11px] text-amber-200/80 leading-relaxed text-center">
                Default password awal: <span className="font-mono text-amber-400 font-bold">admin1234</span>
                <br />
                <span className="text-neutral-400">
                  (Dapat langsung Anda ubah di tab Keamanan & Password setelah login)
                </span>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // Authenticated Dashboard
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-64 border-r border-amber-400/20 p-4 space-y-2 bg-neutral-950/50 shrink-0 overflow-x-auto md:overflow-y-auto flex md:flex-col">
            {[
              { id: 'stats', label: 'Ringkasan & Metrik', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'guests', label: 'Manajemen Tamu', icon: <Users className="w-4 h-4" /> },
              { id: 'wishes', label: 'Kelola Ucapan Tamu', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'music', label: 'Lagu & Pemutar Musik', icon: <Music className="w-4 h-4" /> },
              { id: 'settings', label: 'Galeri & Acara', icon: <ImageIcon className="w-4 h-4" /> },
              { id: 'security', label: 'Keamanan & Password', icon: <Shield className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider transition-all w-full text-left whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-lg shadow-amber-400/20'
                    : 'text-neutral-400 hover:text-amber-200 hover:bg-neutral-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            {/* 1. TAB: STATS / RINGKASAN */}
            {activeTab === 'stats' && (
              <div className="space-y-8 max-w-5xl">
                <div>
                  <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-1">
                    Ringkasan Acara Pernikahan
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Statistik real-time konfirmasi kehadiran tamu dan doa restu yang masuk.
                  </p>
                </div>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="glass-panel p-5 rounded-2xl border border-amber-400/30">
                    <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Total Tamu Diundang</p>
                    <h4 className="font-cinzel text-3xl font-bold text-amber-100">{guests.length}</h4>
                    <p className="text-[11px] text-amber-400 mt-2 font-sans">
                      Estimasi kuota: {stats?.totalEstimatedPax || 0} pax
                    </p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                    <p className="text-xs text-emerald-300 uppercase tracking-wider mb-1">Konfirmasi Hadir</p>
                    <h4 className="font-cinzel text-3xl font-bold text-emerald-400">{stats?.confirmedAttending || 0}</h4>
                    <p className="text-[11px] text-emerald-300 mt-2 font-sans">
                      Total hadir: {stats?.totalActualPax || 0} orang
                    </p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                    <p className="text-xs text-amber-300 uppercase tracking-wider mb-1">Masih Ragu-ragu</p>
                    <h4 className="font-cinzel text-3xl font-bold text-amber-300">{stats?.confirmedUndecided || 0}</h4>
                    <p className="text-[11px] text-neutral-400 mt-2 font-sans">Perlu follow-up</p>
                  </div>

                  <div className="glass-panel p-5 rounded-2xl border border-neutral-700 bg-neutral-900/50">
                    <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Belum Konfirmasi</p>
                    <h4 className="font-cinzel text-3xl font-bold text-neutral-300">{stats?.unconfirmed || 0}</h4>
                    <p className="text-[11px] text-neutral-400 mt-2 font-sans">
                      Tidak Hadir: {stats?.confirmedNotAttending || 0}
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="glass-panel p-6 rounded-3xl border border-amber-400/20 space-y-4">
                  <h4 className="font-cinzel text-lg font-bold text-amber-100">
                    Aksi Cepat
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowAddGuestModal(true)}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider cursor-pointer hover:bg-amber-300"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Tamu Baru</span>
                    </button>
                    <button
                      onClick={() => setShowBulkAddModal(true)}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full glass-panel border border-amber-400/40 text-amber-200 text-xs font-semibold cursor-pointer hover:bg-amber-400/10"
                    >
                      <Users className="w-4 h-4" />
                      <span>Import Nama Massal</span>
                    </button>
                    <button
                      onClick={exportGuestsCsv}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full glass-panel border border-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer hover:bg-neutral-800"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export ke Excel/CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TAB: GUESTS MANAGEMENT */}
            {activeTab === 'guests' && (
              <div className="space-y-6 max-w-6xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-cinzel text-2xl font-bold text-amber-100">
                      Manajemen Tamu Undangan
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Kelola daftar tamu, buat link WhatsApp personal otomatis, dan pantau status RSVP.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      id="btn-admin-add-guest"
                      onClick={() => setShowAddGuestModal(true)}
                      className="px-4 py-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider flex items-center space-x-1.5 cursor-pointer hover:bg-amber-300 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Tamu</span>
                    </button>
                    <button
                      onClick={() => setShowBulkAddModal(true)}
                      className="px-4 py-2.5 rounded-full glass-panel border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer hover:bg-amber-400/10"
                    >
                      <span>Input Massal</span>
                    </button>
                    <button
                      onClick={exportGuestsCsv}
                      className="p-2.5 rounded-full glass-panel border border-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
                      title="Export CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Cari nama tamu..."
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <select
                    value={guestFilterCategory}
                    onChange={(e) => setGuestFilterCategory(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 cursor-pointer focus:outline-none focus:border-amber-400"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="VIP">VIP</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Sahabat">Sahabat</option>
                    <option value="Rekan Kerja">Rekan Kerja</option>
                    <option value="Umum">Umum</option>
                  </select>

                  <select
                    value={guestFilterStatus}
                    onChange={(e) => setGuestFilterStatus(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 cursor-pointer focus:outline-none focus:border-amber-400"
                  >
                    <option value="Semua">Semua Status RSVP</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Ragu-ragu">Ragu-ragu</option>
                    <option value="Tidak Hadir">Tidak Hadir</option>
                    <option value="Belum Konfirmasi">Belum Konfirmasi</option>
                  </select>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl border border-amber-400/20 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-900/80 border-b border-amber-400/20 text-[11px] uppercase tracking-wider text-amber-300 font-sans">
                        <tr>
                          <th className="px-4 py-3.5">Nama Tamu</th>
                          <th className="px-4 py-3.5">Kategori</th>
                          <th className="px-4 py-3.5">WhatsApp</th>
                          <th className="px-4 py-3.5">Status RSVP</th>
                          <th className="px-4 py-3.5">Jumlah</th>
                          <th className="px-4 py-3.5 text-right">Aksi & Undangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {guests
                          .filter((g) => {
                            const matchSearch = g.name.toLowerCase().includes(guestSearch.toLowerCase());
                            const matchCategory = guestFilterCategory === 'Semua' || g.category === guestFilterCategory;
                            const matchStatus = guestFilterStatus === 'Semua' || g.rsvpStatus === guestFilterStatus;
                            return matchSearch && matchCategory && matchStatus;
                          })
                          .map((guest) => (
                            <tr key={guest.id} className="hover:bg-neutral-900/50 transition-colors">
                              <td className="px-4 py-3.5 font-semibold text-amber-100">
                                <div>{guest.name}</div>
                                {guest.notes && <div className="text-[10px] text-neutral-400 italic">{guest.notes}</div>}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px]">
                                  {guest.category}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 font-mono text-neutral-400">
                                {guest.phone || '-'}
                              </td>
                              <td className="px-4 py-3.5">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                                    guest.rsvpStatus === 'Hadir'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : guest.rsvpStatus === 'Ragu-ragu'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : guest.rsvpStatus === 'Tidak Hadir'
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                      : 'bg-neutral-800 text-neutral-400'
                                  }`}
                                >
                                  {guest.rsvpStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="font-semibold text-amber-200">
                                  {guest.rsvpStatus === 'Hadir' ? guest.actualPax || guest.pax : guest.pax}
                                </span>{' '}
                                pax
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end space-x-1.5">
                                  {/* Copy personalized invitation link */}
                                  <button
                                    onClick={() => copyGuestLink(guest)}
                                    title="Salin Link Undangan"
                                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-amber-400/20 hover:text-amber-300 text-neutral-300 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Direct WhatsApp Share */}
                                  <a
                                    href={getWhatsAppLink(guest)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Kirim Undangan WhatsApp"
                                    className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 cursor-pointer border border-emerald-500/30"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                  </a>

                                  {/* Edit */}
                                  <button
                                    onClick={() => setEditingGuest(guest)}
                                    title="Edit Tamu"
                                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    onClick={() => handleDeleteGuest(guest.id)}
                                    title="Hapus Tamu"
                                    className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TAB: WISHES MANAGEMENT */}
            {activeTab === 'wishes' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h3 className="font-cinzel text-2xl font-bold text-amber-100">
                    Pengelolaan Ucapan & Doa Restu
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Sematkan ucapan terbaik di paling atas, beri balasan personal dari pengantin, atau moderasi pesan.
                  </p>
                </div>

                {/* Filter */}
                <div className="flex space-x-2">
                  {(['all', 'pinned'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setWishFilter(filter)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        wishFilter === filter
                          ? 'bg-amber-400 text-neutral-950'
                          : 'glass-panel text-neutral-400 hover:text-amber-200'
                      }`}
                    >
                      {filter === 'all' ? `Semua Ucapan (${wishes.length})` : 'Disematkan (Pinned)'}
                    </button>
                  ))}
                </div>

                {/* Wishes Feed */}
                <div className="space-y-4">
                  {wishes
                    .filter((w) => (wishFilter === 'pinned' ? w.isPinned : true))
                    .map((wish) => (
                      <div
                        key={wish.id}
                        className={`glass-panel p-5 rounded-2xl border transition-all ${
                          wish.isPinned ? 'border-amber-400/50 bg-amber-500/5' : 'border-neutral-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h4 className="font-bold text-amber-100 text-sm flex items-center space-x-2">
                              <span>{wish.guestName}</span>
                              {wish.isPinned && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                  Disematkan
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-neutral-400">
                              {wish.relationship} • {new Date(wish.createdAt).toLocaleString('id-ID')}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {/* Pin / Unpin */}
                            <button
                              onClick={() => handleTogglePinWish(wish)}
                              title={wish.isPinned ? 'Lepas Pin' : 'Sematkan ke Atas'}
                              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                                wish.isPinned
                                  ? 'bg-amber-400 text-neutral-950 font-bold'
                                  : 'bg-neutral-800 text-neutral-400 hover:text-amber-300'
                              }`}
                            >
                              {wish.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteWish(wish.id)}
                              title="Hapus Ucapan"
                              className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed mb-4">
                          {wish.message}
                        </p>

                        {/* Existing Admin Reply */}
                        {wish.adminReply && (
                          <div className="p-3 rounded-xl bg-neutral-900/90 border border-amber-400/30 text-xs text-neutral-300 flex items-start space-x-2 mb-3">
                            <CornerDownRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-amber-300">Balasan Anda:</span>
                              <p className="mt-0.5 text-neutral-300">{wish.adminReply}</p>
                            </div>
                          </div>
                        )}

                        {/* Reply Form Trigger */}
                        {replyingWishId === wish.id ? (
                          <div className="mt-3 space-y-2">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Tulis balasan terima kasih dari Rubi & Silvi..."
                              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-amber-400/30 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleReplyWish(wish.id)}
                                className="px-3 py-1.5 rounded-lg bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer hover:bg-amber-300"
                              >
                                Kirim Balasan
                              </button>
                              <button
                                onClick={() => setReplyingWishId(null)}
                                className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 text-xs cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingWishId(wish.id);
                              setReplyText(wish.adminReply || '');
                            }}
                            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>{wish.adminReply ? 'Ubah Balasan' : 'Beri Balasan'}</span>
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 4. TAB: MUSIC & AUDIO MANAGEMENT */}
            {activeTab === 'music' && (
              <div className="space-y-8 max-w-4xl">
                <div>
                  <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-1">
                    Pengaturan Lagu & Musik Latar
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Ganti lagu pernikahan secara dinamis. Anda dapat memasukkan URL file MP3 sendiri atau memilih dari preset lagu romantis berlisensi bebas.
                  </p>
                </div>

                {/* Form to change song */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/30 space-y-6">
                  <form onSubmit={handleSaveAudio} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
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
                      <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                        Artis / Orkestra
                      </label>
                      <input
                        type="text"
                        value={audioForm.artist}
                        onChange={(e) => setAudioForm({ ...audioForm, artist: e.target.value })}
                        required
                        placeholder="Contoh: The Wedding Strings"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                        URL File Audio MP3
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={audioForm.audioUrl}
                          onChange={(e) => setAudioForm({ ...audioForm, audioUrl: e.target.value })}
                          required
                          placeholder="https://example.com/lagu-pernikahan.mp3"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400 font-mono"
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

                    <div className="flex items-center space-x-2 pt-2">
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
                      id="btn-save-music-settings"
                      type="submit"
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      Simpan Lagu ke Database
                    </button>
                  </form>
                </div>

                {/* Song Presets */}
                <div className="space-y-3">
                  <h4 className="font-cinzel text-lg font-bold text-amber-100">
                    Pilihan Preset Lagu Romantis
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Klik salah satu preset di bawah untuk menerapkan lagu secara instan:
                  </p>
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

            {/* 5. TAB: GALLERY & WEDDING INFO */}
            {activeTab === 'settings' && (
              <div className="space-y-8 max-w-5xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-cinzel text-2xl font-bold text-amber-100">
                      Kelola Galeri Foto Pernikahan
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Tambah atau hapus foto momen prewedding, engagement, dan kenangan indah.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddPhotoModal(true)}
                    className="px-4 py-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider flex items-center space-x-1.5 cursor-pointer hover:bg-amber-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Foto</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gallery.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-2xl overflow-hidden glass-panel border border-neutral-800 aspect-square shadow-lg"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-neutral-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                        <span className="text-[10px] text-amber-400 uppercase tracking-wider">
                          {photo.category}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">{photo.title}</p>
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="mt-2 w-full py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Foto</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. TAB: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
              <div className="space-y-8 max-w-xl">
                <div>
                  <h3 className="font-cinzel text-2xl font-bold text-amber-100 mb-1">
                    Keamanan & Ganti Password Admin
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Sistem dilindungi enkripsi kriptografis tingkat militer (PBKDF2-SHA512 + Salting) dan pencegahan serangan brute-force otomatis.
                  </p>
                </div>

                {/* Security info card */}
                <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Shield className="w-4 h-4" />
                    <span>Status Proteksi Aktif</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Setiap percobaan login salah dipantau secara real-time. Jika terjadi 5 kali kegagalan beruntun, IP penyerang akan dikunci otomatis selama 15 menit.
                  </p>
                  {lastPasswordUpdate && (
                    <p className="text-[11px] text-neutral-400 pt-1">
                      Terakhir diperbarui: {new Date(lastPasswordUpdate).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                {/* Change Password Form */}
                <form onSubmit={handleChangePassword} className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/30 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                      Password Saat Ini
                    </label>
                    <input
                      id="input-old-password"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      placeholder="Masukkan password lama..."
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                      Password Baru (Minimal 6 karakter)
                    </label>
                    <input
                      id="input-new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Masukkan password baru..."
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      id="input-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Ulangi password baru..."
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {securityStatus && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                        securityStatus.type === 'success'
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <span>{securityStatus.message}</span>
                    </div>
                  )}

                  <button
                    id="btn-submit-change-password"
                    type="submit"
                    className="w-full py-3 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Perbarui Password Admin
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      )}

      {/* MODAL: Tambah Tamu Satuan */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-amber-400/40 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-cinzel text-lg font-bold text-amber-100">Tambah Tamu Undangan</h4>
              <button
                onClick={() => setShowAddGuestModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Nama Tamu</label>
                <input
                  type="text"
                  required
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  placeholder="Contoh: Bpk. H. Joko & Keluarga"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Kategori</label>
                  <select
                    value={newGuest.category}
                    onChange={(e) => setNewGuest({ ...newGuest, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Sahabat">Sahabat</option>
                    <option value="Rekan Kerja">Rekan Kerja</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Kuota Pax</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newGuest.pax}
                    onChange={(e) => setNewGuest({ ...newGuest, pax: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">No. WhatsApp (Opsional)</label>
                <input
                  type="text"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Catatan Khusus</label>
                <input
                  type="text"
                  value={newGuest.notes}
                  onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                  placeholder="Contoh: Meja VIP Depan"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase hover:bg-amber-300 cursor-pointer"
              >
                Simpan Tamu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Input Massal Tamu */}
      {showBulkAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-amber-400/40 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-cinzel text-lg font-bold text-amber-100">Input Tamu Secara Massal</h4>
              <button
                onClick={() => setShowBulkAddModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Paste daftar nama tamu (1 nama per baris). Sistem akan secara otomatis membuatkan slug dan link undangan untuk masing-masing nama:
            </p>
            <form onSubmit={handleBulkAdd} className="space-y-4">
              <textarea
                rows={6}
                value={bulkNamesText}
                onChange={(e) => setBulkNamesText(e.target.value)}
                placeholder="Dr. Hendra Wijaya&#10;Ibu Rina Sasmita & Keluarga&#10;Dimas Anggara & Partner"
                required
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400 font-sans"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase hover:bg-amber-300 cursor-pointer"
              >
                Simpan Seluruh Tamu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Foto Galeri */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-amber-400/40 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-cinzel text-lg font-bold text-amber-100">Tambah Foto Galeri</h4>
              <button
                onClick={() => setShowAddPhotoModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setPhotoUploadType('file')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  photoUploadType === 'file'
                    ? 'bg-amber-400 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Upload dari HP / Laptop
              </button>
              <button
                type="button"
                onClick={() => setPhotoUploadType('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  photoUploadType === 'url'
                    ? 'bg-amber-400 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Gunakan URL Gambar
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-4">
              {photoUploadType === 'file' ? (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">
                    Pilih File Foto (Galeri HP / Komputer)
                  </label>
                  <label className="border-2 border-dashed border-amber-400/40 hover:border-amber-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-neutral-900/60 hover:bg-neutral-900 transition-colors">
                    {photoPreviewSrc ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2">
                        <img src={photoPreviewSrc} alt="Preview" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-[10px] text-amber-300">
                          Ganti Foto
                        </span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-amber-400 mb-2" />
                        <span className="text-xs font-semibold text-neutral-200">
                          Ketuk untuk memilih foto dari galeri
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-1">
                          Mendukung JPG, PNG, WEBP (Maks. 15MB)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">URL Foto (Direct Image Link)</label>
                  <input
                    type="url"
                    required={photoUploadType === 'url'}
                    value={newPhoto.url}
                    onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Judul / Caption Foto</label>
                <input
                  type="text"
                  required
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  placeholder="Contoh: Senja Bersama di Bali"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Kategori</label>
                <select
                  value={newPhoto.category}
                  onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="Prewedding">Prewedding</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Moments">Moments</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isUploadingPhoto}
                className="w-full py-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase hover:bg-amber-300 cursor-pointer disabled:opacity-50"
              >
                {isUploadingPhoto ? 'Mengunggah Foto ke Server...' : 'Tambahkan ke Galeri'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Tamu */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-amber-400/40 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-cinzel text-lg font-bold text-amber-100">Edit Tamu Undangan</h4>
              <button
                onClick={() => setEditingGuest(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Nama Tamu</label>
                <input
                  type="text"
                  required
                  value={editingGuest.name}
                  onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Kategori</label>
                  <select
                    value={editingGuest.category}
                    onChange={(e) => setEditingGuest({ ...editingGuest, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Sahabat">Sahabat</option>
                    <option value="Rekan Kerja">Rekan Kerja</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Status RSVP</label>
                  <select
                    value={editingGuest.rsvpStatus}
                    onChange={(e) => setEditingGuest({ ...editingGuest, rsvpStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200"
                  >
                    <option value="Belum Konfirmasi">Belum Konfirmasi</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Ragu-ragu">Ragu-ragu</option>
                    <option value="Tidak Hadir">Tidak Hadir</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Kuota Pax</label>
                  <input
                    type="number"
                    min={1}
                    value={editingGuest.pax}
                    onChange={(e) => setEditingGuest({ ...editingGuest, pax: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Konfirmasi Hadir</label>
                  <input
                    type="number"
                    min={0}
                    value={editingGuest.actualPax || 0}
                    onChange={(e) => setEditingGuest({ ...editingGuest, actualPax: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  value={editingGuest.phone || ''}
                  onChange={(e) => setEditingGuest({ ...editingGuest, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase mb-1">Catatan Khusus</label>
                <input
                  type="text"
                  value={editingGuest.notes || ''}
                  onChange={(e) => setEditingGuest({ ...editingGuest, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-amber-100"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase hover:bg-amber-300 cursor-pointer"
              >
                Perbarui Tamu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
