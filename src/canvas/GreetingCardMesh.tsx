import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useBouquetStore } from '@/store/useBouquetStore';
import { isVaseWrapping } from '@/types';
import { createCardCanvas } from '@/utils/textures';
import {
  getWrapDimensions,
  getRibbonGeometry,
  getStemBundleRadius,
  WRAP_LAPEL,
  WAIST_Y,
} from '@/utils/math';

// Card dimensions (texture aspect ≈ 1.44)
const CARD_W = 0.6;
const CARD_H = 0.42;
const CARD_T = 0.008;

export const GreetingCardMesh: React.FC = () => {
  const card = useBouquetStore((state) => state.card);
  const totalStems = useBouquetStore((state) => state.flowers.length);
  const wrappingType = useBouquetStore((state) => state.wrapping.type);
  const ribbon = useBouquetStore((state) => state.ribbon);
  const arrangementStyle = useBouquetStore((state) => state.scene.arrangementStyle);
  const tightness = useBouquetStore((state) => state.scene.tightness);
  const stemSpread = useBouquetStore((state) => state.scene.stemSpread);

  const cardTexture = useMemo(() => {
    if (typeof window === 'undefined' || !card.enabled) return null;
    const canvas = createCardCanvas(
      card.to,
      card.message,
      card.from,
      card.fontStyle,
      card.paperColor
    );
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, [card.enabled, card.to, card.message, card.from, card.fontStyle, card.paperColor]);

  if (!card.enabled) return null;

  const cardBody = (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[CARD_W, CARD_H, CARD_T]} />
      <meshStandardMaterial
        map={cardTexture || undefined}
        color={card.paperColor || '#fdfcf9'}
        roughness={0.8}
        metalness={0.02}
      />
    </mesh>
  );

  // ------------------------------------------------------------------
  // 0) VASE: card displayed in a brass florist stand beside the vase on the podium
  // ------------------------------------------------------------------
  if (isVaseWrapping(wrappingType)) {
    const bundleR = getStemBundleRadius(totalStems, arrangementStyle);
    const neckScale = Math.max(1.0, ((bundleR + stemSpread * 0.04) * 1.45 + 0.12) / 0.34);
    const standX = 0.66 * neckScale + 0.18;
    const standZ = 0.42;
    const cardScale = 0.85;

    return (
      <group position={[standX, -1.5, standZ]} rotation={[0, -0.36, 0]}>
        {/* Weighted brass base resting on podium */}
        <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.115, 0.024, 24]} />
          <meshStandardMaterial color="#c59b27" metalness={0.82} roughness={0.25} />
        </mesh>

        {/* Slender brass stand stem */}
        <mesh position={[0, 0.17, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.009, 0.32, 10]} />
          <meshStandardMaterial color="#c59b27" metalness={0.85} roughness={0.22} />
        </mesh>

        {/* Top brass clasp */}
        <mesh position={[0, 0.33, 0]} castShadow>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color="#c59b27" metalness={0.85} roughness={0.22} />
        </mesh>

        {/* Greeting card tilted slightly upward toward viewer */}
        <group position={[0, 0.33 + (CARD_H * cardScale) / 2, 0.012]} rotation={[-0.22, 0, 0]} scale={cardScale}>
          {cardBody}
        </group>
      </group>
    );
  }

  // ------------------------------------------------------------------
  // A) WRAPPED: card pinned flat against the OUTSIDE of the paper cone
  // ------------------------------------------------------------------
  if (wrappingType !== 'none') {
    const { lapelWaistRadius, lapelTopRadius } = getWrapDimensions(
      totalStems,
      tightness,
      stemSpread,
      arrangementStyle
    );
    const { bottomY, height } = WRAP_LAPEL;

    const azimuth = 0.32; // slightly right of the bow
    const isFan = arrangementStyle === 'fan';
    // In fan mode, createFanAwareConeGeometry lowers the front (+Z) rim by 0.16 * cos(azimuth),
    // which increases both the radius at a given Y and the front wall flare angle.
    const effectiveHeight = height + (isFan ? -0.16 * Math.cos(azimuth) : 0);

    // Cone surface radius at a given height (outermost lapel layer, world units)
    const radiusAt = (y: number) =>
      lapelWaistRadius + ((y - bottomY) / effectiveHeight) * (lapelTopRadius - lapelWaistRadius);

    // Slope of the paper wall (it flares outward going up)
    const slope = (lapelTopRadius - lapelWaistRadius) / effectiveHeight;
    const tilt = Math.atan(slope);

    const cardScale = totalStems <= 1 ? 0.72 : 1.0;
    const centerY = totalStems <= 1 ? (isFan ? 0.56 : 0.62) : isFan ? 0.61 : 0.68;
    const margin = 0.036 + (CARD_T * cardScale) / 2; // sits cleanly on top of the paper
    // Offset outward along the wall normal so the flat card never dips into the curved paper
    const surfaceR = radiusAt(centerY) + margin * Math.cos(tilt);

    return (
      <group rotation={[0, azimuth, 0]}>
        <group
          position={[0, centerY - margin * Math.sin(tilt), surfaceR]}
          rotation={[tilt, 0, -0.06]}
          scale={cardScale}
        >
          {cardBody}

          {/* Gold pin/clip fixing the card onto the paper */}
          <group position={[0, CARD_H / 2 - 0.02, CARD_T]}>
            <mesh castShadow>
              <boxGeometry args={[0.05, 0.1, 0.014]} />
              <meshStandardMaterial color="#c59b27" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        </group>
      </group>
    );
  }

  // ------------------------------------------------------------------
  // B) UNWRAPPED (e.g. a single rose): gift tag hanging from the ribbon knot
  // ------------------------------------------------------------------
  const isTwine = ribbon.style === 'twine';
  const { bandRadius, tubeRadius } = getRibbonGeometry(
    totalStems,
    arrangementStyle,
    false,
    isTwine
  );

  const tagScale = 0.6;
  const tagW = CARD_W * tagScale;
  const tagH = CARD_H * tagScale;

  // Tie point: ribbon knot if present, otherwise the stem bundle itself
  const tieZ = ribbon.enabled ? bandRadius + tubeRadius : bandRadius;
  const tie = new THREE.Vector3(0.0, WAIST_Y - 0.02, tieZ);

  // Tag hangs below and slightly to the side, in front of the stems
  const tagCenter = new THREE.Vector3(0.14, WAIST_Y - 0.36, tieZ + 0.14);
  const tagTop = tagCenter.clone().add(new THREE.Vector3(0, tagH / 2 - 0.02, 0.004));

  const stringCurve = new THREE.CatmullRomCurve3([
    tie,
    new THREE.Vector3(
      (tie.x + tagTop.x) / 2,
      (tie.y + tagTop.y) / 2 - 0.02,
      (tie.z + tagTop.z) / 2 + 0.02
    ),
    tagTop,
  ]);

  return (
    <group>
      {/* Thin string from the knot to the tag */}
      <mesh castShadow>
        <tubeGeometry args={[stringCurve, 16, 0.004, 5, false]} />
        <meshStandardMaterial color={ribbon.enabled ? ribbon.color : '#8d734a'} roughness={0.9} />
      </mesh>

      <group position={tagCenter.toArray()} rotation={[-0.08, -0.18, 0.06]} scale={tagScale}>
        {cardBody}
        {/* Punched eyelet where the string goes through */}
        <mesh position={[0, CARD_H / 2 - 0.035, CARD_T / 2 + 0.001]}>
          <torusGeometry args={[0.018, 0.006, 8, 16]} />
          <meshStandardMaterial color="#c59b27" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
};
