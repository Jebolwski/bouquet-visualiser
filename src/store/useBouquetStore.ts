import { create } from 'zustand';
import {
  FlowerType,
  BouquetItem,
  WrappingSettings,
  RibbonSettings,
  GreetingCardSettings,
  SceneSettings,
  WrappingType,
  NewspaperStyle,
  RibbonStyle,
  LightingPreset,
  ArrangementStyle,
  MAX_TOTAL_STEMS,
} from '@/types';
import { FLOWER_DEFINITIONS, BOUQUET_PRESETS } from '@/utils/presets';

interface BouquetState {
  // Flower stems list
  flowers: BouquetItem[];
  selectedFlowerType: FlowerType;

  // Wrapping, Ribbon, Card, Scene
  wrapping: WrappingSettings;
  ribbon: RibbonSettings;
  card: GreetingCardSettings;
  scene: SceneSettings;

  // UI state
  activeTab: 'flowers' | 'wrapping' | 'card' | 'presets' | 'environment';
  isSummaryModalOpen: boolean;
  isSharing: boolean;

  // Actions - Flowers
  addFlower: (type: FlowerType, color?: string) => void;
  removeFlowerByUid: (uid: string) => void;
  removeFlowerByType: (type: FlowerType) => void;
  removeFlowerByTypeAndColor: (type: FlowerType, color: string) => void;
  setFlowerCount: (type: FlowerType, count: number, color?: string) => void;
  updateFlowerColor: (type: FlowerType, color: string) => void;
  clearBouquet: () => void;
  setSelectedFlowerType: (type: FlowerType) => void;

  // Actions - Wrapping
  setWrappingType: (type: WrappingType) => void;
  setNewspaperStyle: (style: NewspaperStyle) => void;
  setWrappingPrimaryColor: (color: string) => void;
  setWrappingAccentColor: (color: string) => void;
  toggleInnerLining: () => void;
  toggleStemWrap: () => void;
  updateWrapping: (partial: Partial<WrappingSettings>) => void;

  // Actions - Ribbon
  updateRibbon: (partial: Partial<RibbonSettings>) => void;
  setRibbonStyle: (style: RibbonStyle) => void;
  setRibbonColor: (color: string) => void;
  toggleRibbon: () => void;

  // Actions - Card
  updateCard: (partial: Partial<GreetingCardSettings>) => void;
  toggleCard: () => void;

  // Actions - Scene
  updateScene: (partial: Partial<SceneSettings>) => void;
  toggleAutoRotate: () => void;
  setLighting: (lighting: LightingPreset) => void;
  setArrangementStyle: (style: ArrangementStyle) => void;

  // Actions - UI & Presets
  setActiveTab: (tab: 'flowers' | 'wrapping' | 'card' | 'presets' | 'environment') => void;
  setIsSummaryModalOpen: (open: boolean) => void;
  loadPreset: (presetId: string) => void;

  // Computed helpers
  getFlowerCount: (type: FlowerType) => number;
  getTotalStems: () => number;
  getTotalPrice: () => number;
  getShareableData: () => string;
  loadFromShareableData: (encoded: string) => boolean;
}

