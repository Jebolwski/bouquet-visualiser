'use client';

import React from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import { WrappingType, NewspaperStyle, RibbonStyle, isVaseWrapping } from '@/types';
import { Newspaper, Package, Sparkles, Feather, CircleOff, Check, Wine, Droplets } from 'lucide-react';

export const WrappingPicker: React.FC = () => {
  const wrapping = useBouquetStore((state) => state.wrapping);
  const setWrappingType = useBouquetStore((state) => state.setWrappingType);
  const setNewspaperStyle = useBouquetStore((state) => state.setNewspaperStyle);
  const setWrappingPrimaryColor = useBouquetStore((state) => state.setWrappingPrimaryColor);
  const setWrappingAccentColor = useBouquetStore((state) => state.setWrappingAccentColor);
  const toggleInnerLining = useBouquetStore((state) => state.toggleInnerLining);
  const toggleStemWrap = useBouquetStore((state) => state.toggleStemWrap);
  const toggleVaseWater = useBouquetStore((state) => state.toggleVaseWater);
  const isVase = isVaseWrapping(wrapping.type);

  const ribbon = useBouquetStore((state) => state.ribbon);
  const toggleRibbon = useBouquetStore((state) => state.toggleRibbon);
  const setRibbonStyle = useBouquetStore((state) => state.setRibbonStyle);
  const setRibbonColor = useBouquetStore((state) => state.setRibbonColor);
  const updateRibbon = useBouquetStore((state) => state.updateRibbon);

  const wrappingOptions: {
    type: WrappingType;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'newspaper',
      title: 'Vintage Newspaper',
      description: 'Authentic 1894 Paris & London botanical engraving newspaper print',
      icon: <Newspaper className="w-5 h-5 text-amber-700" />,
    },
    {
      type: 'kraft',
      title: 'Artisanal Kraft',
      description: 'Natural recycled fibrous brown kraft florist paper',
      icon: <Package className="w-5 h-5 text-amber-800" />,
    },
    {
      type: 'cellophane',
      title: 'Clear Cellophane',
      description: 'Crystal-clear glossy protective florist wrap',
      icon: <Sparkles className="w-5 h-5 text-sky-500" />,
    },
    {
      type: 'silk',
      title: 'Pastel Silk / Satin',
      description: 'Luxurious soft-textured pastel fabric wrapping',
      icon: <Feather className="w-5 h-5 text-rose-500" />,
    },
    {
      type: 'none',
      title: 'Natural Raffia Only',
      description: 'Unwrapped bouquet with stems tied in natural twine',
      icon: <CircleOff className="w-5 h-5 text-stone-400" />,
    },
  ];

  const newspaperStyles: { id: NewspaperStyle; label: string }[] = [
    { id: 'vintage_gazette', label: 'Le Jardinier (1894)' },
    { id: 'botanical_times', label: 'The Botanical Times' },
    { id: 'french_chic', label: 'L’Étoile Fleurie' },
    { id: 'modern_monochrome', label: 'Modern Monochrome' },
  ];

  const kraftColors = [
    { name: 'Original Kraft', hex: '#c8ad8d' },
    { name: 'Warm Caramel', hex: '#9c7c58' },
    { name: 'Ivory Cream', hex: '#e8dec8' },
    { name: 'Dark Rustic', hex: '#634b35' },
  ];

  const silkColors = [
    { name: 'Blush Pink', hex: '#e8c5c8' },
    { name: 'Baby Blue', hex: '#c5dbe8' },
    { name: 'Sage Green', hex: '#c8dac5' },
    { name: 'Lavender Mist', hex: '#dbc5e8' },
    { name: 'Snow White', hex: '#fdfbf7' },
  ];

  const vaseOptions: {
    type: WrappingType;
    title: string;
    description: string;
  }[] = [
    {
      type: 'vase_teardrop',
      title: 'Teardrop Glass Vase',
      description: 'Tapered narrow neck with a rounded crystal-clear belly',
    },
    {
      type: 'vase_ribbed',
      title: 'Ribbed Metallic Vase',
      description: 'Fluted vertical-ribbed urn in warm metallic or ceramic finishes',
    },
    {
      type: 'vase_tall',
      title: 'Tall Classic Glass Vase',
      description: 'Graceful curved tall glass presentation vase',
    },
  ];

  const glassVaseColors = [
    { name: 'Crystal Clear', hex: '#e6f4f8' },
    { name: 'Smoked Gray', hex: '#9aa5b1' },
    { name: 'Honey Amber', hex: '#d99b52' },
    { name: 'Blush Glass', hex: '#f2c6cf' },
    { name: 'Sage Glass', hex: '#a8c6b1' },
  ];

  const ribbedVaseColors = [
    { name: 'Antique Gold', hex: '#d4af37' },
    { name: 'Champagne Bronze', hex: '#c9a66b' },
    { name: 'Matte Ivory', hex: '#f3ede2' },
    { name: 'Anthracite Metallic', hex: '#3d4048' },
    { name: 'Blush Ceramic', hex: '#e8c5c8' },
  ];

  const ribbonColors = [
    { name: 'Gold Foil', hex: '#d4af37' },
    { name: 'Burgundy Velvet', hex: '#590d22' },
    { name: 'Midnight Blue', hex: '#1d3557' },
    { name: 'Emerald Green', hex: '#2d6a4f' },
    { name: 'Blush Pink', hex: '#ffb3c1' },
    { name: 'Natural Twine', hex: '#654321' },
    { name: 'Pure White', hex: '#ffffff' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Wrapping Material Selector */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">
          Wrapping Paper Type
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          {wrappingOptions.map((opt) => {
            const isActive = wrapping.type === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setWrappingType(opt.type)}
                className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-md'
                    : 'bg-white/60 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-700/60 hover:bg-white dark:hover:bg-stone-800'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-white/10 dark:bg-stone-900/10 text-white dark:text-stone-900'
                      : 'bg-stone-100 dark:bg-stone-700'
                  }`}
                >
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-medium text-sm">{opt.title}</span>
                    {isActive && <Check className="w-4 h-4 ml-2" />}
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isActive ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500'
                    }`}
                  >
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Newspaper Specific Sub-Style Options */}
      {wrapping.type === 'newspaper' && (
        <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
          <label className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200 mb-2 block">
            Newspaper Issue &amp; Masthead
          </label>
          <div className="grid grid-cols-2 gap-2">
            {newspaperStyles.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setNewspaperStyle(style.id)}
                className={`px-3 py-2 text-xs rounded-lg font-medium text-left transition-colors border ${
                  wrapping.newspaperStyle === style.id
                    ? 'bg-amber-900 text-white border-transparent'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-amber-200 dark:border-stone-700 hover:bg-amber-100/50'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Kraft / Silk Color Palette */}
      {(wrapping.type === 'kraft' || wrapping.type === 'silk') && (
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
          <span className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-2 block">
            Paper Color Tone:
          </span>
          <div className="flex gap-2">
            {(wrapping.type === 'kraft' ? kraftColors : silkColors).map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setWrappingPrimaryColor(c.hex)}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-transform ${
                  wrapping.primaryColor === c.hex
                    ? 'scale-110 ring-2 ring-stone-900 dark:ring-stone-100 border-white'
                    : 'border-black/15 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {wrapping.primaryColor === c.hex && <Check className="w-3.5 h-3.5 text-stone-900" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1.5 Vase Options */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">
          Vase Options
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          {vaseOptions.map((opt) => {
            const isActive = wrapping.type === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setWrappingType(opt.type)}
                className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-md'
                    : 'bg-white/60 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-700/60 hover:bg-white dark:hover:bg-stone-800'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? 'bg-white/10 dark:bg-stone-900/10 text-white dark:text-stone-900'
                      : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                  }`}
                >
                  <Wine className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-medium text-sm">{opt.title}</span>
                    {isActive && <Check className="w-4 h-4 ml-2" />}
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isActive ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500'
                    }`}
                  >
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vase Water & Color Controls */}
      {isVase && (
        <div className="flex flex-col gap-3">
          {/* Water in Vase Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-white/70 dark:bg-stone-800/70 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-500">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-medium text-stone-800 dark:text-stone-200">
                  Water in Vase
                </h5>
                <p className="text-[11px] text-stone-500">
                  {(wrapping.hasWater ?? true) ? 'Filled with clear water' : 'Dry / empty vase'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleVaseWater()}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                (wrapping.hasWater ?? true)
                  ? 'bg-sky-500 dark:bg-sky-500'
                  : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  (wrapping.hasWater ?? true) ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Vase Tint / Finish Color */}
          <div className="p-3.5 bg-white/70 dark:bg-stone-800/70 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
            <h4 className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-2.5">
              {wrapping.type === 'vase_ribbed' ? 'Vase Finish & Color' : 'Glass Tint'}
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {(wrapping.type === 'vase_ribbed' ? ribbedVaseColors : glassVaseColors).map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setWrappingPrimaryColor(c.hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform flex items-center justify-center ${
                    wrapping.primaryColor === c.hex
                      ? 'scale-110 ring-2 ring-stone-900 dark:ring-stone-100 border-white'
                      : 'border-black/15 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {wrapping.primaryColor === c.hex && <Check className="w-3.5 h-3.5 text-stone-900" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Inner Tissue Lining Toggle */}
      {!isVase && wrapping.type !== 'none' && wrapping.type !== 'cellophane' && (
        <div className="flex items-center justify-between p-3.5 bg-white/70 dark:bg-stone-800/70 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
          <div>
            <h5 className="text-xs font-medium text-stone-800 dark:text-stone-200">
              Inner Tissue Lining
            </h5>
            <p className="text-[11px] text-stone-500">
              Second decorative tissue layer peeking above the rim
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleInnerLining()}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              wrapping.hasInnerLining ? 'bg-stone-900 dark:bg-rose-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                wrapping.hasInnerLining ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* 4.1 Alt Sap Ambalajı / Etek Sarımı (Marmara Çiçek referansı) */}
      {!isVase && wrapping.type !== 'none' && (
        <div className="flex items-center justify-between p-3.5 bg-white/70 dark:bg-stone-800/70 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
          <div>
            <h5 className="text-xs font-medium text-stone-800 dark:text-stone-200">
              Lower Stem Skirt Wrap
            </h5>
            <p className="text-[11px] text-stone-500">
              Flared lower paper skirt wrapping the bouquet stems
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleStemWrap()}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              wrapping.hasStemWrap ? 'bg-stone-900 dark:bg-rose-500' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                wrapping.hasStemWrap ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* 5. Ribbon / Bow Section */}
      {!isVase && (
      <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs uppercase tracking-wider text-stone-500 font-medium">
            Decorative Ribbon &amp; Bow
          </h4>
          <button
            type="button"
            onClick={() => toggleRibbon()}
            className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline"
          >
            {ribbon.enabled ? 'Remove Ribbon' : 'Add Ribbon'}
          </button>
        </div>

        {ribbon.enabled && (
          <div className="flex flex-col gap-3 p-3.5 bg-white/70 dark:bg-stone-800/70 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
            {/* Style Selector */}
            <div className="grid grid-cols-3 gap-1.5 bg-stone-100 dark:bg-stone-700/60 p-1 rounded-lg text-xs font-medium text-center">
              {(['satin', 'velvet', 'twine'] as RibbonStyle[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setRibbonStyle(st)}
                  className={`py-1.5 rounded-md capitalize transition-colors ${
                    ribbon.style === st
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  {st === 'satin' ? 'Satin' : st === 'velvet' ? 'Velvet' : 'Twine'}
                </button>
              ))}
            </div>

            {/* Color Swatches */}
            <div>
              <span className="text-[11px] text-stone-500 block mb-1.5">Ribbon Color:</span>
              <div className="flex flex-wrap gap-2">
                {ribbonColors.map((rc) => (
                  <button
                    key={rc.hex}
                    type="button"
                    onClick={() => setRibbonColor(rc.hex)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform ${
                      ribbon.color === rc.hex
                        ? 'scale-110 ring-2 ring-stone-900 dark:ring-stone-100 border-white'
                        : 'border-black/15 hover:scale-105'
                    }`}
                    style={{ backgroundColor: rc.hex }}
                    title={rc.name}
                  >
                    {ribbon.color === rc.hex && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          rc.hex === '#ffffff' || rc.hex === '#ffb3c1' ? 'text-stone-900' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bow Size Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                <span>Bow Size:</span>
                <span>{ribbon.bowSize.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={ribbon.bowSize}
                onChange={(e) => updateRibbon({ bowSize: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
