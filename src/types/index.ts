export type FlowerType = 
  | 'rose' 
  | 'tulip' 
  | 'daisy' 
  | 'eucalyptus' 
  | 'babys_breath' 
  | 'lavender'
  | 'jasmine';

// Maximum capacity for a handheld wrapped bouquet to ensure optimal 3D geometry
export const MAX_TOTAL_STEMS = 25;

export interface FlowerDefinition {
  id: FlowerType;
  name: string;
  scientificName: string;
  category: 'focal' | 'accent' | 'filler' | 'greenery';
  basePrice: number;
  description: string;
  defaultColor: string;
  availableColors: { name: string; hex: string }[];
  headScale: number;
  stemLength: number;
}

export interface BouquetItem {
  uid: string; // Unique id for each stem instance
  type: FlowerType;
  color: string;
  stemLength: number;
  scale: number;
  curvature: number;
  twist: number;
}

export type WrappingType =
  | 'newspaper'
  | 'kraft'
  | 'cellophane'
  | 'silk'
  | 'none'
  | 'vase_teardrop'
  | 'vase_ribbed'
  | 'vase_tall';

export function isVaseWrapping(type: WrappingType): boolean {
  return type === 'vase_teardrop' || type === 'vase_ribbed' || type === 'vase_tall';
}

export type NewspaperStyle = 'vintage_gazette' | 'botanical_times' | 'french_chic' | 'modern_monochrome';

export interface WrappingSettings {
  type: WrappingType;
  newspaperStyle: NewspaperStyle;
  primaryColor: string;      // Used for kraft, silk tint, or vase tint
  accentColor: string;       // Inner lining tissue color
  hasInnerLining: boolean;
  hasStemWrap: boolean;      // Lower skirt wrap covering stems (like in florist reference)
  hasWater?: boolean;        // Whether vase contains water
  roughness: number;
  opacity: number;
}

export type RibbonStyle = 'satin' | 'velvet' | 'twine' | 'lace';

export interface RibbonSettings {
  enabled: boolean;
  style: RibbonStyle;
  color: string;
  bowSize: number;
}

export interface GreetingCardSettings {
  enabled: boolean;
  to: string;
  message: string;
  from: string;
  paperColor: string;
  fontStyle: 'handwriting' | 'serif' | 'modern';
}

export type ArrangementStyle = 'dome' | 'spiral' | 'wild_meadow' | 'fan';

export type LightingPreset =
  | 'studio'
  | 'golden_hour'
  | 'soft_pastel'
  | 'dramatic_noir'
  | 'stage_lighting';

export interface SceneSettings {
  lighting: LightingPreset;
  autoRotate: boolean;
  rotationSpeed: number;
  arrangementStyle: ArrangementStyle;
  tightness: number; // 0.8 to 1.4 spacing factor
  stemSpread: number; // How wide stems flare at bottom
  heightVariance: number;
}

export type SeasonCategory = 'classic' | 'spring' | 'summer' | 'autumn' | 'winter';