// Generate an individual flower item with natural slight variation
const createStem = (type: FlowerType, colorOverride?: string): BouquetItem => {
  const def = FLOWER_DEFINITIONS[type];
  const color = colorOverride || def.defaultColor;
  const lengthVariation = (Math.random() - 0.5) * 0.3; // +/- 0.15m
  const scaleVariation = 0.92 + Math.random() * 0.16;   // 0.92 to 1.08
  const curvature = (Math.random() - 0.5) * 0.2;
  const twist = Math.random() * Math.PI * 2;

  return {
    uid: `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    color,
    stemLength: def.stemLength + lengthVariation,
    scale: scaleVariation,
    curvature,
    twist,
  };
};

export const useBouquetStore = create<BouquetState>((set, get) => {
  // Initialize with Parisian Romance preset default
  const defaultPreset = BOUQUET_PRESETS[0];

  const initialFlowers: BouquetItem[] = [];
  defaultPreset.flowers.forEach((f) => {
    for (let i = 0; i < f.count; i++) {
      initialFlowers.push(createStem(f.type, f.color));
    }
  });

  return {
    flowers: initialFlowers,
    selectedFlowerType: 'rose',

    wrapping: { ...defaultPreset.wrapping },
    ribbon: { ...defaultPreset.ribbon },
    card: { ...defaultPreset.card },
    scene: { ...defaultPreset.scene },

    activeTab: 'flowers',
    isSummaryModalOpen: false,
    isSharing: false,

    // Flower actions
    addFlower: (type, color) => {
      set((state) => {
        if (state.flowers.length >= MAX_TOTAL_STEMS) return state;
        return {
          flowers: [...state.flowers, createStem(type, color)],
        };
      });
    },

    removeFlowerByUid: (uid) => {
      set((state) => ({
        flowers: state.flowers.filter((f) => f.uid !== uid),
      }));
    },

    removeFlowerByType: (type) => {
      set((state) => {
        const lastIndex = [...state.flowers].reverse().findIndex((f) => f.type === type);
        if (lastIndex === -1) return state;
        const actualIndex = state.flowers.length - 1 - lastIndex;
        const newFlowers = [...state.flowers];
        newFlowers.splice(actualIndex, 1);
        return { flowers: newFlowers };
      });
    },

    removeFlowerByTypeAndColor: (type, color) => {
      set((state) => {
        const target = color.toLowerCase();
        const lastIndex = [...state.flowers]
          .reverse()
          .findIndex((f) => f.type === type && f.color.toLowerCase() === target);
        if (lastIndex === -1) return state;
        const actualIndex = state.flowers.length - 1 - lastIndex;
        const newFlowers = [...state.flowers];
        newFlowers.splice(actualIndex, 1);
        return { flowers: newFlowers };
      });
    },

    setFlowerCount: (type, count, color) => {
      set((state) => {
        const currentItems = state.flowers.filter((f) => f.type === type);
        const otherItems = state.flowers.filter((f) => f.type !== type);
        const maxAllowed = Math.max(0, MAX_TOTAL_STEMS - otherItems.length);
        const targetCount = Math.min(Math.max(0, count), maxAllowed);
        const diff = targetCount - currentItems.length;

        if (diff === 0) return state;

        if (diff > 0) {
          const sampleColor = color || (currentItems[0]?.color ?? FLOWER_DEFINITIONS[type].defaultColor);
          const added = Array.from({ length: diff }, () => createStem(type, sampleColor));
          return { flowers: [...state.flowers, ...added] };
        } else {
          // Remove from end of that type
          const kept = currentItems.slice(0, targetCount);
          return { flowers: [...otherItems, ...kept] };
        }
      });
    },

    updateFlowerColor: (type, color) => {
      set((state) => ({
        flowers: state.flowers.map((f) => (f.type === type ? { ...f, color } : f)),
      }));
    },

    clearBouquet: () => {
      set({ flowers: [] });
    },

    setSelectedFlowerType: (type) => {
      set({ selectedFlowerType: type });
    },

    // Wrapping actions
    setWrappingType: (type) => {
      set((state) => ({
        wrapping: {
          ...state.wrapping,
          type,
          roughness: type === 'cellophane' ? 0.08 : type === 'silk' ? 0.4 : 0.85,
          opacity: type === 'cellophane' ? 0.45 : 1.0,
        },
      }));
    },

    setNewspaperStyle: (newspaperStyle) => {
      set((state) => ({
        wrapping: { ...state.wrapping, newspaperStyle },
      }));
    },

    setWrappingPrimaryColor: (primaryColor) => {
      set((state) => ({
        wrapping: { ...state.wrapping, primaryColor },
      }));
    },

    setWrappingAccentColor: (accentColor) => {
      set((state) => ({
        wrapping: { ...state.wrapping, accentColor },
      }));
    },

    toggleInnerLining: () => {
      set((state) => ({
        wrapping: { ...state.wrapping, hasInnerLining: !state.wrapping.hasInnerLining },
      }));
    },

    toggleStemWrap: () => {
      set((state) => ({
        wrapping: { ...state.wrapping, hasStemWrap: !state.wrapping.hasStemWrap },
      }));
    },

    updateWrapping: (partial) => {
      set((state) => ({
        wrapping: { ...state.wrapping, ...partial },
      }));
    },

    // Ribbon actions
    updateRibbon: (partial) => {
      set((state) => ({
        ribbon: { ...state.ribbon, ...partial },
      }));
    },

    setRibbonStyle: (style) => {
      set((state) => ({
        ribbon: { ...state.ribbon, style },
      }));
    },

    setRibbonColor: (color) => {
      set((state) => ({
        ribbon: { ...state.ribbon, color },
      }));
    },

    toggleRibbon: () => {
      set((state) => ({
        ribbon: { ...state.ribbon, enabled: !state.ribbon.enabled },
      }));
    },

    // Card actions
    updateCard: (partial) => {
      set((state) => ({
        card: { ...state.card, ...partial },
      }));
    },

    toggleCard: () => {
      set((state) => ({
        card: { ...state.card, enabled: !state.card.enabled },
      }));
    },

    // Scene actions
    updateScene: (partial) => {
      set((state) => ({
        scene: { ...state.scene, ...partial },
      }));
    },

    toggleAutoRotate: () => {
      set((state) => ({
        scene: { ...state.scene, autoRotate: !state.scene.autoRotate },
      }));
    },

    setLighting: (lighting) => {
      set((state) => ({
        scene: { ...state.scene, lighting },
      }));
    },

    setArrangementStyle: (arrangementStyle) => {
      set((state) => ({
        scene: { ...state.scene, arrangementStyle },
      }));
    },

    // UI & Preset
    setActiveTab: (activeTab) => set({ activeTab }),
    setIsSummaryModalOpen: (isSummaryModalOpen) => set({ isSummaryModalOpen }),

    loadPreset: (presetId) => {
      const preset = BOUQUET_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      const newFlowers: BouquetItem[] = [];
      preset.flowers.forEach((f) => {
        for (let i = 0; i < f.count; i++) {
          newFlowers.push(createStem(f.type, f.color));
        }
      });

      set({
        flowers: newFlowers,
        wrapping: { ...preset.wrapping },
        ribbon: { ...preset.ribbon },
        card: { ...preset.card },
        scene: { ...preset.scene },
      });
    },

    // Computed helpers
    getFlowerCount: (type) => {
      return get().flowers.filter((f) => f.type === type).length;
    },

    getTotalStems: () => {
      return get().flowers.length;
    },

    getTotalPrice: () => {
      const state = get();
      let flowersPrice = 0;
      state.flowers.forEach((f) => {
        flowersPrice += FLOWER_DEFINITIONS[f.type]?.basePrice || 3.0;
      });

      // Wrapping cost
      let wrapCost = 0;
      if (state.wrapping.type === 'newspaper') wrapCost = 4.5;
      else if (state.wrapping.type === 'kraft') wrapCost = 3.5;
      else if (state.wrapping.type === 'cellophane') wrapCost = 3.0;
      else if (state.wrapping.type === 'silk') wrapCost = 6.0;

      // Ribbon cost
      const ribbonCost = state.ribbon.enabled ? 2.5 : 0;

      // Card cost
      const cardCost = state.card.enabled ? 2.0 : 0;

      return Number((flowersPrice + wrapCost + ribbonCost + cardCost).toFixed(2));
    },

    getShareableData: () => {
      const state = get();
      // Group flowers by type and color
      const flowerSummary: Record<string, { type: FlowerType; count: number; color: string }> = {};
      state.flowers.forEach((f) => {
        const key = `${f.type}_${f.color}`;
        if (!flowerSummary[key]) {
          flowerSummary[key] = { type: f.type, count: 0, color: f.color };
        }
        flowerSummary[key].count++;
      });

      const exportObj = {
        f: Object.values(flowerSummary),
        w: state.wrapping,
        r: state.ribbon,
        c: state.card,
        s: state.scene,
      };

      try {
        return btoa(unescape(encodeURIComponent(JSON.stringify(exportObj))));
      } catch (e) {
        return '';
      }
    },

    loadFromShareableData: (encoded) => {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        if (!decoded || !decoded.f) return false;

        const importedFlowers: BouquetItem[] = [];
        decoded.f.forEach((item: { type: FlowerType; count: number; color: string }) => {
          for (let i = 0; i < item.count; i++) {
            importedFlowers.push(createStem(item.type, item.color));
          }
        });

        set({
          flowers: importedFlowers,
          wrapping: decoded.w || get().wrapping,
          ribbon: decoded.r || get().ribbon,
          card: decoded.c || get().card,
          scene: decoded.s || get().scene,
        });
        return true;
      } catch (err) {
        console.error('Failed to import bouquet data:', err);
        return false;
      }
    },
  };
});
