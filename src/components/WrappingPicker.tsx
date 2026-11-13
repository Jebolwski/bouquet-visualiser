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
      title: 'Vintage Gazete',
      description: '1894 Paris & Londra botanik gravürlü otantik gazete baskısı',
      icon: <Newspaper className="w-5 h-5 text-amber-700" />,
    },
    {
      type: 'kraft',
      title: 'Artisanal Kraft',
      description: 'Geri dönüştürülmüş lifli doğal kahve kraft kağıt',
      icon: <Package className="w-5 h-5 text-amber-800" />,
    },
    {
      type: 'cellophane',
      title: 'Şeffaf Jelatin',
      description: 'Kristal berraklığında parlak koruyucu çiçekçi jelatini',
      icon: <Sparkles className="w-5 h-5 text-sky-500" />,
    },
    {
      type: 'silk',
      title: 'Pastel İpek / Saten',
      description: 'Lüks ve yumuşak dokulu pastel kumaş sarımı',
      icon: <Feather className="w-5 h-5 text-rose-500" />,
    },
    {
      type: 'none',
      title: 'Sadece Doğal Rafya',
      description: 'Ambalajsız, sapları doğal kınnap ile bağlı buket',
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
    { name: 'Orijinal Kraft', hex: '#c8ad8d' },
    { name: 'Sıcak Karamel', hex: '#9c7c58' },
    { name: 'Fildişi Krem', hex: '#e8dec8' },
    { name: 'Koyu Rustik', hex: '#634b35' },
  ];

  const silkColors = [
    { name: 'Pudra Pembe', hex: '#e8c5c8' },
    { name: 'Bebek Mavisi', hex: '#c5dbe8' },
    { name: 'Adaçayı Yeşili', hex: '#c8dac5' },
    { name: 'Lavanta Sisi', hex: '#dbc5e8' },
    { name: 'Kar Beyazı', hex: '#fdfbf7' },
  ];

  const vaseOptions: {
    type: WrappingType;
    title: string;
    description: string;
  }[] = [
    {
      type: 'vase_teardrop',
      title: 'Damla Cam Vazo',
      description: 'Dar boyunlu, yuvarlak gövdeli şeffaf kristal cam vazo',
    },
    {
      type: 'vase_ribbed',
      title: 'Fitilli Metalik Vazo',
      description: 'Dikey oluklu, sıcak altın ve seramik dokulu dekoratif vazo',
    },
    {
      type: 'vase_tall',
      title: 'Uzun Klasik Cam Vazo',
      description: 'Zarif kavisli, yüksek gövdeli şeffaf sunum vazosu',
    },
  ];

  const glassVaseColors = [
    { name: 'Kristal Şeffaf', hex: '#e6f4f8' },
    { name: 'Dumanlı Gri', hex: '#9aa5b1' },
    { name: 'Bal Kehribar', hex: '#d99b52' },
    { name: 'Pudra Cam', hex: '#f2c6cf' },
    { name: 'Adaçayı Cam', hex: '#a8c6b1' },
  ];

  const ribbedVaseColors = [
    { name: 'Altın Varak', hex: '#d4af37' },
    { name: 'Şampanya Bronz', hex: '#c9a66b' },
    { name: 'Mat Fildişi', hex: '#f3ede2' },
    { name: 'Antrasit Metalik', hex: '#3d4048' },
    { name: 'Pudra Seramik', hex: '#e8c5c8' },
  ];

  const ribbonColors = [
    { name: 'Altın Varak', hex: '#d4af37' },
    { name: 'Bordo Kadife', hex: '#590d22' },
    { name: 'Gece Mavisi', hex: '#1d3557' },
    { name: 'Zümrüt Yeşili', hex: '#2d6a4f' },
    { name: 'Pudra Pembe', hex: '#ffb3c1' },
    { name: 'Kınnap Kahvesi', hex: '#654321' },
    { name: 'Saf Beyaz', hex: '#ffffff' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Wrapping Material Selector */}
      <div>
        <h4 className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-3">
          Ambalaj Kağıdı Türü
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
            Gazete Sayı & Başlık Deseni
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
            Kağıt Renk Tonu:
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
          Vazo Seçenekleri
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
                  Vazoda Su
                </h5>
                <p className="text-[11px] text-stone-500">
                  {(wrapping.hasWater ?? true) ? 'Vazo içinde berrak su dolu' : 'Susuz / kuru vazo'}
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
              {wrapping.type === 'vase_ribbed' ? 'Vazo Rengi & Dokusu' : 'Cam Tonu'}
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
              İç Astar Pelur Kağıdı
            </h5>
            <p className="text-[11px] text-stone-500">
              Üst kenardan taşan ikinci katman dekoratif tül
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
              Alt Sap Ambalajı (Etek Sarımı)
            </h5>
            <p className="text-[11px] text-stone-500">
              Sapları boydan boya zarifçe saran alt ambalaj eteği
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
            Dekoratif Kurdele & Düğüm
          </h4>
          <button
            type="button"
            onClick={() => toggleRibbon()}
            className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline"
          >
            {ribbon.enabled ? 'Kurdeleyi Kaldır' : 'Kurdele Ekle'}
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
                  {st === 'satin' ? 'Saten' : st === 'velvet' ? 'Kadife' : 'Kınnap İp'}
                </button>
              ))}
            </div>

            {/* Color Swatches */}
            <div>
              <span className="text-[11px] text-stone-500 block mb-1.5">Kurdele Rengi:</span>
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
                <span>Düğüm Büyüklüğü:</span>
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
