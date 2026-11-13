import React, { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useBouquetStore } from '@/store/useBouquetStore';
import { getNewspaperTexture, getKraftTexture } from '@/utils/textures';
import { getWrapDimensions, getStemBundleRadius } from '@/utils/math';

/**
 * Builds an upper wrapping cone geometry; when `isFan` is true, the back (-Z)
 * rim rises gracefully behind the tall back flowers while the front (+Z) dips
 * slightly lower, keeping the waist level.
 */
function createFanAwareConeGeometry(
  topR: number,
  bottomR: number,
  height: number,
  radialSegments: number,
  thetaStart: number,
  thetaLength: number,
  isFan: boolean,
  rotY: number = 0
): THREE.CylinderGeometry {
  const geo = new THREE.CylinderGeometry(
    topR,
    bottomR,
    height,
    radialSegments,
    isFan ? 6 : 1,
    true,
    thetaStart,
    thetaLength
  );

  if (!isFan) return geo;

  const pos = geo.attributes.position;
  const sinY = Math.sin(rotY);
  const cosY = Math.cos(rotY);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const t = (y + height / 2) / height; // 0 at waist, 1 at top rim
    if (t <= 0.001) continue;

    // World Z after optional Y rotation of the mesh group
    const worldZ = -x * sinY + z * cosY;
    const rAtT = bottomR + (topR - bottomR) * t;
    const backFactor = rAtT > 0.001 ? THREE.MathUtils.clamp(-worldZ / rAtT, -1, 1) : 0;

    // Smoothly lift the back (+0.62) and dip the front (-0.16)
    const deltaTop = backFactor >= 0 ? backFactor * 0.62 : backFactor * 0.16;
    pos.setY(i, y + t * deltaTop);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export const WrappingMesh: React.FC = () => {
  const wrapping = useBouquetStore((state) => state.wrapping);
  const totalStems = useBouquetStore((state) => state.flowers.length);
  const arrangementStyle = useBouquetStore((state) => state.scene.arrangementStyle);
  const tightness = useBouquetStore((state) => state.scene.tightness);
  const stemSpread = useBouquetStore((state) => state.scene.stemSpread);
  const ribbonEnabled = useBouquetStore((state) => state.ribbon.enabled);
  const [textureKey, setTextureKey] = useState<number>(0);

  // Dynamic sizing fitted to actual bouquet envelope (count, diameter, stem spread, style)
  const {
    waistRadius,
    topRadius,
    liningTopRadius,
    liningWaistRadius,
    lapelTopRadius,
    lapelWaistRadius,
    skirtBottomRadius,
  } = getWrapDimensions(totalStems, tightness, stemSpread, arrangementStyle);

  const isFan = arrangementStyle === 'fan';

  const upperConeGeo = useMemo(
    () => createFanAwareConeGeometry(topRadius, waistRadius, 1.36, 48, 0, Math.PI * 2, isFan, 0),
    [topRadius, waistRadius, isFan]
  );

  const upperLiningGeo = useMemo(
    () =>
      createFanAwareConeGeometry(
        liningTopRadius,
        liningWaistRadius,
        1.4,
        48,
        0,
        Math.PI * 2,
        isFan,
        0
      ),
    [liningTopRadius, liningWaistRadius, isFan]
  );

  const upperLapelGeo = useMemo(
    () =>
      createFanAwareConeGeometry(
        lapelTopRadius,
        lapelWaistRadius,
        1.28,
        32,
        -Math.PI * 0.35,
        Math.PI * 0.95,
        isFan,
        0.45
      ),
    [lapelTopRadius, lapelWaistRadius, isFan]
  );

  useEffect(() => () => upperConeGeo.dispose(), [upperConeGeo]);
  useEffect(() => () => upperLiningGeo.dispose(), [upperLiningGeo]);
  useEffect(() => () => upperLapelGeo.dispose(), [upperLapelGeo]);

  // Dynamic texture generation
  const activeTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;

    if (wrapping.type === 'newspaper') {
      return getNewspaperTexture(wrapping.newspaperStyle);
    } else if (wrapping.type === 'kraft') {
      return getKraftTexture(wrapping.primaryColor);
    }
    return null;
  }, [wrapping.type, wrapping.newspaperStyle, wrapping.primaryColor, textureKey]);

  useEffect(() => {
    setTextureKey((k) => k + 1);
  }, []);

  if (wrapping.type === 'none') {
    // Natural raffia binding hugging the actual stem bundle (no floating ring around a single stem)
    const bundleR = getStemBundleRadius(totalStems, arrangementStyle);
    // If a ribbon is tied, the ribbon itself is the binding
    if (ribbonEnabled) return null;
    return (
      <group position={[0, 0.05, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[bundleR + 0.012, bundleR + 0.012, 0.05, 24, 1, true]} />
          <meshStandardMaterial color="#8d734a" roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  // Cellophane Physical Material
  const renderCellophaneMaterial = () => (
    <meshPhysicalMaterial
      color={wrapping.primaryColor || '#ffffff'}
      roughness={0.06}
      transmission={0.72}
      thickness={0.25}
      ior={1.48}
      transparent
      opacity={0.35}
      side={THREE.DoubleSide}
    />
  );

  return (
    <group position={[0, 0, 0]}>
      <group>
        {/* ======================================================== */}
        {/* 1. ÜST AMBALAJ (Dynamic Florist Paper Collar)            */}
        {/* Extends from waist cinch y=0.04 up to y=1.40 (height 1.36) */}
        {/* ======================================================== */}
        <mesh position={[0, 0.72, 0]} geometry={upperConeGeo} castShadow receiveShadow>
          {wrapping.type === 'newspaper' ? (
            <meshStandardMaterial
              map={activeTexture}
              roughness={0.85}
              metalness={0.02}
              side={THREE.DoubleSide}
            />
          ) : wrapping.type === 'kraft' ? (
            <meshStandardMaterial
              map={activeTexture}
              color={wrapping.primaryColor}
              roughness={0.9}
              metalness={0.02}
              side={THREE.DoubleSide}
            />
          ) : wrapping.type === 'cellophane' ? (
            renderCellophaneMaterial()
          ) : (
            // Silk / Satin
            <meshStandardMaterial
              color={wrapping.primaryColor}
              roughness={0.35}
              metalness={0.12}
              side={THREE.DoubleSide}
            />
          )}
        </mesh>

        {/* Üst İç Astar (Pelur Kağıdı - Sits strictly inside, peeking out at top) */}
        {wrapping.hasInnerLining && wrapping.type !== 'cellophane' && (
          <mesh position={[0, 0.75, 0]} geometry={upperLiningGeo} castShadow receiveShadow>
            <meshStandardMaterial
              color={wrapping.accentColor || '#ffffff'}
              roughness={0.92}
              metalness={0.01}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Üst Çapraz Katlama Kanadı (Front Diagonal Fold Lapel) */}
        {wrapping.type !== 'cellophane' && (
          <group position={[0, 0.69, 0]} rotation={[0, 0.45, 0]}>
            <mesh geometry={upperLapelGeo} castShadow receiveShadow>
              {wrapping.type === 'newspaper' ? (
                <meshStandardMaterial
                  map={activeTexture}
                  roughness={0.85}
                  side={THREE.DoubleSide}
                />
              ) : (
                <meshStandardMaterial
                  color={wrapping.primaryColor}
                  roughness={wrapping.roughness}
                  side={THREE.DoubleSide}
                />
              )}
            </mesh>
          </group>
        )}

        {/* ======================================================== */}
        {/* 2. ALT AMBALAJ / ETEK SARIMI (Lower Skirt Stem Wrap)      */}
        {/* Extends from waist y=0.04 down to y=-1.35 (height 1.39)  */}
        {/* ======================================================== */}
        {wrapping.hasStemWrap && (
          <group position={[0, -0.65, 0]}>
            {/* Ana Dış Etek Konisi */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry
                args={[waistRadius, skirtBottomRadius, 1.39, 48, 1, true, 0, Math.PI * 2]}
              />
              {wrapping.type === 'newspaper' ? (
                <meshStandardMaterial
                  map={activeTexture}
                  roughness={0.85}
                  metalness={0.02}
                  side={THREE.DoubleSide}
                />
              ) : wrapping.type === 'kraft' ? (
                <meshStandardMaterial
                  map={activeTexture}
                  color={wrapping.primaryColor}
                  roughness={0.9}
                  metalness={0.02}
                  side={THREE.DoubleSide}
                />
              ) : wrapping.type === 'cellophane' ? (
                renderCellophaneMaterial()
              ) : (
                <meshStandardMaterial
                  color={wrapping.primaryColor}
                  roughness={0.35}
                  metalness={0.12}
                  side={THREE.DoubleSide}
                />
              )}
            </mesh>

            {/* Alt İç Astar Katmanı */}
            {wrapping.hasInnerLining && wrapping.type !== 'cellophane' && (
              <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
                <cylinderGeometry
                  args={[liningWaistRadius, skirtBottomRadius - 0.025, 1.35, 36, 1, true, -Math.PI * 0.4, Math.PI * 1.3]}
                />
                <meshStandardMaterial
                  color={wrapping.accentColor || '#ffffff'}
                  roughness={0.92}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Ön Dökümlü Pile Katlama */}
            {wrapping.type !== 'cellophane' && (
              <group position={[0, -0.04, 0]} rotation={[0, 0.35, 0]}>
                <mesh castShadow receiveShadow>
                  <cylinderGeometry
                    args={[lapelWaistRadius, skirtBottomRadius + 0.015, 1.31, 28, 1, true, -Math.PI * 0.28, Math.PI * 0.75]}
                  />
                  {wrapping.type === 'newspaper' ? (
                    <meshStandardMaterial
                      map={activeTexture}
                      roughness={0.85}
                      side={THREE.DoubleSide}
                    />
                  ) : (
                    <meshStandardMaterial
                      color={wrapping.primaryColor}
                      roughness={wrapping.roughness}
                      side={THREE.DoubleSide}
                    />
                  )}
                </mesh>
              </group>
            )}
          </group>
        )}
      </group>
    </group>
  );
};
