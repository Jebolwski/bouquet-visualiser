'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { useBouquetStore } from '@/store/useBouquetStore';

export const TUTORIAL_STORAGE_KEY = 'fleur_artisan_tutorial_seen_v1';

interface TourStep {
  title: string;
  description: string;
  /** Ordered list of data-tour selectors; first visible one is highlighted */
  selectors: string[];
  preferredPlacement?: 'bottom' | 'top' | 'left' | 'right' | 'center';
  requiresMobilePanel?: boolean;
  tabToActivate?: 'flowers' | 'wrapping' | 'presets';
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to 3D Bouquet Studio',
    description:
      'Drag with your mouse or finger to orbit 360° around your bouquet, and scroll to zoom in and out.',
    selectors: ['canvas'],
    preferredPlacement: 'center',
    requiresMobilePanel: false,
  },
  {
    title: 'Flowers & Multi-Color Selection',
    description:
      'Add roses, tulips, daisies, eucalyptus, baby’s breath, and more. You can mix multiple colors of the same flower type.',
    selectors: ['tab-flowers'],
    preferredPlacement: 'left',
    requiresMobilePanel: true,
    tabToActivate: 'flowers',
  },
  {
    title: 'Wrapping, Vases & Greeting Card',
    description:
      'Choose between vintage newspaper, kraft paper, silk wraps, or glass/metallic vases with water, and customize a greeting card.',
    selectors: ['tab-wrapping'],
    preferredPlacement: 'left',
    requiresMobilePanel: true,
    tabToActivate: 'wrapping',
  },
  {
    title: 'Seasonal Collections',
    description:
      'Load curated Spring, Summer, Autumn, Winter, and Classic bouquets with a single click.',
    selectors: ['collections', 'tab-presets'],
    preferredPlacement: 'bottom',
    requiresMobilePanel: true,
    tabToActivate: 'presets',
  },
  {
    title: 'Camera & Stage Lighting',
    description:
      'Use the left elevator arrows to move the camera up or down, and the bottom bar to toggle rotation, lighting modes, or take a snapshot.',
    selectors: ['viewport-toolbar'],
    preferredPlacement: 'top',
    requiresMobilePanel: false,
  },
  {
    title: 'Complete & Share Your Bouquet',
    description:
      'When your arrangement is ready, click here to view your bouquet summary and generate a shareable link.',
    selectors: ['complete-btn'],
    preferredPlacement: 'bottom',
    requiresMobilePanel: false,
  },
];

interface RectBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

function findVisibleTargetRect(selectors: string[]): RectBox | null {
  if (typeof window === 'undefined') return null;

  for (const sel of selectors) {
    const matches = document.querySelectorAll(`[data-tour="${sel}"]`);
    for (let i = 0; i < matches.length; i++) {
      const el = matches[i] as HTMLElement;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const pad = sel === 'canvas' ? 0 : 6;
        return {
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        };
      }
    }
  }
  return null;
}

