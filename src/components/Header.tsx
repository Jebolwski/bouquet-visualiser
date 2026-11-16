'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import { BOUQUET_PRESETS } from '@/utils/presets';
import { SeasonCategory } from '@/types';
import { Sparkles, Flower, ChevronDown, HelpCircle, Sun, Moon } from 'lucide-react';

const SEASON_GROUPS: { id: SeasonCategory; label: string; emoji: string; accent: string }[] = [
  { id: 'spring', label: 'Spring', emoji: '🌸', accent: 'text-pink-600 dark:text-pink-400' },
  { id: 'summer', label: 'Summer', emoji: '☀️', accent: 'text-amber-600 dark:text-amber-400' },
  { id: 'autumn', label: 'Autumn', emoji: '🍂', accent: 'text-orange-700 dark:text-orange-400' },
  { id: 'winter', label: 'Winter', emoji: '❄️', accent: 'text-sky-600 dark:text-sky-400' },
  { id: 'classic', label: 'Classic Collection', emoji: '💐', accent: 'text-rose-500 dark:text-rose-400' },
];

export const Header: React.FC = () => {
  const loadPreset = useBouquetStore((state) => state.loadPreset);
  const getTotalStems = useBouquetStore((state) => state.getTotalStems);
  const setIsSummaryModalOpen = useBouquetStore((state) => state.setIsSummaryModalOpen);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalStems = getTotalStems();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    try {
      localStorage.setItem('fleur_artisan_theme', nextDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!collectionsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCollectionsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [collectionsOpen]);

  return (
    <header className="relative h-16 px-4 md:px-6 flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl z-30">
      {/* Brand Logo & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
          <Flower className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-base md:text-lg text-stone-900 dark:text-stone-50 tracking-tight flex items-center gap-1.5 whitespace-nowrap">
            FLEUR & ARTISAN
            <span className="hidden sm:inline-block text-[10px] font-sans font-semibold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              3D Studio
            </span>
          </h1>
          <p className="text-[11px] text-stone-400 hidden sm:block">
            Interactive Flower &amp; Gift Design Studio
          </p>
        </div>
      </div>

      {/* Seasonal Collections Dropdown (desktop only) */}
      <div ref={dropdownRef} className="hidden lg:flex items-center relative">
        <button
          type="button"
          data-tour="collections"
          onClick={() => setCollectionsOpen((prev) => !prev)}
          aria-expanded={collectionsOpen}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200/70 dark:border-stone-700/70 transition-colors text-xs font-medium shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Collections</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
              collectionsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {collectionsOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[640px] max-w-[90vw] p-4 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/80 dark:border-stone-700/80 shadow-2xl z-50">
            <div className="grid grid-cols-2 gap-4">
              {SEASON_GROUPS.slice(0, 4).map((group) => {
                const items = BOUQUET_PRESETS.filter((p) => (p.season || 'classic') === group.id);
                return (
                  <div key={group.id} className="flex flex-col gap-1">
                    <div className={`text-[11px] font-bold uppercase tracking-wider px-2 pb-1 border-b border-stone-100 dark:border-stone-800 flex items-center gap-1.5 ${group.accent}`}>
                      <span>{group.emoji}</span>
                      <span>{group.label}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {items.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            loadPreset(preset.id);
                            setCollectionsOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-between gap-2"
                        >
                          <span className="truncate font-medium">
                            {preset.name}
                          </span>
                          <span className="text-[10px] text-stone-400 shrink-0">
                            {preset.flowers.reduce((acc, f) => acc + f.count, 0)} stems
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Classic Collection Row */}
            <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="text-[11px] font-bold uppercase tracking-wider px-2 mb-1.5 text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                <span>💐</span>
                <span>Classic Collection</span>
              </div>
              <div className="flex flex-wrap gap-1.5 px-1">
                {BOUQUET_PRESETS.filter((p) => (p.season || 'classic') === 'classic').map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      loadPreset(preset.id);
                      setCollectionsOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right side checkout pill */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('bouquet-start-tutorial'))}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          title="Start Studio Guide"
          aria-label="Start studio guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[11px] text-stone-400 font-medium">Your Bouquet</span>
          <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
            {totalStems} stems
          </span>
        </div>

        <button
          type="button"
          data-tour="complete-btn"
          onClick={() => setIsSummaryModalOpen(true)}
          className="shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 hover:text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 dark:hover:text-stone-950 transition-all text-xs font-medium shadow-sm hover:shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Complete Bouquet</span>
        </button>
      </div>
    </header>
  );
};
