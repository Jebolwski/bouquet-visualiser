import * as THREE from 'three';
import { ArrangementStyle, WrappingType, isVaseWrapping } from '@/types';

export interface FlowerTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  stemCurvePoints: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
  stemLength: number;
}

// Golden angle in radians: ~137.507764 degrees
export const GOLDEN_ANGLE = 2.39996323;

/**
 * Pseudo-random seeded hash for stable procedural jitter per flower
 */
export function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9999.123) * 10000;
  return x - Math.floor(x);
}

/**
 * Calculates 3D position, orientation, and stem spline for each flower
 * using florist Dutch spiral / Vogel's phyllotaxis packing algorithm.
 */
export function calculateBouquetLayout(
  index: number,
  totalCount: number,
  arrangementStyle: ArrangementStyle = 'dome',
  tightness: number = 1.0,
  stemSpread: number = 1.0,
  heightVariance: number = 0.15,
  wrappingType: WrappingType = 'newspaper'
): FlowerTransform {
  const isVase = isVaseWrapping(wrappingType);
  const vaseHeadDrop =
    wrappingType === 'vase_teardrop'
      ? 1.32
      : wrappingType === 'vase_ribbed'
      ? 1.38
      : wrappingType === 'vase_tall'
      ? 1.08
      : 0;

  if (totalCount === 1) {
    const headY = 1.85 - vaseHeadDrop;
    // Single flower sitting upright in center
    return {
      position: [0, headY, 0],
      rotation: [0.1, 0, 0],
      stemCurvePoints: [
        new THREE.Vector3(0, -1.45, 0),
        new THREE.Vector3(0, isVase ? -0.15 : 0.05, 0),
        new THREE.Vector3(0, headY - 0.35, 0),
        new THREE.Vector3(0, headY - 0.05, 0),
      ],
      stemLength: headY + 1.4,
    };
  }

  // Golden angle phyllotaxis
  const theta = index * GOLDEN_ANGLE;
  const normalizedRadius = Math.sqrt((index + 0.5) / totalCount);

  // Compact florist bouquet radius (tight, cohesive dome)
  const maxRadius = (0.45 + Math.sqrt(totalCount) * 0.066) * tightness;
  const radius = normalizedRadius * maxRadius;

  let x = radius * Math.cos(theta);
  let z = radius * Math.sin(theta);
  let y = 1.95;

  const randA = pseudoRandom(index * 13 + 1);
  const randB = pseudoRandom(index * 29 + 7);
  const randC = pseudoRandom(index * 47 + 19);

  // Apply arrangement style logic (flowers always clear the paper rim so any overflow spills over the TOP)
  if (arrangementStyle === 'dome') {
    // Symmetrical spherical cap dome - gentle drop so perimeter flowers crest above wrap rim
    const domeDrop = Math.pow(normalizedRadius, 1.5) * 0.22;
    y = Math.max(1.76, 2.12 - domeDrop + (randA - 0.5) * heightVariance);
  } else if (arrangementStyle === 'spiral') {
    // Gradual spiral staircase descending from center
    const spiralDrop = (index / totalCount) * 0.28;
    y = Math.max(1.74, 2.14 - spiralDrop + (randA - 0.5) * heightVariance);
  } else if (arrangementStyle === 'wild_meadow') {
    // Airy cottage garden with spontaneous taller pops
    const isTallSpur = randB > 0.65;
    const extraHeight = isTallSpur ? 0.22 : (randA - 0.5) * 0.14;
    const domeDrop = Math.pow(normalizedRadius, 1.4) * 0.22;
    y = Math.max(1.74, 2.08 - domeDrop + extraHeight);
    x += (randB - 0.5) * 0.08;
    z += (randC - 0.5) * 0.08;
  } else if (arrangementStyle === 'fan') {
    // Katmanlı Asil Sunum Yelpazesi (Tiered Presentation Fan)
    // 4 stepped tiers from back to front, all facing proudly forward!
    const t = index / totalCount;
    let tier = 0;
    let tierT = 0;

    if (t < 0.28) {
      // Tier 0: Back row (tallest)
      tier = 0;
      tierT = t / 0.28;
    } else if (t < 0.56) {
      // Tier 1: Mid-back row
      tier = 1;
      tierT = (t - 0.28) / 0.28;
    } else if (t < 0.80) {
      // Tier 2: Mid-front row
      tier = 2;
      tierT = (t - 0.56) / 0.24;
    } else {
      // Tier 3: Front cascade row (lowest, yet clears the front/side wrap rim)
      tier = 3;
      tierT = (t - 0.80) / 0.20;
    }

    // Arc spread across X
    const tierSpreadX = [0.62, 0.52, 0.44, 0.34][tier] * tightness;
    const tierAngle = (tierT - 0.5) * Math.PI * 0.82;
    x = Math.sin(tierAngle) * tierSpreadX + (randB - 0.5) * 0.05;

    // Depth Z from back to front (centered around Z=0)
    const tierZ = [-0.18, -0.04, 0.10, 0.22][tier];
    z = tierZ + (randC - 0.5) * 0.06;

    // Height Y: Stepped amphitheater elevated so outer/front blooms spill over the TOP rim
    const tierY = [2.32, 2.08, 1.88, 1.70][tier];
    const archArch = -Math.abs(Math.sin(tierAngle)) * 0.10;
    y = Math.max(1.62, tierY + archArch + (randA - 0.5) * heightVariance);
  }

  // Tie point at bouquet waist (cinched narrow waist)
  const waistY = 0.05;
  const waistSpiralRadius = arrangementStyle === 'fan' ? 0.04 : 0.07 * (index / totalCount);
  const waistAngle = arrangementStyle === 'fan' ? theta : theta + 0.4;
  const waistX = Math.cos(waistAngle) * waistSpiralRadius;
  const waistZ = Math.sin(waistAngle) * waistSpiralRadius;

  // Bottom stem cut end (Dutch spiral flare)
  // Clamp spread so stems stay neatly inside vases and inside the lower paper skirt
  const bottomY = -1.45;
  const rawBottomSpread = (0.20 + normalizedRadius * 0.24) * stemSpread;
  const maxVaseBottomSpread =
    wrappingType === 'vase_teardrop' ? 0.34 : 0.30;
  const bottomSpread = isVase
    ? Math.min(rawBottomSpread * 0.72, maxVaseBottomSpread)
    : rawBottomSpread;
  const bottomTheta = arrangementStyle === 'fan' ? theta + Math.PI : theta + Math.PI * 0.85;
  const bottomX = Math.cos(bottomTheta) * bottomSpread;
  const bottomZ = Math.sin(bottomTheta) * bottomSpread;

  // Lower flower heads when placed in a vase so blooms sit naturally above the rim
  y -= vaseHeadDrop;

  // Neck point just below flower head (stays safely inside the collar opening)
  const neckY = isVase ? Math.max(-0.05, y - 0.18) : Math.max(1.38, y - 0.22);
  const neckX = x * 0.88;
  const neckZ = z * 0.88;

  // Catmull-Rom stem curve points
  const pBottom = new THREE.Vector3(bottomX, bottomY, bottomZ);
  const pWaist = new THREE.Vector3(waistX, waistY, waistZ);
  const pNeck = new THREE.Vector3(neckX, neckY, neckZ);
  const pHead = new THREE.Vector3(x, y, z);

  // Flower head orientation:
  let rotX = 0;
  let rotY = 0;
  let rotZ = 0;

  if (arrangementStyle === 'fan') {
    // In presentation fan mode: ALL flowers face FORWARD towards the viewer!
    // Slight pitch up towards camera lens (22 to 32 degrees)
    rotX = 0.36 + (randB - 0.5) * 0.08;
    // Radiating fan yaw
    rotY = (x / 0.7) * 0.26 + (randA - 0.5) * 0.08;
    // Arch roll
    rotZ = -(x / 0.7) * 0.20 + (randC - 0.5) * 0.08;
  } else {
    // Radial dome/spiral outward tilt
    const radialDist = Math.sqrt(x * x + z * z);
    const maxTilt = 0.36; // ~21 degrees gentle upward-outward tilt so blooms crest over top rim
    const tiltFactor = Math.min(1.0, radialDist / (maxRadius + 0.001));
    const tiltAngle = tiltFactor * maxTilt;
    const azimuth = Math.atan2(x, z);

    rotX = Math.cos(azimuth) * tiltAngle + (randB - 0.5) * 0.08;
    rotZ = -Math.sin(azimuth) * tiltAngle + (randC - 0.5) * 0.08;
    rotY = azimuth + (randA - 0.5) * 0.18;
  }

  return {
    position: [x, y, z],
    rotation: [rotX, rotY, rotZ],
    stemCurvePoints: [pBottom, pWaist, pNeck, pHead],
    stemLength: pBottom.distanceTo(pWaist) + pWaist.distanceTo(pHead),
  };
}

