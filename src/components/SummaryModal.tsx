'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useBouquetStore } from '@/store/useBouquetStore';
import { useScreenshot } from '@/hooks/useScreenshot';
import { FLOWER_DEFINITIONS } from '@/utils/presets';
import { FlowerType } from '@/types';
import { X, Share2, Camera, Check, Package, Mail, Sparkles } from 'lucide-react';

export const SummaryModal: React.FC = () => {
  const isSummaryModalOpen = useBouquetStore((state) => state.isSummaryModalOpen);
  const setIsSummaryModalOpen = useBouquetStore((state) => state.setIsSummaryModalOpen);
  const flowers = useBouquetStore((state) => state.flowers);
  const wrapping = useBouquetStore((state) => state.wrapping);
  const ribbon = useBouquetStore((state) => state.ribbon);
  const card = useBouquetStore((state) => state.card);
  const getShareableData = useBouquetStore((state) => state.getShareableData);
  const { captureScreenshot } = useScreenshot();

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isSummaryModalOpen) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ff758f', '#c9184a', '#ffccd5', '#d4af37', '#ffffff'],
        });
      } catch (e) {
        // fallback
      }
    }
  }, [isSummaryModalOpen]);

  if (!isSummaryModalOpen) return null;

  // Group flowers by type and color
  const groupedFlowers: { type: FlowerType; count: number; color: string }[] = [];
  flowers.forEach((f) => {
    const existing = groupedFlowers.find((g) => g.type === f.type && g.color === f.color);
    if (existing) {
      existing.count++;
    } else {
      groupedFlowers.push({ type: f.type, count: 1, color: f.color });
    }
  });

  const handleCopyLink = () => {
    const encoded = getShareableData();
    const url = new URL(window.location.href);
    url.searchParams.set('b', encoded);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadSnapshot = () => {
    captureScreenshot(`paris-fleur-buket-${Date.now()}.png`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsSummaryModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase tracking-widest text-rose-500 font-bold">
            Custom Design Summary
          </span>
          <h3 className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-50 mt-1">
            Your Bouquet is Ready!
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Share your design via link or download a high-resolution snapshot
          </p>
        </div>

        {/* Bouquet Contents */}
        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/60 dark:border-stone-700/60 mb-5">
          <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Bouquet Contents ({flowers.length} Stems)
          </h4>

          <div className="divide-y divide-stone-200/60 dark:divide-stone-700/60">
            {groupedFlowers.map((item, idx) => {
              const def = FLOWER_DEFINITIONS[item.type];
              return (
                <div key={idx} className="py-2.5 flex items-center gap-2 text-xs">
                  <span
                    className="w-3 h-3 rounded-full border border-black/15 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {item.count}x {def.name}
                  </span>
                </div>
              );
            })}

            {/* Wrapping */}
            <div className="py-2.5 flex items-center gap-2 text-xs text-stone-800 dark:text-stone-200">
              <Package className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Packaging:{' '}
                {wrapping.type === 'newspaper'
                  ? 'Vintage Newspaper (1894)'
                  : wrapping.type === 'kraft'
                  ? 'Artisanal Kraft'
                  : wrapping.type === 'cellophane'
                  ? 'Clear Cellophane'
                  : wrapping.type === 'silk'
                  ? 'Pastel Silk'
                  : wrapping.type === 'vase_teardrop'
                  ? `Teardrop Glass Vase (${(wrapping.hasWater ?? true) ? 'With Water' : 'Dry'})`
                  : wrapping.type === 'vase_ribbed'
                  ? `Ribbed Metallic Vase (${(wrapping.hasWater ?? true) ? 'With Water' : 'Dry'})`
                  : wrapping.type === 'vase_tall'
                  ? `Tall Classic Glass Vase (${(wrapping.hasWater ?? true) ? 'With Water' : 'Dry'})`
                  : 'Natural Raffia'}
              </span>
            </div>

            {/* Ribbon */}
            {ribbon.enabled && (
              <div className="py-2.5 flex items-center gap-2 text-xs text-stone-800 dark:text-stone-200">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ribbon.color }} />
                <span>
                  Ribbon Bow ({ribbon.style === 'satin' ? 'Satin' : ribbon.style === 'velvet' ? 'Velvet' : 'Twine'})
                </span>
              </div>
            )}

            {/* Card */}
            {card.enabled && (
              <div className="py-2.5 flex items-center gap-2 text-xs text-stone-800 dark:text-stone-200">
                <Mail className="w-3.5 h-3.5 text-rose-500" />
                <span>Personalized Greeting Card</span>
              </div>
            )}
          </div>
        </div>

        {/* Greeting Card Message Preview if enabled */}
        {card.enabled && (
          <div className="p-4 bg-amber-50/50 dark:bg-stone-800/80 rounded-2xl border border-amber-200/60 dark:border-stone-700 mb-5 text-center">
            <p className="text-xs italic text-stone-500 mb-1">
              {card.to ? `Dear ${card.to},` : 'To,'}
            </p>
            <p className="text-sm font-serif font-medium text-stone-800 dark:text-stone-200 px-4">
              &quot;{card.message || 'Your special note will appear here...'}&quot;
            </p>
            {card.from && <p className="text-xs italic text-stone-500 mt-1">— {card.from}</p>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-500/20 transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Bouquet Link / Share'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSnapshot}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 text-xs font-semibold transition-colors"
          >
            <Camera className="w-4 h-4 text-rose-500" />
            <span>Download 3D Bouquet Photo (.PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
