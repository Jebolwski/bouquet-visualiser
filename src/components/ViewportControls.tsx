'use client';

import React, { useRef, useState } from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import { useScreenshot } from '@/hooks/useScreenshot';
import {
  RotateCw,
  RotateCcw,
  Camera,
  Sun,
  Info,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { LightingPreset } from '@/types';

const dispatchCameraStep = (action: 'up' | 'down' | 'reset') => {
  window.dispatchEvent(new CustomEvent('bouquet-camera-step', { detail: action }));
};

const dispatchCameraHold = (dir: 'up' | 'down' | null) => {
  window.dispatchEvent(new CustomEvent('bouquet-camera-hold', { detail: dir }));
};

export const ViewportControls: React.FC = () => {
  const scene = useBouquetStore((state) => state.scene);
  const toggleAutoRotate = useBouquetStore((state) => state.toggleAutoRotate);
  const setLighting = useBouquetStore((state) => state.setLighting);
  const { captureScreenshot } = useScreenshot();
  const [copiedShot, setCopiedShot] = useState(false);

  const holdTimerRef = useRef<number | null>(null);
  const isHoldingRef = useRef(false);

  const handleCapture = () => {
    captureScreenshot(`buket-tasarimim-${Date.now()}.png`);
    setCopiedShot(true);
    setTimeout(() => setCopiedShot(false), 2000);
  };

  const nextLighting = () => {
    const sequence: LightingPreset[] = ['studio', 'golden_hour', 'soft_pastel', 'dramatic_noir'];
    const currentIdx = sequence.indexOf(scene.lighting);
    const nextIdx = (currentIdx + 1) % sequence.length;
    setLighting(sequence[nextIdx]);
  };

  const startHold = (dir: 'up' | 'down') => {
    isHoldingRef.current = false;
    holdTimerRef.current = window.setTimeout(() => {
      isHoldingRef.current = true;
      dispatchCameraHold(dir);
    }, 160);
  };

  const stopHold = (dir?: 'up' | 'down') => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      dispatchCameraHold(null);
    } else if (dir) {
      dispatchCameraStep(dir);
    }
  };

  return (
    <>
      {/* Top Floating Help Pill */}
      <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-stone-900/70 backdrop-blur-md border border-white/50 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-300 shadow-glass pointer-events-none select-none">
        <Info className="w-3.5 h-3.5 text-stone-400" />
        <span>Sürükleyerek 360° ve alçak/yüksek açıdan inceleyin • Tekerlekle yakınlaşın</span>
      </div>

      {/* Left Vertical Camera Elevation / Angle Pill */}
      <div
        className="absolute left-4 bottom-24 sm:bottom-6 z-10 flex flex-col items-center gap-1 p-1.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-white/60 dark:border-stone-800 shadow-glass-hover select-none"
        title="Kamerayı Asansör Gibi Yukarı / Aşağı Taşı"
      >
        <button
          type="button"
          onPointerDown={() => startHold('up')}
          onPointerUp={() => stopHold('up')}
          onPointerLeave={() => {
            if (holdTimerRef.current !== null || isHoldingRef.current) stopHold();
          }}
          onPointerCancel={() => stopHold()}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all"
          title="Kamerayı Yukarı Taşı"
          aria-label="Kamerayı yukarı kaldır"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => dispatchCameraStep('reset')}
          className="w-8 h-7 flex items-center justify-center rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all"
          title="Kamerayı Sıfırla"
          aria-label="Kamera açısını sıfırla"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onPointerDown={() => startHold('down')}
          onPointerUp={() => stopHold('down')}
          onPointerLeave={() => {
            if (holdTimerRef.current !== null || isHoldingRef.current) stopHold();
          }}
          onPointerCancel={() => stopHold()}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all"
          title="Kamerayı Aşağı Taşı"
          aria-label="Kamerayı aşağı indir"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Center Glass Floating Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-white/60 dark:border-stone-800 shadow-glass-hover select-none">
        {/* Auto Rotate Toggle */}
        <button
          type="button"
          onClick={() => toggleAutoRotate()}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            scene.autoRotate
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
          title="Otomatik Döndürme"
        >
          <RotateCw className={`w-3.5 h-3.5 ${scene.autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Döndür</span>
        </button>

        {/* Lighting Cycle Button */}
        <button
          type="button"
          onClick={nextLighting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title={`Şu anki: ${scene.lighting}`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline capitalize">
            {scene.lighting === 'studio'
              ? 'Stüdyo'
              : scene.lighting === 'golden_hour'
              ? 'Gün Batımı'
              : scene.lighting === 'soft_pastel'
              ? 'Pastel'
              : 'Noir'}
          </span>
        </button>

        {/* Reset Camera Button */}
        <button
          type="button"
          onClick={() => dispatchCameraStep('reset')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all"
          title="Kamerayı Varsayılan Açıya Sıfırla"
          aria-label="Kamerayı sıfırla"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sıfırla</span>
        </button>

        <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

        {/* Capture Snapshot Button */}
        <button
          type="button"
          onClick={handleCapture}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 transition-all shadow-xs"
          title="Yüksek Çözünürlüklü Fotoğrafını İndir"
        >
          {copiedShot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Camera className="w-3.5 h-3.5" />}
          <span>{copiedShot ? 'Kaydedildi!' : 'Fotoğraf Çek'}</span>
        </button>
      </div>
    </>
  );
};
