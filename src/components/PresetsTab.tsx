'use client';

import React, { useState } from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import { BOUQUET_PRESETS } from '@/utils/presets';
import { SeasonCategory } from '@/types';
import { ArrowRight } from 'lucide-react';

type FilterOption = 'all' | SeasonCategory;

const SEASON_FILTERS: { id: FilterOption; label: string; emoji: string }[] = [
  { id: 'all', label: 'Tümü', emoji: '✨' },
  { id: 'spring', label: 'İlkbahar', emoji: '🌸' },
  { id: 'summer', label: 'Yaz', emoji: '☀️' },
  { id: 'autumn', label: 'Sonbahar', emoji: '🍂' },
  { id: 'winter', label: 'Kış', emoji: '❄️' },
  { id: 'classic', label: 'Klasik', emoji: '💐' },
];

const SEASON_LABELS: Record<SeasonCategory, { label: string; badgeClass: string }> = {
  spring: {
    label: '🌸 İlkbahar Koleksiyonu',
    badgeClass: 'text-pink-600 dark:text-pink-400',
  },
  summer: {
    label: '☀️ Yaz Koleksiyonu',
    badgeClass: 'text-amber-600 dark:text-amber-400',
  },
  autumn: {
    label: '🍂 Sonbahar Koleksiyonu',
    badgeClass: 'text-orange-700 dark:text-orange-400',
  },
  winter: {
    label: '❄️ Kış Koleksiyonu',
    badgeClass: 'text-sky-600 dark:text-sky-400',
  },
  classic: {
    label: '💐 Özel Koleksiyon',
    badgeClass: 'text-rose-500',
  },
};

export const PresetsTab: React.FC = () => {
  const loadPreset = useBouquetStore((state) => state.loadPreset);
  const [selectedSeason, setSelectedSeason] = useState<FilterOption>('all');

  const filteredPresets =
    selectedSeason === 'all'
      ? BOUQUET_PRESETS
      : BOUQUET_PRESETS.filter((p) => (p.season || 'classic') === selectedSeason);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-stone-500 mb-0.5">
        Mevsimlere göre ayrılmış hazır koleksiyon buketlerinden birini seçerek anında başlayabilirsiniz:
      </div>

      {/* Season Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {SEASON_FILTERS.map((filter) => {
          const isActive = selectedSeason === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedSeason(filter.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                isActive
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              <span>{filter.emoji}</span>
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {filteredPresets.map((preset) => {
          const seasonMeta = SEASON_LABELS[preset.season || 'classic'];
          return (
            <div
              key={preset.id}
              onClick={() => loadPreset(preset.id)}
              className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-700/80 bg-white/70 dark:bg-stone-800/70 hover:bg-white dark:hover:bg-stone-800 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider block mb-0.5 ${seasonMeta.badgeClass}`}
                  >
                    {seasonMeta.label}
                  </span>
                  <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-rose-600 transition-colors">
                    {preset.nameTr}
                  </h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 font-medium mt-1">
              {preset.subtitle}
            </p>

            <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
              {preset.description}
            </p>

            {/* Flowers breakdown chips */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-700/50">
              {preset.flowers.map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300 text-[10px] font-medium rounded-full flex items-center gap-1"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: f.color || '#c9184a' }}
                  />
                  {f.count}x {f.type}
                </span>
              ))}
              <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-medium rounded-full">
                {preset.wrapping.type === 'newspaper' ? 'Vintage Gazete' : preset.wrapping.type}
              </span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
