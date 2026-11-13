import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useBouquetStore } from '@/store/useBouquetStore';
import { isVaseWrapping } from '@/types';
import { getStemBundleRadius } from '@/utils/math';

const PODIUM_Y = -1.5; // Top surface of podium in BouquetArrangement local space
const BASE_THICKNESS = 0.045;

interface VaseProfilePoint {
  y: number; // height above PODIUM_Y (0 .. height)
  r: number; // outer radius
}

/**
 * Samples a smooth Catmull-Rom spline along (r, y) profile points and builds
 * a double-walled LatheGeometry (outer wall -> rounded rim -> inner wall -> inner floor)
 * plus a matching inner water volume geometry up to `waterHeightRatio`.
 */
function buildGlassVaseAndWater(
  profilePoints: VaseProfilePoint[],
  wallThickness: number,
  waterHeightRatio: number
): {
  vaseGeo: THREE.BufferGeometry;
  waterSideGeo: THREE.BufferGeometry;
  waterTopGeo: THREE.BufferGeometry;
  waterTopY: number;
} {
  const curvePts = profilePoints.map((p) => new THREE.Vector2(p.r, p.y));
  const spline = new THREE.SplineCurve(curvePts);
  const samples = 44;
  const outer = spline.getPoints(samples);

  const lathePts: THREE.Vector2[] = [];
  // Outer base center -> outer bottom edge -> outer wall up to rim
  lathePts.push(new THREE.Vector2(0, 0));
  for (const pt of outer) {
    lathePts.push(new THREE.Vector2(Math.max(0.02, pt.x), pt.y));
  }

  // Rounded lip at top rim
  const topPt = outer[outer.length - 1];
  const innerTopR = Math.max(0.04, topPt.x - wallThickness);
  lathePts.push(new THREE.Vector2((topPt.x + innerTopR) * 0.5, topPt.y + wallThickness * 0.35));

  // Inner wall descending down to thick glass base
  const innerSamples: THREE.Vector2[] = [];
  for (let i = outer.length - 1; i >= 0; i--) {
    const pt = outer[i];
    if (pt.y < BASE_THICKNESS) continue;
    const innerR = Math.max(0.04, pt.x - wallThickness);
    innerSamples.push(new THREE.Vector2(innerR, pt.y));
  }
  lathePts.push(...innerSamples);
  lathePts.push(new THREE.Vector2(0, BASE_THICKNESS));

  const vaseGeo = new THREE.LatheGeometry(lathePts, 56);
  vaseGeo.computeVertexNormals();

  // Water volume strictly inside the inner wall from BASE_THICKNESS up to waterTopY
  const maxHeight = outer[outer.length - 1].y;
  const waterTopY = BASE_THICKNESS + (maxHeight - BASE_THICKNESS) * waterHeightRatio;
  const waterPts: THREE.Vector2[] = [new THREE.Vector2(0, BASE_THICKNESS + 0.004)];

  for (const pt of outer) {
    if (pt.y <= BASE_THICKNESS + 0.004) continue;
    if (pt.y >= waterTopY) break;
    waterPts.push(
      new THREE.Vector2(Math.max(0.03, pt.x - wallThickness - 0.008), pt.y)
    );
  }

  // Interpolate exact radius at waterTopY
  const topRadius = interpolateRadiusAtY(outer, waterTopY) - wallThickness - 0.008;
  waterPts.push(new THREE.Vector2(Math.max(0.03, topRadius), waterTopY));

  const waterSideGeo = new THREE.LatheGeometry(waterPts, 48);
  waterSideGeo.computeVertexNormals();

  const waterTopGeo = new THREE.CircleGeometry(Math.max(0.03, topRadius), 48);
  waterTopGeo.rotateX(-Math.PI / 2);

  return { vaseGeo, waterSideGeo, waterTopGeo, waterTopY };
}

function interpolateRadiusAtY(pts: THREE.Vector2[], targetY: number): number {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].y >= targetY) {
      const a = pts[i - 1];
      const b = pts[i];
      const t = (targetY - a.y) / Math.max(1e-5, b.y - a.y);
      return THREE.MathUtils.lerp(a.x, b.x, t);
    }
  }
  return pts[pts.length - 1].x;
}

