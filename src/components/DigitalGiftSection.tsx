import React, { useState } from 'react';
import { Gift, Copy, Check, QrCode, CreditCard, MapPin, X } from 'lucide-react';
import { BankAccount } from '../types.js';

interface DigitalGiftSectionProps {
  bankAccounts: BankAccount[];
  physicalGiftAddress: string;
}

export const DigitalGiftSection: React.FC<DigitalGiftSectionProps> = ({
  bankAccounts,
  physicalGiftAddress,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrisUrl, setActiveQrisUrl] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  return (
    <section id="section-amplop" className="py-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-block p-2 rounded-full border border-amber-400/20 mb-4 bg-amber-500/5">
          <Gift className="w-5 h-5 text-amber-400" />
        </div>
        <p className="text-xs text-amber-400 font-sans tracking-[0.3em] uppercase mb-2">
          Tanda Kasih & Doa
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-bold tracking-wider gold-gradient-text">
          Amplop Digital
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
        <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto mt-4 font-sans leading-relaxed">
          Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda berkenan memberikan tanda kasih,
          kami menyediakan amplop digital di bawah ini:
        </p>
      </div>

      {/* Bank & QRIS Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {bankAccounts.map((account) => (
          <div
            key={account.id}
            className="glass-panel rounded-3xl p-6 sm:p-7 border border-amber-400/30 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-amber-400/60 transition-all duration-300"
          >
            {/* Background Chip Decal */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span className="font-cinzel font-bold text-sm text-amber-200 uppercase tracking-wider">
                  {account.bankName}
                </span>
              </div>
              {account.qrisImageUrl && (
                <button
                  id={`btn-view-qris-${account.id}`}
                  onClick={() => setActiveQrisUrl(account.qrisImageUrl!)}
                  className="flex items-center space-x-1 text-[11px] text-amber-300 hover:text-amber-100 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30 cursor-pointer transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Lihat QRIS</span>
                </button>
              )}
            </div>

            <div className="space-y-1 my-4">
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Nomor Rekening / No. HP</p>
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-amber-100">
                {account.accountNumber}
              </div>
              <p className="text-xs text-neutral-300 font-medium">a.n. {account.accountHolder}</p>
            </div>

            <div className="pt-4 border-t border-amber-400/20 flex justify-end">
              <button
                id={`btn-copy-${account.id}`}
                onClick={() => copyToClipboard(account.accountNumber, account.id)}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
                  copiedId === account.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-amber-400 text-neutral-950 hover:bg-amber-300 shadow-md shadow-amber-400/20'
                }`}
              >
                {copiedId === account.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Nomor</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Physical Gift Card */}
      {physicalGiftAddress && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-400/20 text-center max-w-xl mx-auto shadow-xl">
          <div className="inline-flex p-2.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-cinzel text-lg font-bold text-amber-100 mb-2">
            Kirim Kado Fisik
          </h4>
          <p className="text-xs sm:text-sm text-neutral-300 whitespace-pre-line leading-relaxed font-sans mb-5">
            {physicalGiftAddress}
          </p>
          <button
            id="btn-copy-address"
            onClick={() => copyToClipboard(physicalGiftAddress, 'address')}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
              copiedId === 'address'
                ? 'bg-emerald-500 text-white'
                : 'glass-panel text-amber-200 border border-amber-400/30 hover:bg-amber-400/10'
            }`}
          >
            {copiedId === 'address' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Alamat Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Alamat Lengkap</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* QRIS Modal */}
      {activeQrisUrl && (
        <div
          id="qris-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="glass-panel max-w-sm w-full p-6 rounded-3xl border border-amber-400/40 text-center shadow-2xl relative">
            <button
              id="btn-close-qris-modal"
              onClick={() => setActiveQrisUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-cinzel text-xl font-bold text-amber-200 mb-1">
              QRIS Pembayaran
            </h4>
            <p className="text-xs text-neutral-400 mb-4 font-sans">
              Scan melalui Gopay, OVO, Dana, ShopeePay, atau Mobile Banking
            </p>
            <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mb-4">
              <img
                src={activeQrisUrl}
                alt="QRIS Digital Gift"
                className="w-56 h-56 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs font-medium text-amber-300 font-sans">
              Pernikahan Rubi & Silvi
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
