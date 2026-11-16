'use client';

import React from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import { ArrangementStyle, LightingPreset } from '@/types';
import { Compass, Sun, Sliders, RotateCw, Check } from 'lucide-react';

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
      title: 'Classic Dome',
      desc: 'Balanced spherical form with a symmetrical florist circle',
    },
    {
      id: 'spiral',
      title: 'Golden Ratio Spiral',
      desc: 'Graduated elegance following the Fibonacci spiral rule',
    },
    {
      id: 'wild_meadow',
      title: 'Wild Meadow',
      desc: 'Airy, natural, and free-flowing cottage garden arrangement',
    },
    {
      id: 'fan',
      title: 'Presentation Fan',
      desc: 'Noble fan silhouette with tall back and low front',
    },
  ];

  const lightingPresets: { id: LightingPreset; name: string; icon: string }[] = [
    { id: 'studio', name: 'Studio Light', icon: '💡' },
    { id: 'sunlight', name: 'Sunlight', icon: '☀️' },
    { id: 'golden_hour', name: 'Sunset', icon: '🌅' },
    { id: 'soft_pastel', name: 'Pastel Nordic', icon: '🌸' },
    { id: 'dramatic_noir', name: 'Dramatic Noir', icon: '🌙' },
    { id: 'stage_lighting', name: 'Stage Lighting', icon: '🎭' },
  ];

  const lightingColors = [
    { name: 'Pure White', hex: '#f8fbff' },
    { name: 'Warm Daylight', hex: '#ffd6a5' },
    { name: 'Ice Blue', hex: '#7cc6fe' },
    { name: 'Romantic Rose', hex: '#ff8fa3' },
    { name: 'Amber Gold', hex: '#ffbe55' },
    { name: 'Lavender Glow', hex: '#c792ea' },
    { name: 'Emerald Green', hex: '#6ee7b7' },
  ];

  const activeLightColor = scene.lightingColor || '#f8fbff';
  const sunlightIntensity = scene.sunlightIntensity ?? 1.25;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Arrangement Style */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          <span>Arrangement Geometry</span>
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
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 border-transparent shadow-md'
                    : 'bg-white/80 dark:bg-stone-800/85 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800'
                }`}
              >
                <div className="font-serif font-semibold text-sm">{opt.title}</div>
                <div
                  className={`text-xs mt-0.5 ${
                    isActive ? 'text-stone-200 dark:text-stone-700' : 'text-stone-600 dark:text-stone-300'
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
          <span>Volume &amp; Form Fine-Tuning</span>
        </h4>

        {/* Tightness */}
        <div>
          <div className="flex justify-between text-xs text-stone-600 dark:text-stone-300 mb-1">
            <span>Bouquet Tightness (Radius):</span>
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
            <span>Stem Spread Width:</span>
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
            <span>Natural Height Variance (Jitter):</span>
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
          <span>Stage &amp; Lighting Ambiance</span>
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

        {/* Lighting Color Selector for Dramatik Noir & Sahne Işığı */}
        {(scene.lighting === 'dramatic_noir' || scene.lighting === 'stage_lighting') && (
          <div className="mt-3 p-3 rounded-xl bg-white/70 dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                Lighting Color
              </span>
              <span className="text-[11px] font-mono text-stone-400 uppercase">
                {activeLightColor}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {lightingColors.map((lc) => {
                const isSelected = activeLightColor.toLowerCase() === lc.hex.toLowerCase();
                return (
                  <button
                    key={lc.hex}
                    type="button"
                    onClick={() => updateScene({ lightingColor: lc.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform flex items-center justify-center ${
                      isSelected
                        ? 'scale-110 ring-2 ring-rose-500 border-white dark:border-stone-900'
                        : 'border-black/15 hover:scale-105'
                    }`}
                    style={{ backgroundColor: lc.hex }}
                    title={lc.name}
                    aria-label={lc.name}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-stone-900" />}
                  </button>
                );
              })}

              {/* Custom color picker */}
              <label
                className="w-7 h-7 rounded-full border-2 border-dashed border-stone-300 dark:border-stone-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                title="Pick Custom Light Color"
              >
                <span className="text-[10px] font-bold text-stone-500">+</span>
                <input
                  type="color"
                  value={activeLightColor}
                  onChange={(e) => updateScene({ lightingColor: e.target.value })}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        )}

        {/* Sunlight Brightness Slider */}
        {scene.lighting === 'sunlight' && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40">
            <div className="flex justify-between text-xs text-stone-700 dark:text-stone-200 mb-1.5">
              <span className="font-medium">Sunlight Brightness</span>
              <span className="font-mono text-amber-700 dark:text-amber-300">
                {Math.round(sunlightIntensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.2"
              step="0.05"
              value={sunlightIntensity}
              onChange={(e) => updateScene({ sunlightIntensity: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 4. Auto-Rotate Switch */}
      <div className="flex items-center justify-between p-3.5 bg-white/70 dark:bg-stone-800/70 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
        <div className="flex items-center gap-2.5">
          <RotateCw className={`w-4 h-4 text-stone-600 ${scene.autoRotate ? 'animate-spin' : ''}`} />
          <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
            360° Auto Rotate
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
