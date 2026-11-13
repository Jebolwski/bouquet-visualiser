'use client';

import React from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import { FlowerPicker } from './FlowerPicker';
import { WrappingPicker } from './WrappingPicker';
import { CardEditorTab } from './CardEditorTab';
import { ArrangementTab } from './ArrangementTab';
import { PresetsTab } from './PresetsTab';
import { Flower, Package, Mail, Sliders, Sparkles, ShoppingBag, Share2 } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const activeTab = useBouquetStore((state) => state.activeTab);
  const setActiveTab = useBouquetStore((state) => state.setActiveTab);
  const setIsSummaryModalOpen = useBouquetStore((state) => state.setIsSummaryModalOpen);
  const getTotalStems = useBouquetStore((state) => state.getTotalStems);

  const tabs: {
    id: 'flowers' | 'wrapping' | 'card' | 'presets' | 'environment';
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'flowers', label: 'Çiçekler', icon: <Flower className="w-4 h-4" /> },
    { id: 'wrapping', label: 'Ambalaj', icon: <Package className="w-4 h-4" /> },
    { id: 'card', label: 'Mesaj Kartı', icon: <Mail className="w-4 h-4" /> },
    { id: 'presets', label: 'Koleksiyon', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'environment', label: 'Dizilim', icon: <Sliders className="w-4 h-4" /> },
  ];

  const totalStems = getTotalStems();

  return (
    <aside className="w-full md:w-[440px] h-full flex flex-col bg-white/80 dark:bg-stone-900/80 backdrop-blur-2xl border-l border-white/60 dark:border-stone-800 shadow-glass z-20">
      {/* 1. Header Navigation Tabs */}
      <div className="p-3 border-b border-stone-200/60 dark:border-stone-800">
        <div className="grid grid-cols-5 gap-1 bg-stone-100/80 dark:bg-stone-800/80 p-1 rounded-xl">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Scrollable Active Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar">
        {activeTab === 'flowers' && <FlowerPicker />}
        {activeTab === 'wrapping' && <WrappingPicker />}
        {activeTab === 'card' && <CardEditorTab />}
        {activeTab === 'presets' && <PresetsTab />}
        {activeTab === 'environment' && <ArrangementTab />}
      </div>

      {/* 3. Bottom Sticky Action Bar */}
      <div className="p-4 border-t border-stone-200/60 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">
              Buketiniz
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">
                {totalStems}
              </span>
              <span className="text-xs text-stone-500">
                dal çiçek
              </span>
            </div>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium">
            Taze & Canlı
          </span>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => setIsSummaryModalOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-medium rounded-xl shadow-lg shadow-rose-500/25 transition-all duration-200 transform active:scale-[0.99] group"
        >
          <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="text-sm tracking-wide">Buketi Tamamla / Link Paylaş</span>
        </button>
      </div>
    </aside>
  );
};