export interface WrapDimensions {
  waistRadius: number;
  topRadius: number;
  liningTopRadius: number;
  liningWaistRadius: number;
  lapelTopRadius: number;
  lapelWaistRadius: number;
  skirtBottomRadius: number;
}

/**
 * Dynamic paper-wrapping dimensions fitted to the actual bouquet envelope
 * (stem count, diameter/tightness, stem spread, and arrangement style).
 */
export function getWrapDimensions(
  totalStems: number,
  tightness: number = 1.0,
  stemSpread: number = 1.0,
  arrangementStyle: ArrangementStyle = 'dome'
): WrapDimensions {
  if (totalStems <= 1) {
    const waistRadius = 0.11;
    const topRadius = 0.36;
    return {
      waistRadius,
      topRadius,
      liningTopRadius: topRadius - 0.02,
      liningWaistRadius: waistRadius - 0.006,
      lapelTopRadius: topRadius + 0.02,
      lapelWaistRadius: waistRadius + 0.008,
      skirtBottomRadius: 0.22,
    };
  }

  // Match the outermost flower center radius from calculateBouquetLayout
  let maxFlowerRadius: number;
  if (arrangementStyle === 'fan') {
    maxFlowerRadius = 0.65 * tightness;
  } else {
    const meadowExtra = arrangementStyle === 'wild_meadow' ? 0.06 : 0;
    maxFlowerRadius = (0.45 + Math.sqrt(totalStems) * 0.066) * tightness + meadowExtra;
  }

  // Waist hugs the stem bundle tightly
  const waistRadius = Math.min(0.26, 0.14 + Math.sqrt(totalStems) * 0.018);

  // Top rim hugs the outer flower/foliage perimeter at y = 1.40 without leaving an empty bowl gap
  const topRadius = Math.max(0.48, maxFlowerRadius * 0.85 + 0.23);

  // Lower skirt adapts to stem spread and always stays wider than max bottomSpread (0.44 * stemSpread)
  const skirtBottomRadius = Math.max(
    0.34,
    0.44 * stemSpread + 0.08 + Math.sqrt(totalStems) * 0.012
  );

  return {
    waistRadius,
    topRadius,
    liningTopRadius: topRadius - 0.025,
    liningWaistRadius: waistRadius - 0.008,
    lapelTopRadius: topRadius + 0.025,
    lapelWaistRadius: waistRadius + 0.01,
    skirtBottomRadius,
  };
}