/**
 * Builds a fluted/ribbed metallic or ceramic urn vase with 24 vertical ribs,
 * flared collar rim, and matching internal water surface.
 */
function buildRibbedVaseAndWater(
  profilePoints: VaseProfilePoint[],
  wallThickness: number,
  waterHeightRatio: number
): {
  vaseGeo: THREE.BufferGeometry;
  waterSideGeo: THREE.BufferGeometry;
  waterTopGeo: THREE.BufferGeometry;
  waterTopY: number;
} {
  const curvePts = profilePoints.map((p) => new THREE.Vector2(p.r, p.y));
  const spline = new THREE.SplineCurve(curvePts);
  const vSegs = 40;
  const uSegs = 96;
  const outer = spline.getPoints(vSegs);
  const ribCount = 24;

  // Build ribbed outer + smooth inner wall mesh
  const ringPoints: { r: number; y: number; ribAmp: number }[] = [];
  for (let i = 0; i < outer.length; i++) {
    const t = i / (outer.length - 1);
    // Ribs strongest on the belly, fading cleanly at foot and lip
    const ribFade = Math.sin(Math.pow(t, 0.85) * Math.PI);
    ringPoints.push({ r: outer[i].x, y: outer[i].y, ribAmp: 0.022 * ribFade });
  }
  // Rim lip + inner wall down to floor
  const topPt = outer[outer.length - 1];
  ringPoints.push({
    r: Math.max(0.05, topPt.x - wallThickness * 0.5),
    y: topPt.y + 0.014,
    ribAmp: 0,
  });
  for (let i = outer.length - 1; i >= 0; i--) {
    if (outer[i].y < BASE_THICKNESS) continue;
    ringPoints.push({
      r: Math.max(0.05, outer[i].x - wallThickness),
      y: outer[i].y,
      ribAmp: 0,
    });
  }
  ringPoints.push({ r: 0.001, y: BASE_THICKNESS, ribAmp: 0 });

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv < ringPoints.length; iv++) {
    const rp = ringPoints[iv];
    const vCoord = iv / (ringPoints.length - 1);
    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs;
      const theta = u * Math.PI * 2;
      const rib = rp.ribAmp > 0 ? Math.cos(theta * ribCount) * rp.ribAmp : 0;
      const r = Math.max(0.001, rp.r + rib);
      positions.push(Math.cos(theta) * r, rp.y, Math.sin(theta) * r);
      uvs.push(u, vCoord);
    }
  }

  const stride = uSegs + 1;
  for (let iv = 0; iv < ringPoints.length - 1; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = (iv + 1) * stride + iu;
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const vaseGeo = new THREE.BufferGeometry();
  vaseGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  vaseGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  vaseGeo.setIndex(indices);
  vaseGeo.computeVertexNormals();

  // Water inside
  const maxHeight = outer[outer.length - 1].y;
  const waterTopY = BASE_THICKNESS + (maxHeight - BASE_THICKNESS) * waterHeightRatio;
  const topRadius = interpolateRadiusAtY(outer, waterTopY) - wallThickness - 0.01;
  const waterTopGeo = new THREE.CircleGeometry(Math.max(0.04, topRadius), 48);
  waterTopGeo.rotateX(-Math.PI / 2);

  const waterSideGeo = new THREE.CylinderGeometry(
    Math.max(0.04, topRadius),
    Math.max(0.04, outer[0].x - wallThickness),
    waterTopY - BASE_THICKNESS,
    36
  );
  waterSideGeo.translate(0, BASE_THICKNESS + (waterTopY - BASE_THICKNESS) * 0.5, 0);

  return { vaseGeo, waterSideGeo, waterTopGeo, waterTopY };
}

