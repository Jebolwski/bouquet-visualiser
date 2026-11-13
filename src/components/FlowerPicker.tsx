'use client';

import React, { useState } from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import { FLOWER_DEFINITIONS } from '@/utils/presets';
import { FlowerType, MAX_TOTAL_STEMS } from '@/types';
import { Plus, Minus, Trash2, Check } from 'lucide-react';

export const FlowerPicker: React.FC = () => {
  const flowers = useBouquetStore((state) => state.flowers);
  const addFlower = useBouquetStore((state) => state.addFlower);
  const removeFlowerByType = useBouquetStore((state) => state.removeFlowerByType);
  const removeFlowerByTypeAndColor = useBouquetStore((state) => state.removeFlowerByTypeAndColor);
  const clearBouquet = useBouquetStore((state) => state.clearBouquet);
  const selectedFlowerType = useBouquetStore((state) => state.selectedFlowerType);
  const setSelectedFlowerType = useBouquetStore((state) => state.setSelectedFlowerType);

  // Active swatch per flower type so adding/switching colors never overwrites other colors
  const [activeColors, setActiveColors] = useState<Partial<Record<FlowerType, string>>>({});

  const flowerList = Object.values(FLOWER_DEFINITIONS);
  const isAtMaxCapacity = flowers.length >= MAX_TOTAL_STEMS;

  const getCount = (type: FlowerType) => flowers.filter((f) => f.type === type).length;

  const getCountByColor = (type: FlowerType, hex: string) =>
    flowers.filter((f) => f.type === type && f.color.toLowerCase() === hex.toLowerCase()).length;

  const getActiveColor = (type: FlowerType) => {
    const chosen = activeColors[type];
    if (chosen) return chosen;
    const firstExisting = flowers.find((f) => f.type === type);
    return firstExisting ? firstExisting.color : FLOWER_DEFINITIONS[type].defaultColor;
  };

  // Distinct colors currently present in the bouquet for a given flower type
  const getColorBreakdown = (type: FlowerType) => {
    const map = new Map<string, number>();
    flowers
      .filter((f) => f.type === type)
      .forEach((f) => {
        const key = f.color.toLowerCase();
        map.set(key, (map.get(key) || 0) + 1);
      });
    return Array.from(map.entries()).map(([hex, count]) => ({ hex, count }));
  };

  const isLightHex = (hex: string) => {
    const h = hex.toLowerCase();
    return h === '#ffffff' || h === '#fdfbf7' || h === '#f8f9fa' || h === '#ffccd5' || h === '#f9f1e0';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quick stats, capacity progress bar and clear button */}
      <div className="pb-3 border-b border-stone-200/60 dark:border-stone-700/60">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Buket Hacmi</span>
            {isAtMaxCapacity && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full">
                Maksimum Kapasite
              </span>
            )}
          </div>
          {flowers.length > 0 && (
            <button
              onClick={() => clearBouquet()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
          )}
        </div>

        <p className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100">
          {flowers.length}{' '}
          <span className="text-xs font-sans font-normal text-stone-500">
            / {MAX_TOTAL_STEMS} dal (İdeal buket formu)
          </span>
        </p>

        {/* Capacity Bar */}
        <div className="w-full bg-stone-200/80 dark:bg-stone-700/60 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isAtMaxCapacity ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, (flowers.length / MAX_TOTAL_STEMS) * 100)}%` }}
          />
        </div>
      </div>

      {/* Flower Cards List */}
      <div className="flex flex-col gap-3">
        {flowerList.map((flower) => {
          const count = getCount(flower.id);
          const activeColor = getActiveColor(flower.id);
          const isSelected = selectedFlowerType === flower.id;
          const colorBreakdown = getColorBreakdown(flower.id);

          return (
            <div
              key={flower.id}
              onClick={() => setSelectedFlowerType(flower.id)}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                count > 0
                  ? 'bg-white/90 dark:bg-stone-800/90 border-stone-300 dark:border-stone-600 shadow-sm'
                  : 'bg-white/40 dark:bg-stone-800/40 border-stone-200/70 dark:border-stone-700/50 hover:bg-white/70'
              } ${isSelected ? 'ring-2 ring-rose-400/50' : ''}`}
            >
              {/* Top row: Name, color dots summary, counter */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {colorBreakdown.length > 0 ? (
                      <div className="flex -space-x-1 flex-shrink-0">
                        {colorBreakdown.map((c) => (
                          <span
                            key={c.hex}
                            className="w-3 h-3 rounded-full border border-white dark:border-stone-800 ring-1 ring-black/10"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
                        style={{ backgroundColor: activeColor }}
                      />
                    )}
                    <h4 className="font-serif font-medium text-stone-900 dark:text-stone-100 text-sm truncate">
                      {flower.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-stone-500 italic mt-0.5">{flower.scientificName}</p>
                </div>

                {/* Counter Stepper (adds activeColor, removes activeColor or last of type) */}
                <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-700/60 p-1 rounded-lg">
                  <button
                    type="button"
                    disabled={count === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (getCountByColor(flower.id, activeColor) > 0) {
                        removeFlowerByTypeAndColor(flower.id, activeColor);
                      } else {
                        removeFlowerByType(flower.id);
                      }
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
                    title="1 Dal Çıkar"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-6 text-center font-medium text-xs text-stone-800 dark:text-stone-200">
                    {count}
                  </span>

                  <button
                    type="button"
                    disabled={isAtMaxCapacity}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAtMaxCapacity) {
                        addFlower(flower.id, activeColor);
                      }
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-rose-600 dark:hover:bg-rose-400 disabled:opacity-20 disabled:pointer-events-none transition-colors shadow-xs"
                    title={
                      isAtMaxCapacity
                        ? `Maksimum buket kapasitesine ulaşıldı (${MAX_TOTAL_STEMS} dal)`
                        : 'Seçili Renkten 1 Dal Ekle'
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Color swatches selector (supports mixing multiple colors of the same flower) */}
              {(count > 0 || isSelected) && flower.availableColors.length > 1 && (
                <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-700/60">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                    <span>Eklenecek Renk:</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {flower.availableColors.find(
                        (c) => c.hex.toLowerCase() === activeColor.toLowerCase()
                      )?.name || 'Özel'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {flower.availableColors.map((color) => {
                      const isColorActive = activeColor.toLowerCase() === color.hex.toLowerCase();
                      const colorCount = getCountByColor(flower.id, color.hex);
                      return (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveColors((prev) => ({ ...prev, [flower.id]: color.hex }));
                            if (count === 0 && !isAtMaxCapacity) {
                              addFlower(flower.id, color.hex);
                            }
                          }}
                          className={`relative w-6 h-6 rounded-full border flex items-center justify-center transition-transform ${
                            isColorActive
                              ? 'scale-110 ring-2 ring-stone-800 dark:ring-stone-200 border-white'
                              : 'border-black/15 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name}${colorCount > 0 ? ` (${colorCount} dal)` : ''}`}
                        >
                          {isColorActive && (
                            <Check
                              className={`w-3 h-3 ${
                                isLightHex(color.hex) ? 'text-stone-900' : 'text-white'
                              }`}
                            />
                          )}
                          {colorCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[9px] font-bold flex items-center justify-center shadow-xs">
                              {colorCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Per-color quick adjusters when stems exist */}
                  {colorBreakdown.length > 0 && (
                    <div className="mt-2.5 flex flex-col gap-1">
                      {colorBreakdown.map((item) => {
                        const colorName =
                          flower.availableColors.find(
                            (c) => c.hex.toLowerCase() === item.hex.toLowerCase()
                          )?.name || 'Özel';
                        return (
                          <div
                            key={item.hex}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveColors((prev) => ({ ...prev, [flower.id]: item.hex }));
                            }}
                            className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-stone-100/70 dark:bg-stone-700/40"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/15 flex-shrink-0"
                                style={{ backgroundColor: item.hex }}
                              />
                              <span className="text-stone-700 dark:text-stone-200 truncate">
                                {colorName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFlowerByTypeAndColor(flower.id, item.hex);
                                }}
                                className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700"
                                title={`${colorName} 1 Dal Çıkar`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center font-semibold text-stone-800 dark:text-stone-100">
                                {item.count}
                              </span>
                              <button
                                type="button"
                                disabled={isAtMaxCapacity}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isAtMaxCapacity) {
                                    addFlower(flower.id, item.hex);
                                  }
                                }}
                                className="w-5 h-5 flex items-center justify-center rounded bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 hover:bg-rose-600 disabled:opacity-25 disabled:pointer-events-none"
                                title={`${colorName} 1 Dal Ekle`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
