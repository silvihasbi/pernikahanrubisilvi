import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import {
  verifyPassword,
  hashPassword,
  checkRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
  createSessionToken,
  validateSessionToken,
  revokeSessionToken,
} from './server/auth.js';
import { uploadMiddleware } from './server/upload.js';
import {
  addSseClient,
  broadcastNewWish,
  broadcastWishUpdate,
  broadcastSettingsUpdate,
  broadcastGalleryUpdate,
} from './server/sse.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded photos publicly
const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Rate limit helper
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

// Strict Admin Token Authentication Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

  if (!token || !validateSessionToken(token)) {
    res.status(401).json({ error: 'Akses ditolak. Sesi admin tidak valid atau telah kedaluwarsa.' });
    return;
  }
  next();
}

// ==========================================
// PUBLIC API ROUTES (For Wedding Guests)
// ==========================================

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Get public wedding details & gallery
app.get('/api/wedding', (_req, res) => {
  try {
    const settings = db.getSettings();
    const gallery = db.getGallery();
    res.json({ settings, gallery });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal memuat data pernikahan', details: err?.message });
  }
});

// 3. Real-time Live Stream (Server-Sent Events for live wishes & RSVP sync)
app.get('/api/wishes/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = 'sse-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  addSseClient(clientId, res);

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now() })}\n\n`);
});

// 4. Get public wishes
app.get('/api/wishes', (_req, res) => {
  try {
    const wishes = db.getWishes(false);
    res.json({ wishes });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal memuat ucapan', details: err?.message });
  }
});

// 5. Submit new wish & RSVP (Real-time broadcast to all devices)
app.post('/api/wishes', (req, res) => {
  try {
    const { guestName, relationship, message, attendance, paxCount } = req.body;

    if (!guestName || !message || !attendance) {
      res.status(400).json({ error: 'Nama, pesan ucapan, dan status konfirmasi kehadiran wajib diisi.' });
      return;
    }

    const newWish = db.addWish({
      guestName,
      relationship,
      message,
      attendance,
      paxCount: Number(paxCount) || 1,
    });

    // Real-time instant broadcast across all connected phones and computers
    broadcastNewWish(newWish);

    res.status(201).json({
      message: 'Ucapan dan konfirmasi kehadiran berhasil dikirim! Terima kasih atas doa dan restunya.',
      wish: newWish,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mengirim ucapan', details: err?.message });
  }
});

// 6. Direct RSVP submit
app.post('/api/rsvp', (req, res) => {
  try {
    const { guestName, attendance, paxCount, notes } = req.body;

    if (!guestName || !attendance) {
      res.status(400).json({ error: 'Nama dan konfirmasi kehadiran wajib diisi.' });
      return;
    }

    const guest = db.findGuestBySlug(guestName);
    if (guest) {
      db.updateGuest(guest.id, {
        rsvpStatus: attendance,
        actualPax: Number(paxCount) || 1,
        notes: notes ? (guest.notes ? `${guest.notes} | ${notes}` : notes) : guest.notes,
      });
    }

    res.json({
      success: true,
      message: 'Konfirmasi kehadiran Anda telah berhasil disimpan.',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menyimpan RSVP', details: err?.message });
  }
});

// 7. Check guest by slug or name
app.get('/api/guest/:identifier', (req, res) => {
  try {
    const identifier = decodeURIComponent(req.params.identifier);
    const guest = db.findGuestBySlug(identifier);
    if (!guest) {
      res.status(404).json({ error: 'Tamu tidak ditemukan' });
      return;
    }
    res.json({ guest });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mencari tamu', details: err?.message });
  }
});

// ==========================================
// STRICT ADMIN API ROUTES (Protected & Isolated)
// ==========================================

// 1. Admin Login with anti-brute force
app.post('/api/admin/login', (req, res) => {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    res.status(429).json({
      error: `Terlalu banyak percobaan login gagal. Demi keamanan dari serangan brute-force, akses terkunci selama ${rateLimit.remainingLockSeconds} detik lagi.`,
    });
    return;
  }

  const { password } = req.body;
  if (!password) {
    res.status(400).json({ error: 'Password wajib diisi.' });
    return;
  }

  const security = db.getSecurity();
  const isValid = verifyPassword(password, security.passwordHash, security.salt);

  if (!isValid) {
    const attemptInfo = recordFailedLogin(ip);
    if (attemptInfo.locked) {
      res.status(429).json({
        error: 'Password salah! Akun terkunci selama 15 menit karena mencapai batas maksimum 5 kali percobaan gagal.',
      });
      return;
    }
    res.status(401).json({
      error: `Password salah! Sisa percobaan: ${attemptInfo.attemptsLeft} kali sebelum terkunci otomatis.`,
    });
    return;
  }

  recordSuccessfulLogin(ip);
  const token = createSessionToken();

  res.json({
    message: 'Login berhasil! Selamat datang di Dashboard Admin Rubi & Silvi.',
    token,
    lastUpdated: security.lastUpdated,
  });
});

// 2. Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  revokeSessionToken(token);
  res.json({ message: 'Logout berhasil.' });
});

// 3. Admin session verification
app.get('/api/admin/me', requireAdmin, (_req, res) => {
  const security = db.getSecurity();
  res.json({
    authenticated: true,
    lastPasswordUpdate: security.lastUpdated,
  });
});

// 4. Change Admin Password (with PBKDF2-SHA512 + Salt)
app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400).json({ error: 'Password lama dan password baru wajib diisi.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Password baru minimal harus 6 karakter untuk keamanan optimal.' });
    return;
  }

  const security = db.getSecurity();
  const isOldValid = verifyPassword(oldPassword, security.passwordHash, security.salt);

  if (!isOldValid) {
    res.status(401).json({ error: 'Password lama tidak sesuai! Perubahan password ditolak.' });
    return;
  }

  const { hash, salt } = hashPassword(newPassword);
  db.updatePassword(hash, salt);

  res.json({
    message: 'Password admin berhasil diperbarui dengan enkripsi aman PBKDF2-SHA512!',
    lastUpdated: new Date().toISOString(),
  });
});

// 5. Admin Direct Media & Audio Upload from Mobile Phone or Computer (No external URL required)
app.post('/api/admin/upload', requireAdmin, (req, res) => {
  uploadMiddleware.any()(req, res, (err: any) => {
    if (err) {
      res.status(400).json({ error: err.message || 'Gagal mengunggah file dari perangkat.' });
      return;
    }
    const files = (req.files as Express.Multer.File[]) || [];
    const file = files[0] || req.file;

    if (!file) {
      res.status(400).json({ error: 'Tidak ada file yang dipilih dari perangkat Anda.' });
      return;
    }

    const publicUrl = `/uploads/${file.filename}`;
    const mimetype = (file.mimetype || '').toLowerCase();
    const isVideo = mimetype.startsWith('video/') || ['video/mp4', 'video/webm', 'video/quicktime'].includes(mimetype);
    const isAudio = mimetype.startsWith('audio/') || ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'].includes(mimetype);
    const mediaType = isVideo ? 'video' : isAudio ? 'audio' : 'image';

    res.json({
      message: `${mediaType === 'video' ? 'Video' : mediaType === 'audio' ? 'Lagu MP3' : 'Foto'} berhasil diunggah langsung dari perangkat Anda!`,
      url: publicUrl,
      filename: file.filename,
      originalName: file.originalname,
      mediaType,
      size: file.size,
    });
  });
});

// 6. Admin Dashboard Statistics
app.get('/api/admin/stats', requireAdmin, (_req, res) => {
  try {
    const guests = db.getGuests();
    const wishes = db.getWishes(true);

    const totalGuests = guests.length;
    const confirmedAttending = guests.filter((g) => g.rsvpStatus === 'Hadir').length;
    const confirmedNotAttending = guests.filter((g) => g.rsvpStatus === 'Tidak Hadir').length;
    const confirmedUndecided = guests.filter((g) => g.rsvpStatus === 'Ragu-ragu').length;
    const unconfirmed = guests.filter((g) => g.rsvpStatus === 'Belum Konfirmasi').length;

    const totalEstimatedPax = guests.reduce((acc, g) => acc + (g.pax || 1), 0);
    const totalActualPax = guests.reduce((acc, g) => acc + (g.actualPax || 0), 0);

    res.json({
      totalGuests,
      confirmedAttending,
      confirmedNotAttending,
      confirmedUndecided,
      unconfirmed,
      totalEstimatedPax,
      totalActualPax,
      totalWishes: wishes.length,
      pendingWishes: wishes.filter((w) => !w.isApproved).length,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal memuat statistik', details: err?.message });
  }
});

// 7. Guest Management
app.get('/api/admin/guests', requireAdmin, (_req, res) => {
  res.json({ guests: db.getGuests() });
});

app.post('/api/admin/guests', requireAdmin, (req, res) => {
  try {
    const { name, category, phone, pax, notes } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Nama tamu wajib diisi.' });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const guest = db.addGuest({
      name: name.trim(),
      slug: slug || 'guest-' + Date.now(),
      category: category || 'Umum',
      phone: phone?.trim() || '',
      pax: Number(pax) || 2,
      rsvpStatus: 'Belum Konfirmasi',
      notes: notes?.trim() || '',
    });

    res.status(201).json({ message: 'Tamu berhasil ditambahkan.', guest });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menambahkan tamu', details: err?.message });
  }
});

app.post('/api/admin/guests/bulk', requireAdmin, (req, res) => {
  try {
    const { namesText, category, pax } = req.body;
    if (!namesText || typeof namesText !== 'string') {
      res.status(400).json({ error: 'Daftar nama wajib diisi.' });
      return;
    }

    const lines = namesText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const added: any[] = [];
    for (const name of lines) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const guest = db.addGuest({
        name,
        slug: slug || 'guest-' + Date.now(),
        category: category || 'Umum',
        phone: '',
        pax: Number(pax) || 2,
        rsvpStatus: 'Belum Konfirmasi',
      });
      added.push(guest);
    }

    res.status(201).json({
      message: `${added.length} tamu berhasil ditambahkan sekaligus!`,
      count: added.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menambahkan tamu massal', details: err?.message });
  }
});

app.put('/api/admin/guests/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateGuest(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Tamu tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Data tamu berhasil diperbarui.', guest: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal memperbarui tamu', details: err?.message });
  }
});

app.delete('/api/admin/guests/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteGuest(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Tamu tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Tamu berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menghapus tamu', details: err?.message });
  }
});

// 8. Wishes Moderation
app.get('/api/admin/wishes', requireAdmin, (_req, res) => {
  res.json({ wishes: db.getWishes(true) });
});

app.put('/api/admin/wishes/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateWish(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Ucapan tidak ditemukan.' });
      return;
    }
    broadcastWishUpdate(updated);
    res.json({ message: 'Status ucapan berhasil diperbarui.', wish: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal memperbarui ucapan', details: err?.message });
  }
});

app.delete('/api/admin/wishes/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteWish(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Ucapan tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Ucapan berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menghapus ucapan', details: err?.message });
  }
});

// 9. Wedding Settings & Music Audio Configuration
app.get('/api/admin/settings', requireAdmin, (_req, res) => {
  res.json({ settings: db.getSettings() });
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    // Real-time broadcast: all connected phones & computers immediately reflect new settings & songs!
    broadcastSettingsUpdate(updated);
    res.json({ message: 'Pengaturan pernikahan & lagu berhasil diperbarui!', settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal memperbarui pengaturan', details: err?.message });
  }
});

// 10. Gallery & Animated Media Management
app.post('/api/admin/gallery', requireAdmin, (req, res) => {
  try {
    const { url, title, category, featured, mediaType } = req.body;
    if (!url || !title) {
      res.status(400).json({ error: 'URL media dan judul wajib diisi.' });
      return;
    }
    const item = db.addGalleryItem({
      url,
      title,
      category: category || 'Prewedding',
      featured: Boolean(featured),
      mediaType: mediaType || 'image',
    });
    // Broadcast gallery update real-time
    broadcastGalleryUpdate(db.getGallery());
    res.status(201).json({ message: 'Media berhasil ditambahkan ke galeri.', item });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menambahkan media', details: err?.message });
  }
});

app.delete('/api/admin/gallery/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteGalleryItem(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Media tidak ditemukan.' });
      return;
    }
    broadcastGalleryUpdate(db.getGallery());
    res.json({ message: 'Media berhasil dihapus dari galeri.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menghapus media', details: err?.message });
  }
});

// ==========================================
// VITE / STATIC SERVING MIDDLEWARE
// ==========================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wedding App Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