export const VaseMesh: React.FC = () => {
  const wrapping = useBouquetStore((state) => state.wrapping);
  const totalStems = useBouquetStore((state) => state.flowers.length);
  const arrangementStyle = useBouquetStore((state) => state.scene.arrangementStyle);
  const stemSpread = useBouquetStore((state) => state.scene.stemSpread);

  const isVase = isVaseWrapping(wrapping.type);
  const hasWater = wrapping.hasWater ?? true;

  // Scale vase neck/belly dynamically to comfortably enclose all bouquet stems
  const bundleR = getStemBundleRadius(totalStems, arrangementStyle);
  const neckScale = Math.max(1.0, ((bundleR + stemSpread * 0.04) * 1.45 + 0.12) / 0.34);

  const { vaseGeo, waterSideGeo, waterTopGeo, waterTopY } = useMemo(() => {
    if (wrapping.type === 'vase_teardrop') {
      // Photo 1: Tapered teardrop clear glass vase (narrow neck, round wide belly)
      const profile: VaseProfilePoint[] = [
        { y: 0.0, r: 0.42 * neckScale },
        { y: 0.12, r: 0.58 * neckScale },
        { y: 0.38, r: 0.68 * neckScale },
        { y: 0.72, r: 0.62 * neckScale },
        { y: 1.05, r: 0.46 * neckScale },
        { y: 1.32, r: 0.34 * neckScale },
        { y: 1.44, r: 0.36 * neckScale },
      ];
      return buildGlassVaseAndWater(profile, 0.026, 0.64);
    }

    if (wrapping.type === 'vase_ribbed') {
      // Photo 2: Ribbed mercury-gold / ceramic urn vase
      const profile: VaseProfilePoint[] = [
        { y: 0.0, r: 0.36 * neckScale },
        { y: 0.06, r: 0.34 * neckScale },
        { y: 0.28, r: 0.52 * neckScale },
        { y: 0.68, r: 0.64 * neckScale },
        { y: 1.06, r: 0.58 * neckScale },
        { y: 1.28, r: 0.40 * neckScale },
        { y: 1.38, r: 0.44 * neckScale },
      ];
      return buildRibbedVaseAndWater(profile, 0.032, 0.62);
    }

    // Photo 3: Tall classic clear glass vase
    const profile: VaseProfilePoint[] = [
      { y: 0.0, r: 0.38 * neckScale },
      { y: 0.25, r: 0.44 * neckScale },
      { y: 0.75, r: 0.54 * neckScale },
      { y: 1.18, r: 0.53 * neckScale },
      { y: 1.48, r: 0.44 * neckScale },
      { y: 1.62, r: 0.40 * neckScale },
    ];
    return buildGlassVaseAndWater(profile, 0.024, 0.58);
  }, [wrapping.type, neckScale]);

  useEffect(() => {
    return () => {
      vaseGeo.dispose();
      waterSideGeo.dispose();
      waterTopGeo.dispose();
    };
  }, [vaseGeo, waterSideGeo, waterTopGeo]);

  if (!isVase) return null;

  const isRibbed = wrapping.type === 'vase_ribbed';
  const vaseColor = wrapping.primaryColor || (isRibbed ? '#d4af37' : '#e6f4f8');

  return (
    <group position={[0, PODIUM_Y, 0]}>
      {/* Water Volume inside the vase */}
      {hasWater && (
        <group>
          {!isRibbed && (
            <mesh geometry={waterSideGeo} renderOrder={1}>
              <meshPhysicalMaterial
                color="#d8f3ff"
                transparent
                opacity={0.28}
                roughness={0.04}
                metalness={0.02}
                ior={1.333}
                reflectivity={0.85}
                clearcoat={1.0}
                depthWrite={false}
              />
            </mesh>
          )}
          {/* Shimmering water meniscus surface */}
          <mesh
            geometry={waterTopGeo}
            position={[0, waterTopY, 0]}
            renderOrder={1}
          >
            <meshPhysicalMaterial
              color="#cceeff"
              transparent
              opacity={0.48}
              roughness={0.05}
              metalness={0.08}
              ior={1.333}
              reflectivity={0.95}
              clearcoat={1.0}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* Vase Body */}
      {isRibbed ? (
        <mesh geometry={vaseGeo} castShadow receiveShadow>
          <meshStandardMaterial
            color={vaseColor}
            roughness={0.26}
            metalness={0.68}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : (
        <mesh geometry={vaseGeo} castShadow receiveShadow renderOrder={2}>
          <meshPhysicalMaterial
            color={vaseColor}
            transparent
            opacity={0.34}
            roughness={0.06}
            metalness={0.05}
            ior={1.5}
            reflectivity={0.92}
            clearcoat={1.0}
            clearcoatRoughness={0.04}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};