export const TutorialOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<RectBox | null>(null);
  const [viewport, setViewport] = useState({ width: 1280, height: 800 });

  const currentStep = TOUR_STEPS[stepIndex];

  const markSeenAndClose = useCallback(() => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors in private mode
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      window.dispatchEvent(new CustomEvent('bouquet-close-mobile-panel'));
    }
    setIsOpen(false);
  }, []);

  // Show automatically for first-time visitors
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!seen) {
        const timer = window.setTimeout(() => {
          setStepIndex(0);
          setIsOpen(true);
        }, 550);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Listen for manual replay trigger from Header "?" button
  useEffect(() => {
    const onStartTutorial = () => {
      setStepIndex(0);
      setIsOpen(true);
    };
    window.addEventListener('bouquet-start-tutorial', onStartTutorial);
    return () => window.removeEventListener('bouquet-start-tutorial', onStartTutorial);
  }, []);

  // Measure target element, auto-open/close mobile drawer for panel steps, and sync active tab
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep.tabToActivate) {
      useBouquetStore.getState().setActiveTab(currentStep.tabToActivate);
    }

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      window.dispatchEvent(
        new CustomEvent(
          currentStep.requiresMobilePanel ? 'bouquet-open-mobile-panel' : 'bouquet-close-mobile-panel'
        )
      );
    }

    const updateMeasure = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setTargetRect(findVisibleTargetRect(currentStep.selectors));
    };

    updateMeasure();
    // Re-measure right after mobile drawer mounts its tabs
    const rafTimer = window.setTimeout(updateMeasure, 50);
    window.addEventListener('resize', updateMeasure);
    window.addEventListener('scroll', updateMeasure, true);
    return () => {
      window.clearTimeout(rafTimer);
      window.removeEventListener('resize', updateMeasure);
      window.removeEventListener('scroll', updateMeasure, true);
    };
  }, [isOpen, currentStep]);

  // Escape key closes tutorial
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') markSeenAndClose();
      if (e.key === 'ArrowRight') {
        if (stepIndex < TOUR_STEPS.length - 1) setStepIndex((s) => s + 1);
        else markSeenAndClose();
      }
      if (e.key === 'ArrowLeft' && stepIndex > 0) {
        setStepIndex((s) => s - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, stepIndex, markSeenAndClose]);

  const cardStyle = useMemo<React.CSSProperties>(() => {
    const cardW = Math.min(340, viewport.width - 24);
    const cardH = 215;
    const margin = 14;

    // Centered card for full-canvas intro or if no target rect
    if (!targetRect || currentStep.preferredPlacement === 'center') {
      return {
        width: cardW,
        top: Math.max(16, Math.min(viewport.height - cardH - 16, viewport.height * 0.5 - cardH * 0.5)),
        left: Math.max(12, (viewport.width - cardW) * 0.5),
      };
    }

    const placement = currentStep.preferredPlacement || 'bottom';
    let top = targetRect.top + targetRect.height + margin;
    let left = targetRect.left + targetRect.width * 0.5 - cardW * 0.5;

    if (placement === 'top') {
      top = targetRect.top - cardH - margin;
    } else if (placement === 'left') {
      left = targetRect.left - cardW - margin;
      top = targetRect.top + targetRect.height * 0.5 - cardH * 0.45;
      // Fallback below if narrow screen
      if (left < 12) {
        left = targetRect.left + targetRect.width * 0.5 - cardW * 0.5;
        top = targetRect.top + targetRect.height + margin;
      }
    }

    // Clamp inside viewport bounds
    left = Math.max(12, Math.min(viewport.width - cardW - 12, left));
    top = Math.max(12, Math.min(viewport.height - cardH - 12, top));

    return { width: cardW, top, left };
  }, [targetRect, currentStep, viewport]);

  if (!isOpen) return null;

  const isLast = stepIndex === TOUR_STEPS.length - 1;
  const showSpotlightBox = targetRect && currentStep.preferredPlacement !== 'center';

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto" role="dialog" aria-modal="true">
      {/* Dimmed backdrop (either full overlay or spotlight cutout around target) */}
      {showSpotlightBox ? (
        <div
          className="fixed rounded-2xl transition-all duration-300 pointer-events-none ring-2 ring-rose-400/90"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: '0 0 0 9999px rgba(12, 10, 9, 0.62)',
          }}
        />
      ) : (
        <div
          className="fixed inset-0 bg-stone-950/55 backdrop-blur-[1px] transition-opacity"
          onClick={markSeenAndClose}
        />
      )}

      {/* Click-catcher outside card to keep interaction locked to tour */}
      {showSpotlightBox && (
        <div className="fixed inset-0" onClick={markSeenAndClose} />
      )}

      {/* Floating Tutorial Card */}
      <div
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
        className="fixed z-10 p-4 rounded-2xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200/90 dark:border-stone-700/80 shadow-2xl transition-all duration-300"
      >
        {/* Top Row: Step Counter + Close */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
            <Sparkles className="w-3 h-3" />
            <span>
              {stepIndex + 1} / {TOUR_STEPS.length}
            </span>
          </span>

          <button
            type="button"
            onClick={markSeenAndClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Description */}
        <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-50">
          {currentStep.title}
        </h4>
        <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
          {currentStep.description}
        </p>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 mt-3.5">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStepIndex(idx)}
              aria-label={`Step ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === stepIndex
                  ? 'w-5 bg-rose-500'
                  : 'w-1.5 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={markSeenAndClose}
            className="text-xs font-medium text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((s) => s - 1)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isLast) markSeenAndClose();
                else setStepIndex((s) => s + 1);
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-600 transition-colors shadow-xs"
            >
              <span>{isLast ? 'Get Started' : 'Next'}</span>
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
