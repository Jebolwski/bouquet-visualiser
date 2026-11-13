'use client';

import React from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import { ArrangementStyle, LightingPreset } from '@/types';
import { Compass, Sun, Sliders, RotateCw } from 'lucide-react';

export const ArrangementTab: React.FC = () => {
  const scene = useBouquetStore((state) => state.scene);
  const updateScene = useBouquetStore((state) => state.updateScene);
  const setArrangementStyle = useBouquetStore((state) => state.setArrangementStyle);
  const setLighting = useBouquetStore((state) => state.setLighting);
  const toggleAutoRotate = useBouquetStore((state) => state.toggleAutoRotate);

  const styleOptions: {
    id: ArrangementStyle;
    title: string;
    desc: string;
  }[] = [
    {
      id: 'dome',
      title: 'Klasik Kubbe',
      desc: 'Dengeli küresel form, merkezden dışa kusursuz simetrik çiçekçi dairesi',
    },
    {
      id: 'spiral',
      title: 'Altın Oran Spiral',
      desc: 'Fibonacci spiral kuralıyla kademeli yükselen zarafet',
    },
    {
      id: 'wild_meadow',
      title: 'Kır Bahçesi',
      desc: 'İngiliz kır bahçelerinden ilham alan havadar, doğal ve serbest dizilim',
    },
    {
      id: 'fan',
      title: 'Sunum Yelpazesi',
      desc: 'Arkası yüksek, önü alçak asil yelpaze formu',
    },
  ];

  const lightingPresets: { id: LightingPreset; name: string; icon: string }[] = [
    { id: 'studio', name: 'Stüdyo Işığı', icon: '💡' },
    { id: 'golden_hour', name: 'Gün Batımı', icon: '🌅' },
    { id: 'soft_pastel', name: 'Pastel İskandinav', icon: '🌸' },
    { id: 'dramatic_noir', name: 'Dramatik Noir', icon: '🌙' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Arrangement Style */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          <span>Matematiksel Dizilim Geometrisi</span>
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          {styleOptions.map((opt) => {
            const isActive = scene.arrangementStyle === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setArrangementStyle(opt.id)}
                className={`p-3 text-left rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-md'
                    : 'bg-white/60 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-700/60 hover:bg-white'
                }`}
              >
                <div className="font-serif font-medium text-sm">{opt.title}</div>
                <div
                  className={`text-xs mt-0.5 ${
                    isActive ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500'
                  }`}
                >
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sliders */}
      <div className="p-3.5 bg-white/70 dark:bg-stone-800/70 rounded-xl border border-stone-200/60 dark:border-stone-700/60 flex flex-col gap-4">
        <h4 className="text-xs uppercase tracking-wider text-stone-500 font-medium flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>Hacim ve Form İnce Ayarları</span>
        </h4>

        {/* Tightness */}
        <div>
          <div className="flex justify-between text-xs text-stone-600 dark:text-stone-300 mb-1">
            <span>Buket Sıkılığı (Çap Faktörü):</span>
            <span className="font-mono">{scene.tightness.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.35"
            step="0.05"
            value={scene.tightness}
            onChange={(e) => updateScene({ tightness: parseFloat(e.target.value) })}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Stem Spread */}
        <div>
          <div className="flex justify-between text-xs text-stone-600 dark:text-stone-300 mb-1">
            <span>Sapların Açılma Genişliği:</span>
            <span className="font-mono">{scene.stemSpread.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.4"
            step="0.05"
            value={scene.stemSpread}
            onChange={(e) => updateScene({ stemSpread: parseFloat(e.target.value) })}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Height Variance */}
        <div>
          <div className="flex justify-between text-xs text-stone-600 dark:text-stone-300 mb-1">
            <span>Doğal Yükseklik Farkı (Jitter):</span>
            <span className="font-mono">{scene.heightVariance.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.4"
            step="0.05"
            value={scene.heightVariance}
            onChange={(e) => updateScene({ heightVariance: parseFloat(e.target.value) })}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Lighting Preset */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-2.5 flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5" />
          <span>Sahne & Işıklandırma Ambiyansı</span>
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {lightingPresets.map((lp) => (
            <button
              key={lp.id}
              type="button"
              onClick={() => setLighting(lp.id)}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                scene.lighting === lp.id
                  ? 'bg-rose-500 text-white border-transparent shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              <span className="text-base">{lp.icon}</span>
              <span className="text-xs font-medium">{lp.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Auto-Rotate Switch */}
      <div className="flex items-center justify-between p-3.5 bg-white/70 dark:bg-stone-800/70 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
        <div className="flex items-center gap-2.5">
          <RotateCw className={`w-4 h-4 text-stone-600 ${scene.autoRotate ? 'animate-spin' : ''}`} />
          <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
            360° Otomatik Döndürme
          </span>
        </div>
        <button
          type="button"
          onClick={() => toggleAutoRotate()}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
            scene.autoRotate ? 'bg-stone-900 dark:bg-rose-500' : 'bg-stone-300 dark:bg-stone-700'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              scene.autoRotate ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
