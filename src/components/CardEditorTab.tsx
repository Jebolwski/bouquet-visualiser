'use client';

import React from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import { Mail, Heart } from 'lucide-react';

export const CardEditorTab: React.FC = () => {
  const card = useBouquetStore((state) => state.card);
  const updateCard = useBouquetStore((state) => state.updateCard);
  const toggleCard = useBouquetStore((state) => state.toggleCard);

  const quickMessages = [
    'Hayatıma kattığın tüm güzellikler için...',
    'Yeni yaşın çiçekler gibi neşe ve huzur getirsin! 🌸',
    'Gülüşün gibi ışıl ışıl bir gün dilerim.',
    'Her daim kalbimin en zarif köşesindesin.',
    'Tebrikler ve sonsuz mutluluklar dilerim! 🥂',
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Enable Card Toggle */}
      <div className="flex items-center justify-between p-3.5 bg-white/70 dark:bg-stone-800/70 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold text-stone-900 dark:text-stone-100">
              3D Hediye Not Kartı
            </h4>
            <p className="text-[11px] text-stone-500">
              Buket ambalajına iliştirilmiş özel mesaj kartı
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleCard()}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
            card.enabled ? 'bg-stone-900 dark:bg-rose-500' : 'bg-stone-300 dark:bg-stone-700'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              card.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {card.enabled && (
        <div className="flex flex-col gap-4">
          {/* Card Inputs */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-1">
              Kime (Alıcı Adı):
            </label>
            <input
              type="text"
              value={card.to}
              onChange={(e) => updateCard({ to: e.target.value })}
              placeholder="Örn: Sevgilime, Ayşe'ye, Canım Anneme..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-800 dark:text-stone-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                Özel Mesajınız:
              </label>
              <span className="text-[10px] text-stone-400">{card.message.length}/120</span>
            </div>
            <textarea
              rows={3}
              maxLength={120}
              value={card.message}
              onChange={(e) => updateCard({ message: e.target.value })}
              placeholder="Bukete iliştirilecek sevgi dolu cümleniz..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-800 dark:text-stone-100 resize-none"
            />
          </div>

          {/* Quick Message Chips */}
          <div>
            <span className="text-[10px] text-stone-400 block mb-1.5">Hazır İpuçları:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickMessages.map((msg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => updateCard({ message: msg })}
                  className="px-2.5 py-1 text-[11px] bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-md transition-colors text-left"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-1">
              Kimden (Gönderen İmzası):
            </label>
            <input
              type="text"
              value={card.from}
              onChange={(e) => updateCard({ from: e.target.value })}
              placeholder="Örn: Mert, Sevgilerle..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-800 dark:text-stone-100"
            />
          </div>

          {/* Typography Style */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block mb-1.5">
              Yazı Karakteri (Tipografi):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'handwriting', label: 'El Yazısı' },
                { id: 'serif', label: 'Zarif Roman' },
                { id: 'modern', label: 'Modern Sans' },
              ].map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => updateCard({ fontStyle: font.id as any })}
                  className={`py-2 text-xs rounded-lg font-medium border transition-colors ${
                    card.fontStyle === font.id
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Card Mini Preview Box */}
          <div className="p-4 bg-[#fbf9f4] dark:bg-stone-800/90 rounded-xl border border-amber-200/60 dark:border-stone-700 text-center relative overflow-hidden shadow-xs">
            <div className="absolute top-2 right-2 text-rose-400">
              <Heart className="w-4 h-4 fill-rose-200" />
            </div>
            <p className="text-xs italic text-stone-600 dark:text-stone-400 mb-1">
              {card.to ? `Sevgili ${card.to},` : 'Kime,'}
            </p>
            <p className="text-sm font-serif font-medium text-stone-800 dark:text-stone-100 my-2 px-2">
              "{card.message || 'Özel notunuz burada yer alacak...'}"
            </p>
            {card.from && (
              <p className="text-xs font-serif italic text-stone-600 dark:text-stone-400 text-right pr-4">
                — {card.from}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
