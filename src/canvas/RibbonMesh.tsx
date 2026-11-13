import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useBouquetStore } from '@/store/useBouquetStore';
import { isVaseWrapping } from '@/types';
import { getRibbonGeometry, WAIST_Y } from '@/utils/math';

export const RibbonMesh: React.FC = () => {
  const ribbon = useBouquetStore((state) => state.ribbon);
  const totalStems = useBouquetStore((state) => state.flowers.length);
  const wrappingType = useBouquetStore((state) => state.wrapping.type);
  const hasStemWrap = useBouquetStore((state) => state.wrapping.hasStemWrap);
  const arrangementStyle = useBouquetStore((state) => state.scene.arrangementStyle);
  const tightness = useBouquetStore((state) => state.scene.tightness);
  const stemSpread = useBouquetStore((state) => state.scene.stemSpread);

  const bowScale = ribbon.bowSize * 1.15;
  const isWrapped = wrappingType !== 'none';

  const isTwine = ribbon.style === 'twine';
  const isVelvet = ribbon.style === 'velvet';
  const roughness = isTwine ? 0.92 : isVelvet ? 0.75 : 0.28;
  const metalness = isTwine ? 0.0 : isVelvet ? 0.05 : 0.18;

  // Ribbon hugs the paper waist when wrapped, or the bare stem bundle otherwise
  const { bandRadius, tubeRadius, bowScale: s, skirtSlope } = getRibbonGeometry(
    totalStems,
    arrangementStyle,
    isWrapped,
    isTwine,
    tightness,
    stemSpread,
    hasStemWrap
  );

  // Radius of the surface the ribbon is tied around (outermost paper, or the stem bundle)
  const surfaceR = isWrapped ? bandRadius - tubeRadius - 0.004 : bandRadius - tubeRadius * 0.8;

  // Knot sits fully outside that surface
  const knotRadius = isTwine ? 0.042 : 0.058;
  const knotZ = surfaceR + knotRadius * s + 0.006;

  // In the bow's local (scaled) space, the paper surface below the knot is at:
  //   z = skirtSlope * (-y) - gap
  const gap = (knotZ - surfaceR) / s;
  // Tilt the loops so they lie parallel to the flaring lower skirt
  const loopTilt = -Math.atan(skirtSlope);

  const ribbonWidth = isTwine ? 0.014 : 0.024;

  const loopLeftCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, -0.02, 0.02),
        new THREE.Vector3(-0.09 * bowScale, -0.03 * bowScale, 0.07 * bowScale),
        new THREE.Vector3(-0.2 * bowScale, -0.1 * bowScale, 0.08 * bowScale),
        new THREE.Vector3(-0.24 * bowScale, -0.22 * bowScale, 0.06 * bowScale),
        new THREE.Vector3(-0.16 * bowScale, -0.26 * bowScale, 0.04 * bowScale),
        new THREE.Vector3(-0.05 * bowScale, -0.14 * bowScale, 0.03 * bowScale),
        new THREE.Vector3(0, -0.02, 0.02),
      ],
      true
    );
  }, [bowScale]);

  const loopRightCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, -0.02, 0.02),
        new THREE.Vector3(0.09 * bowScale, -0.03 * bowScale, 0.07 * bowScale),
        new THREE.Vector3(0.2 * bowScale, -0.1 * bowScale, 0.08 * bowScale),
        new THREE.Vector3(0.24 * bowScale, -0.22 * bowScale, 0.06 * bowScale),
        new THREE.Vector3(0.16 * bowScale, -0.26 * bowScale, 0.04 * bowScale),
        new THREE.Vector3(0.05 * bowScale, -0.14 * bowScale, 0.03 * bowScale),
        new THREE.Vector3(0, -0.02, 0.02),
      ],
      true
    );
  }, [bowScale]);

  // Streamers drape down ON the skirt surface (always just outside it, never through it)
  const streamerCurves = useMemo(() => {
    const restOn = ribbonWidth + 0.006; // tube radius + tiny air gap
    const zAt = (y: number) => Math.max(skirtSlope * -y - gap + restOn, -gap + restOn);
    const make = (side: number, xs: number[], ys: number[]) =>
      new THREE.CatmullRomCurve3(
        ys.map((y, i) => {
          // first point tucks under the knot
          const z = i === 0 ? 0.0 : zAt(y);
          return new THREE.Vector3(side * xs[i], y, z);
        })
      );
    return {
      left: make(-1, [0.02, 0.08 * bowScale, 0.14 * bowScale, 0.1 * bowScale], [-0.04, -0.32, -0.68, -1.05]),
      right: make(1, [0.02, 0.09 * bowScale, 0.16 * bowScale, 0.12 * bowScale], [-0.04, -0.3, -0.65, -1.02]),
    };
  }, [bowScale, skirtSlope, gap, ribbonWidth]);

  if (!ribbon.enabled || isVaseWrapping(wrappingType)) return null;

  const material = (
    <meshStandardMaterial
      color={ribbon.color}
      roughness={roughness}
      metalness={metalness}
      side={THREE.DoubleSide}
    />
  );

  return (
    <group position={[0, WAIST_Y, 0]}>
      {/* 1. Cinched Waist Ribbon Band — horizontal ring wrapping around the waist */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, 1, isTwine ? 1 : 0.45]}
        castShadow
        receiveShadow
      >
        <torusGeometry args={[bandRadius, tubeRadius, 12, 64]} />
        {material}
      </mesh>

      {/* 2. Bow Knot & Loops assembly at the front of waist */}
      <group position={[0, 0, knotZ]} scale={s}>
        {/* Center Knot wrap */}
        <mesh castShadow>
          <sphereGeometry args={[knotRadius, 16, 16]} />
          {material}
        </mesh>

        {/* Loops, tilted to follow the skirt's outward flare */}
        <group rotation={[loopTilt, 0, 0]}>
          <mesh castShadow scale={[1, 1, isTwine ? 1 : 0.45]}>
            <tubeGeometry args={[loopLeftCurve, 28, ribbonWidth, 8, true]} />
            {material}
          </mesh>
          <mesh castShadow scale={[1, 1, isTwine ? 1 : 0.45]}>
            <tubeGeometry args={[loopRightCurve, 28, ribbonWidth, 8, true]} />
            {material}
          </mesh>
        </group>

        {/* Hanging streamers resting on the skirt */}
        <mesh castShadow>
          <tubeGeometry args={[streamerCurves.left, 32, ribbonWidth * (isTwine ? 1 : 0.75), 6, false]} />
          {material}
        </mesh>
        <mesh castShadow>
          <tubeGeometry args={[streamerCurves.right, 32, ribbonWidth * (isTwine ? 1 : 0.75), 6, false]} />
          {material}
        </mesh>
      </group>
    </group>
  );
};
