import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquareHeart, Users, Pin, CornerDownRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Wish } from '../types.js';

interface RsvpAndWishesSectionProps {
  initialGuestName: string;
  wishes: Wish[];
  onWishSubmitted: (newWish: Wish) => void;
}

export const RsvpAndWishesSection: React.FC<RsvpAndWishesSectionProps> = ({
  initialGuestName,
  wishes,
  onWishSubmitted,
}) => {
  const [name, setName] = useState(initialGuestName || '');
  const [relationship, setRelationship] = useState('Sahabat / Rekan');
  const [attendance, setAttendance] = useState<'Hadir' | 'Tidak Hadir' | 'Ragu-ragu'>('Hadir');
  const [paxCount, setPaxCount] = useState<number>(2);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setFeedback({ type: 'error', text: 'Nama dan pesan ucapan wajib diisi.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: name.trim(),
          relationship: relationship.trim(),
          message: message.trim(),
          attendance,
          paxCount: attendance === 'Hadir' ? paxCount : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim ucapan');
      }

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#D4AF37', '#FFF0BD', '#F5D778', '#FFFFFF'],
        });
      } catch {
        // Safe fallback
      }

      setFeedback({
        type: 'success',
        text: 'Terima kasih banyak! Ucapan & konfirmasi kehadiran Anda telah tersimpan.',
      });
      setMessage('');
      if (data.wish) {
        onWishSubmitted(data.wish);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Terjadi kesalahan sistem.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section id="section-rsvp" className="py-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-block p-2 rounded-full border border-amber-400/20 mb-4 bg-amber-500/5">
          <MessageSquareHeart className="w-5 h-5 text-amber-400" />
        </div>
        <p className="text-xs text-amber-400 font-sans tracking-[0.3em] uppercase mb-2">
          Konfirmasi & Doa Restu
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-wider gold-gradient-text">
          RSVP & Ucapan Tamu
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
        <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto mt-4 font-sans leading-relaxed">
          Kehadiran dan doa restu Anda merupakan kehormatan serta kebahagiaan terbesar bagi kami dan keluarga besar.
        </p>
      </div>

      {/* RSVP Form Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-amber-400/30 shadow-2xl mb-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Nama Lengkap
            </label>
            <input
              id="input-rsvp-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Bpk. H. Joko & Keluarga"
              required
              className="w-full px-4 py-3 rounded-xl bg-neutral-900/80 border border-amber-400/30 text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors"
            />
          </div>

          {/* Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Hubungan / Asal
              </label>
              <select
                id="select-rsvp-relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-neutral-900/80 border border-amber-400/30 text-amber-100 focus:outline-none focus:border-amber-400 text-sm transition-colors cursor-pointer"
              >
                <option value="Keluarga Besar">Keluarga Besar</option>
                <option value="Sahabat Karib">Sahabat Karib</option>
                <option value="Rekan Kerja">Rekan Kerja</option>
                <option value="Tetangga / Warga">Tetangga / Warga</option>
                <option value="Tamu Undangan Umum">Tamu Undangan Umum</option>
              </select>
            </div>

            {/* Attendance selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Konfirmasi Kehadiran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Hadir', 'Ragu-ragu', 'Tidak Hadir'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setAttendance(status)}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer text-center ${
                      attendance === status
                        ? status === 'Hadir'
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400'
                          : status === 'Ragu-ragu'
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400'
                          : 'bg-neutral-700 text-white border border-neutral-500'
                        : 'bg-neutral-900/80 text-neutral-400 border border-neutral-700 hover:border-neutral-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Guest Count Pax (only if Hadir) */}
          {attendance === 'Hadir' && (
            <div className="animate-in fade-in duration-300">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Jumlah Orang yang Hadir</span>
                </span>
              </label>
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPaxCount(num)}
                    className={`w-11 h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      paxCount === num
                        ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20 scale-105'
                        : 'bg-neutral-900/80 border border-amber-400/20 text-neutral-300 hover:border-amber-400/50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <span className="text-xs text-neutral-400">Orang</span>
              </div>
            </div>
          )}

          {/* Wishes Message */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Untaian Doa & Ucapan Selamat
            </label>
            <textarea
              id="textarea-rsvp-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan ucapan selamat dan doa restu terbaik Anda untuk Rubi & Silvi..."
              required
              className="w-full px-4 py-3 rounded-xl bg-neutral-900/80 border border-amber-400/30 text-amber-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 text-sm transition-colors resize-none"
            />
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
              }`}
            >
              {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="btn-submit-rsvp"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full text-neutral-950 font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 transition-all duration-300 transform hover:scale-[1.01] shadow-xl shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Konfirmasi & Ucapan</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Wishes Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-amber-400/20 pb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-cinzel text-xl font-bold text-amber-100">
              Doa & Ucapan Teman & Sahabat
            </h3>
          </div>
          <span className="text-xs text-amber-400/90 font-sans tracking-wider px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
            {wishes.length} Doa Restu
          </span>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {wishes.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-neutral-400 text-sm">
              Belum ada ucapan. Jadilah yang pertama memberikan doa restu untuk kedua mempelai!
            </div>
          ) : (
            wishes.map((wish) => (
              <div
                key={wish.id}
                className={`glass-panel rounded-2xl p-5 sm:p-6 border transition-all duration-200 shadow-md ${
                  wish.isPinned
                    ? 'border-amber-400/60 bg-amber-500/5 shadow-amber-400/10'
                    : 'border-amber-400/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    {/* Avatar circle with initial */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-neutral-950 font-bold font-serif flex items-center justify-center text-sm shadow">
                      {wish.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-100 text-sm flex items-center space-x-2">
                        <span>{wish.guestName}</span>
                        {wish.isPinned && (
                          <span className="inline-flex items-center space-x-1 text-[10px] text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                            <Pin className="w-2.5 h-2.5" />
                            <span>Disematkan</span>
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-sans">
                        {wish.relationship || 'Tamu Undangan'} • {formatTime(wish.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Attendance badge */}
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                      wish.attendance === 'Hadir'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : wish.attendance === 'Ragu-ragu'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {wish.attendance} {wish.paxCount && wish.paxCount > 1 ? `(${wish.paxCount} orang)` : ''}
                  </span>
                </div>

                {/* Message text */}
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans mt-3 pl-11">
                  {wish.message}
                </p>

                {/* Admin / Couple Reply */}
                {wish.adminReply && (
                  <div className="mt-4 ml-8 sm:ml-11 p-3.5 rounded-xl bg-neutral-900/90 border border-amber-400/30 flex items-start space-x-2.5">
                    <CornerDownRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-amber-300 tracking-wider">
                        Balasan Rubi & Silvi:
                      </p>
                      <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed font-sans">
                        {wish.adminReply}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
