'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { ControlPanel } from '@/components/ControlPanel';
import { ViewportControls } from '@/components/ViewportControls';
import { SummaryModal } from '@/components/SummaryModal';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { useBouquetStore } from '@/store/useBouquetStore';
import { Loader2, SlidersHorizontal, ChevronRight, X } from 'lucide-react';

// Dynamically import 3D Canvas without SSR to avoid hydration issues with Three.js
const BouquetCanvas = dynamic(
  () => import('@/canvas/BouquetCanvas').then((mod) => mod.BouquetCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-stone-50 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-xs uppercase tracking-widest font-medium">Loading 3D Studio...</p>
      </div>
    ),
  }
);

export default function Home() {
  const loadFromShareableData = useBouquetStore((state) => state.loadFromShareableData);
  const lighting = useBouquetStore((state) => state.scene.lighting);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  // Check URL query parameters for shared bouquet (?b=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedData = urlParams.get('b');
      if (sharedData) {
        loadFromShareableData(sharedData);
      }
    }
  }, [loadFromShareableData]);

  // Open/close mobile drawer from collection selection or onboarding tutorial
  useEffect(() => {
    const onOpenMobilePanel = () => setMobilePanelOpen(true);
    const onCloseMobilePanel = () => setMobilePanelOpen(false);
    window.addEventListener('bouquet-open-mobile-panel', onOpenMobilePanel);
    window.addEventListener('bouquet-close-mobile-panel', onCloseMobilePanel);
    return () => {
      window.removeEventListener('bouquet-open-mobile-panel', onOpenMobilePanel);
      window.removeEventListener('bouquet-close-mobile-panel', onCloseMobilePanel);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-radial-gradient">
      {/* 1. Header Bar */}
      <Header />

      {/* 2. Main Studio Area */}
      <main className="relative flex-1 flex overflow-hidden">
        {/* Left: 3D WebGL Canvas Area */}
        <section
          data-tour="canvas"
          className="relative flex-1 h-full overflow-hidden bg-transparent transition-colors duration-500"
          style={
            lighting === 'dramatic_noir'
              ? {
                  background:
                    'radial-gradient(circle at 64% 16%, #1f2230 0%, #101117 52%, #060609 100%)',
                }
              : lighting === 'stage_lighting'
              ? {
                  background:
                    'radial-gradient(circle at 50% 82%, #231d2b 0%, #111018 52%, #050508 100%)',
                }
              : lighting === 'sunlight'
              ? {
                  background:
                    'linear-gradient(180deg, #4b8fd1 0%, #8bc0eb 44%, #dcedf9 82%, #f5efe3 100%)',
                }
              : lighting === 'golden_hour'
              ? {
                  background:
                    'linear-gradient(180deg, #392c54 0%, #8c4866 36%, #e68a5c 72%, #ffd49e 100%)',
                }
              : undefined
          }
        >
          <BouquetCanvas />
          <ViewportControls />

          {/* Mobile Toggle Button for Control Panel */}
          <button
            type="button"
            data-tour="mobile-panel-btn"
            onClick={() => setMobilePanelOpen(true)}
            className="md:hidden absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-glass border border-stone-200 text-xs font-semibold text-stone-800 dark:text-stone-100"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-500" />
            <span>Design Panel</span>
          </button>
        </section>

        {/* Right: Desktop Glassmorphic Control Panel */}
        <section className="hidden md:flex h-full">
          <ControlPanel />
        </section>

        {/* Mobile Control Panel Drawer Overlay */}
        {mobilePanelOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex flex-col bg-white dark:bg-stone-900 animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
              <span className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Customize Bouquet
              </span>
              <button
                type="button"
                onClick={() => setMobilePanelOpen(false)}
                className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ControlPanel />
            </div>
          </div>
        )}
      </main>

      {/* 3. Summary & Share Modal */}
      <SummaryModal />

      {/* 4. First-Time Visitor Guided Tutorial */}
      <TutorialOverlay />
    </div>
  );
}