/**
 * Shared horizontal scale factor of the paper wrapping (derived from waist ratio for bow scaling).
 */
export function getWrapScaleFactor(totalStems: number): number {
  return Math.max(0.85, Math.min(1.32, 0.76 + Math.sqrt(Math.max(1, totalStems)) * 0.115));
}

/**
 * Approximate radius of the bare stem bundle at the tie point (waist, y = 0.05),
 * matching the waist spiral used in calculateBouquetLayout.
 */
export function getStemBundleRadius(totalStems: number, arrangementStyle: ArrangementStyle): number {
  const stemThickness = 0.026;
  if (totalStems <= 1) return stemThickness;
  if (arrangementStyle === 'fan') return 0.04 + stemThickness;
  return 0.07 * ((totalStems - 1) / totalStems) + stemThickness;
}

/** Front diagonal lapel vertical bounds (outermost paper layer) — see WrappingMesh. */
export const WRAP_LAPEL = {
  bottomY: 0.05,
  height: 1.28,
};

/** Waist tie height shared by stems, ribbon and card. */
export const WAIST_Y = 0.04;

/**
 * Ribbon band radius + bow scale so the ribbon always hugs whatever it is tied around:
 * the paper waist when wrapped, or the bare stem bundle when unwrapped (e.g. a single rose).
 */
export function getRibbonGeometry(
  totalStems: number,
  arrangementStyle: ArrangementStyle,
  isWrapped: boolean,
  isTwine: boolean,
  tightness: number = 1.0,
  stemSpread: number = 1.0,
  hasStemWrap: boolean = true
): { bandRadius: number; tubeRadius: number; bowScale: number; skirtSlope: number } {
  const tubeRadius = isTwine ? 0.016 : 0.032;
  if (isWrapped) {
    const { waistRadius, lapelWaistRadius, skirtBottomRadius } = getWrapDimensions(
      totalStems,
      tightness,
      stemSpread,
      arrangementStyle
    );
    // Outermost paper surface at the waist (lapel layer sits on top of the main cone)
    const outerWaist = Math.max(waistRadius, lapelWaistRadius);
    const bowScale = Math.max(0.65, Math.min(1.25, outerWaist / 0.24));
    // How fast the outermost lower-skirt layer flares outward per unit of depth
    const skirtSlope = hasStemWrap
      ? Math.max(
          (skirtBottomRadius - waistRadius) / 1.39,
          (skirtBottomRadius + 0.015 - lapelWaistRadius) / 1.31
        )
      : 0;
    // Band sits fully OUTSIDE the paper (inner edge of the tube just touches it)
    return { bandRadius: outerWaist + tubeRadius + 0.004, tubeRadius, bowScale, skirtSlope };
  }
  const bundleR = getStemBundleRadius(totalStems, arrangementStyle);
  const thinTube = tubeRadius * 0.6;
  return {
    bandRadius: bundleR + thinTube * 0.8,
    tubeRadius: thinTube,
    bowScale: Math.max(0.5, Math.min(0.9, 0.42 + bundleR * 5)),
    skirtSlope: 0,
  };
}
