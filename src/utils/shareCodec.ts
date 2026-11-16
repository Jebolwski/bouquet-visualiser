import {
  ArrangementStyle,
  FlowerType,
  GreetingCardSettings,
  LightingPreset,
  NewspaperStyle,
  RibbonSettings,
  RibbonStyle,
  SceneSettings,
  WrappingSettings,
  WrappingType,
} from '@/types';

const FLOWER_TYPES: FlowerType[] = [
  'rose',
  'tulip',
  'daisy',
  'eucalyptus',
  'babys_breath',
  'lavender',
  'jasmine',
];

const WRAPPING_TYPES: WrappingType[] = [
  'newspaper',
  'kraft',
  'cellophane',
  'silk',
  'none',
  'vase_teardrop',
  'vase_ribbed',
  'vase_tall',
];

const NEWSPAPER_STYLES: NewspaperStyle[] = [
  'vintage_gazette',
  'botanical_times',
  'french_chic',
  'modern_monochrome',
];

const RIBBON_STYLES: RibbonStyle[] = ['satin', 'velvet', 'twine', 'lace'];
const FONT_STYLES: GreetingCardSettings['fontStyle'][] = ['handwriting', 'serif', 'modern'];
const ARRANGEMENTS: ArrangementStyle[] = ['dome', 'spiral', 'wild_meadow', 'fan'];
const LIGHTINGS: LightingPreset[] = [
  'studio',
  'sunlight',
  'golden_hour',
  'soft_pastel',
  'dramatic_noir',
  'stage_lighting',
];

