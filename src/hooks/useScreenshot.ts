'use client';

import { useCallback } from 'react';

export function useScreenshot() {
  const captureScreenshot = useCallback((fileName = 'benim-buket-tasarimim.png') => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        console.warn('Canvas not found for screenshot');
        return;
      }

      // Convert canvas to high-res data URL
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    }
  }, []);

  return { captureScreenshot };
}