const stripHash = (hex: string) => hex.replace(/^#/, '').toLowerCase();
const addHash = (hex: string) => (hex.startsWith('#') ? hex : `#${hex}`);

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export interface CompactShareInput {
  flowers: { type: FlowerType; count: number; color: string }[];
  wrapping: WrappingSettings;
  ribbon: RibbonSettings;
  card: GreetingCardSettings;
  scene: SceneSettings;
  defaults: {
    wrapping: WrappingSettings;
    ribbon: RibbonSettings;
    card: GreetingCardSettings;
    scene: SceneSettings;
  };
}

/**
 * Encodes a bouquet into a compact delta-only base64url string prefixed with `2.`
 * (typically 70–85% shorter than raw JSON base64).
 */
export function encodeCompactBouquet(input: CompactShareInput): string {
  const { flowers, wrapping, ribbon, card, scene, defaults } = input;

  // Compact flower tuples: [typeIdx, count, hexNoHash]
  const f = flowers.map((fl) => [
    Math.max(0, FLOWER_TYPES.indexOf(fl.type)),
    fl.count,
    stripHash(fl.color),
  ]);

  // Delta-only objects
  const w: Record<string, unknown> = {};
  if (wrapping.type !== defaults.wrapping.type) w.t = WRAPPING_TYPES.indexOf(wrapping.type);
  if (wrapping.newspaperStyle !== defaults.wrapping.newspaperStyle)
    w.n = NEWSPAPER_STYLES.indexOf(wrapping.newspaperStyle);
  if (stripHash(wrapping.primaryColor) !== stripHash(defaults.wrapping.primaryColor))
    w.p = stripHash(wrapping.primaryColor);
  if (stripHash(wrapping.accentColor) !== stripHash(defaults.wrapping.accentColor))
    w.a = stripHash(wrapping.accentColor);
  if (wrapping.hasInnerLining !== defaults.wrapping.hasInnerLining)
    w.i = wrapping.hasInnerLining ? 1 : 0;
  if (wrapping.hasStemWrap !== defaults.wrapping.hasStemWrap)
    w.s = wrapping.hasStemWrap ? 1 : 0;
  if (wrapping.hasWater !== undefined && wrapping.hasWater !== defaults.wrapping.hasWater)
    w.w = wrapping.hasWater ? 1 : 0;

  const r: Record<string, unknown> = {};
  if (ribbon.enabled !== defaults.ribbon.enabled) r.e = ribbon.enabled ? 1 : 0;
  if (ribbon.style !== defaults.ribbon.style) r.s = RIBBON_STYLES.indexOf(ribbon.style);
  if (stripHash(ribbon.color) !== stripHash(defaults.ribbon.color)) r.c = stripHash(ribbon.color);
  if (ribbon.bowSize !== defaults.ribbon.bowSize) r.b = Number(ribbon.bowSize.toFixed(2));

  const c: Record<string, unknown> = {};
  if (card.enabled !== defaults.card.enabled) c.e = card.enabled ? 1 : 0;
  if (card.to !== defaults.card.to) c.t = card.to;
  if (card.message !== defaults.card.message) c.m = card.message;
  if (card.from !== defaults.card.from) c.f = card.from;
  if (stripHash(card.paperColor) !== stripHash(defaults.card.paperColor))
    c.p = stripHash(card.paperColor);
  if (card.fontStyle !== defaults.card.fontStyle) c.s = FONT_STYLES.indexOf(card.fontStyle);

  const s: Record<string, unknown> = {};
  if (scene.lighting !== defaults.scene.lighting) s.l = LIGHTINGS.indexOf(scene.lighting);
  if (scene.lightingColor && scene.lightingColor !== defaults.scene.lightingColor)
    s.lc = stripHash(scene.lightingColor);
  if (scene.sunlightIntensity !== undefined && scene.sunlightIntensity !== defaults.scene.sunlightIntensity)
    s.si = Number(scene.sunlightIntensity.toFixed(2));
  if (scene.autoRotate !== defaults.scene.autoRotate) s.a = scene.autoRotate ? 1 : 0;
  if (scene.arrangementStyle !== defaults.scene.arrangementStyle)
    s.ar = ARRANGEMENTS.indexOf(scene.arrangementStyle);
  if (scene.tightness !== defaults.scene.tightness) s.ti = Number(scene.tightness.toFixed(2));
  if (scene.stemSpread !== defaults.scene.stemSpread) s.sp = Number(scene.stemSpread.toFixed(2));
  if (scene.heightVariance !== defaults.scene.heightVariance)
    s.hv = Number(scene.heightVariance.toFixed(2));

  const payload: unknown[] = [f];
  if (Object.keys(w).length || Object.keys(r).length || Object.keys(c).length || Object.keys(s).length) {
    payload.push(w);
  }
  if (Object.keys(r).length || Object.keys(c).length || Object.keys(s).length) {
    payload.push(r);
  }
  if (Object.keys(c).length || Object.keys(s).length) {
    payload.push(c);
  }
  if (Object.keys(s).length) {
    payload.push(s);
  }

  return `2.${toBase64Url(JSON.stringify(payload))}`;
}

export interface DecodedBouquetData {
  flowers: { type: FlowerType; count: number; color: string }[];
  wrapping: WrappingSettings;
  ribbon: RibbonSettings;
  card: GreetingCardSettings;
  scene: SceneSettings;
}

/**
 * Decodes either `2.` compact base64url payloads or legacy v1 base64 JSON payloads.
 */
export function decodeShareableBouquet(
  encoded: string,
  defaults: CompactShareInput['defaults']
): DecodedBouquetData | null {
  try {
    if (encoded.startsWith('2.')) {
      const raw = JSON.parse(fromBase64Url(encoded.slice(2)));
      if (!Array.isArray(raw) || !Array.isArray(raw[0])) return null;

      const flowers = raw[0].map((tuple: [number, number, string]) => ({
        type: FLOWER_TYPES[tuple[0]] || 'rose',
        count: Number(tuple[1]) || 1,
        color: addHash(tuple[2] || 'c9184a'),
      }));

      const w = (raw[1] || {}) as Record<string, number | string>;
      const r = (raw[2] || {}) as Record<string, number | string>;
      const c = (raw[3] || {}) as Record<string, number | string>;
      const s = (raw[4] || {}) as Record<string, number | string>;

      const wType = typeof w.t === 'number' ? WRAPPING_TYPES[w.t] || defaults.wrapping.type : defaults.wrapping.type;
      const wrapping: WrappingSettings = {
        ...defaults.wrapping,
        type: wType,
        newspaperStyle:
          typeof w.n === 'number'
            ? NEWSPAPER_STYLES[w.n] || defaults.wrapping.newspaperStyle
            : defaults.wrapping.newspaperStyle,
        primaryColor: typeof w.p === 'string' ? addHash(w.p) : defaults.wrapping.primaryColor,
        accentColor: typeof w.a === 'string' ? addHash(w.a) : defaults.wrapping.accentColor,
        hasInnerLining: w.i !== undefined ? w.i === 1 : defaults.wrapping.hasInnerLining,
        hasStemWrap: w.s !== undefined ? w.s === 1 : defaults.wrapping.hasStemWrap,
        hasWater: w.w !== undefined ? w.w === 1 : defaults.wrapping.hasWater,
        roughness:
          wType === 'cellophane' || wType === 'vase_teardrop' || wType === 'vase_tall'
            ? 0.08
            : wType === 'vase_ribbed'
            ? 0.25
            : wType === 'silk'
            ? 0.4
            : 0.85,
        opacity:
          wType === 'cellophane'
            ? 0.45
            : wType === 'vase_teardrop' || wType === 'vase_tall'
            ? 0.35
            : 1.0,
      };

      const ribbon: RibbonSettings = {
        ...defaults.ribbon,
        enabled: r.e !== undefined ? r.e === 1 : defaults.ribbon.enabled,
        style:
          typeof r.s === 'number' ? RIBBON_STYLES[r.s] || defaults.ribbon.style : defaults.ribbon.style,
        color: typeof r.c === 'string' ? addHash(r.c) : defaults.ribbon.color,
        bowSize: typeof r.b === 'number' ? r.b : defaults.ribbon.bowSize,
      };

      const card: GreetingCardSettings = {
        ...defaults.card,
        enabled: c.e !== undefined ? c.e === 1 : defaults.card.enabled,
        to: typeof c.t === 'string' ? c.t : defaults.card.to,
        message: typeof c.m === 'string' ? c.m : defaults.card.message,
        from: typeof c.f === 'string' ? c.f : defaults.card.from,
        paperColor: typeof c.p === 'string' ? addHash(c.p) : defaults.card.paperColor,
        fontStyle:
          typeof c.s === 'number' ? FONT_STYLES[c.s] || defaults.card.fontStyle : defaults.card.fontStyle,
      };

      const scene: SceneSettings = {
        ...defaults.scene,
        lighting:
          typeof s.l === 'number' ? LIGHTINGS[s.l] || defaults.scene.lighting : defaults.scene.lighting,
        lightingColor: typeof s.lc === 'string' ? addHash(s.lc) : defaults.scene.lightingColor,
        sunlightIntensity: typeof s.si === 'number' ? s.si : defaults.scene.sunlightIntensity,
        autoRotate: s.a !== undefined ? s.a === 1 : defaults.scene.autoRotate,
        arrangementStyle:
          typeof s.ar === 'number'
            ? ARRANGEMENTS[s.ar] || defaults.scene.arrangementStyle
            : defaults.scene.arrangementStyle,
        tightness: typeof s.ti === 'number' ? s.ti : defaults.scene.tightness,
        stemSpread: typeof s.sp === 'number' ? s.sp : defaults.scene.stemSpread,
        heightVariance: typeof s.hv === 'number' ? s.hv : defaults.scene.heightVariance,
      };

      return { flowers, wrapping, ribbon, card, scene };
    }

    // Legacy v1 base64 JSON fallback
    const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    if (!decoded || !decoded.f) return null;
    return {
      flowers: decoded.f,
      wrapping: decoded.w || defaults.wrapping,
      ribbon: decoded.r || defaults.ribbon,
      card: decoded.c || defaults.card,
      scene: decoded.s || defaults.scene,
    };
  } catch {
    return null;
  }
}
