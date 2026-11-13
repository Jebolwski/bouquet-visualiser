import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { FlowerTransform, pseudoRandom } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface RoseMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
  stemLength?: number;
}

/* ------------------------------------------------------------------ */
/* Procedural rose petal                                               */
/* ------------------------------------------------------------------ */

interface PetalSpec {
  azimuth: number;   // rotation around the bloom axis
  baseY: number;     // height where the petal starts
  height: number;    // petal length
  r0: number;        // distance from axis at the base
  r1: number;        // distance from axis at the belly/top (bud opening)
  halfAngle: number; // angular half-width (how far it wraps around the bud)
  reflex: number;    // how much the top edge rolls back outward
  edgeCurl: number;  // how much the side tips curl out into points
  paleness: number;  // 0..1 how pale/white the petal base is
}

const U_SEG = 12;
const V_SEG = 14;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Point on a petal surface for u ∈ [-1,1] (across), t ∈ [0,1] (base → tip). */
function petalPoint(p: PetalSpec, u: number, t: number): THREE.Vector3 {
  // Rounded petal tip: the top edge is lower at the sides
  const v = t * (1 - 0.16 * u * u);

  // Petal outline: narrow claw at base, widest around 70%, rounded top
  const width = 0.22 + 0.78 * Math.pow(Math.sin(Math.PI * Math.min(1, v * 0.62 + 0.05)), 0.8);
  const phi = u * p.halfAngle * width;

  // Cupped bud profile: swells quickly from the base, then stays upright
  let r = p.r0 + (p.r1 - p.r0) * Math.sin(Math.min(1, v * 1.15) * Math.PI * 0.5);
  let y = p.baseY + p.height * v;

  // Top edge rolls back outward (reflexed petal lip)
  const lip = smoothstep(0.62, 1.0, v);
  r += p.reflex * lip * lip;
  y -= p.reflex * 0.35 * lip * lip;

  // Side tips curl outward into the classic pointed rose petal edge
  const au = Math.abs(u);
  r += p.edgeCurl * au * au * au * v * v;

  const a = p.azimuth + phi;
  return new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r);
}

/** Builds all petals into ONE merged BufferGeometry with vertex colours. */
function buildRoseHeadGeometry(petals: PetalSpec[], baseColor: string): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const base = new THREE.Color(baseColor);
  const tipColor = base.clone().offsetHSL(0, 0.02, -0.04);
  const tmp = new THREE.Color();

  petals.forEach((p) => {
    const pale = base.clone().lerp(new THREE.Color('#fff8f4'), 0.55 + 0.3 * p.paleness);
    const start = positions.length / 3;

    for (let j = 0; j <= V_SEG; j++) {
      const t = j / V_SEG;
      for (let i = 0; i <= U_SEG; i++) {
        const u = (i / U_SEG) * 2 - 1;
        const pt = petalPoint(p, u, t);
        positions.push(pt.x, pt.y, pt.z);

        // Bicolour gradient: pale/white base blooming into full colour toward the lip
        const colorMix = smoothstep(0.05, 0.62, t + 0.18 * Math.abs(u) - 0.25 * p.paleness);
        tmp.copy(pale).lerp(base, colorMix);
        // Slightly deeper tone right at the rolled lip
        tmp.lerp(tipColor, smoothstep(0.8, 1.0, t) * 0.5);
        colors.push(tmp.r, tmp.g, tmp.b);
      }
    }

    for (let j = 0; j < V_SEG; j++) {
      for (let i = 0; i < U_SEG; i++) {
        const a = start + j * (U_SEG + 1) + i;
        const b = a + U_SEG + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const GOLDEN = 2.39996323;

/** Rose bud layout: tight spiral heart → wrapping inner petals → open guard petals. */
function createPetalSpecs(seed: number): PetalSpec[] {
  const specs: PetalSpec[] = [];
  const jitter = (k: number, amt: number) => (pseudoRandom(seed * 31 + k) - 0.5) * amt;
  let idx = 0;

  const addLayer = (
    count: number,
    s: Omit<PetalSpec, 'azimuth' | 'paleness'> & { paleness: number }
  ) => {
    for (let i = 0; i < count; i++) {
      specs.push({
        ...s,
        azimuth: idx * GOLDEN + jitter(idx, 0.25),
        height: s.height * (1 + jitter(idx + 100, 0.08)),
        reflex: s.reflex * (1 + jitter(idx + 200, 0.4)),
        edgeCurl: s.edgeCurl * (1 + jitter(idx + 300, 0.4)),
      });
      idx++;
    }
  };

  // 1. Tight spiral heart (pale, tightly furled)
  addLayer(3, { baseY: 0.06, height: 0.13, r0: 0.004, r1: 0.022, halfAngle: 1.75, reflex: 0.004, edgeCurl: 0.004, paleness: 1.0 });
  // 2. Inner wrapping petals
  addLayer(4, { baseY: 0.03, height: 0.165, r0: 0.012, r1: 0.045, halfAngle: 1.4, reflex: 0.012, edgeCurl: 0.01, paleness: 0.8 });
  // 3. Middle cupping petals
  addLayer(5, { baseY: 0.005, height: 0.2, r0: 0.02, r1: 0.075, halfAngle: 1.12, reflex: 0.028, edgeCurl: 0.022, paleness: 0.45 });
  // 4. Outer guard petals (big, open, with rolled-back pointed lips)
  addLayer(5, { baseY: -0.02, height: 0.215, r0: 0.026, r1: 0.105, halfAngle: 0.98, reflex: 0.05, edgeCurl: 0.04, paleness: 0.2 });

  return specs;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const RoseMesh: React.FC<RoseMeshProps> = ({ color, transform, scale = 1.0 }) => {
  const { position, rotation, stemCurvePoints } = transform;

  // Stable per-rose seed so each bloom is slightly unique
  const seed = Math.floor(Math.abs(position[0] * 1000 + position[2] * 7919 + position[1] * 131));

  const petalSpecs = useMemo(() => createPetalSpecs(seed), [seed]);
  const headGeometry = useMemo(() => buildRoseHeadGeometry(petalSpecs, color), [petalSpecs, color]);

  useEffect(() => () => headGeometry.dispose(), [headGeometry]);

  // Dew drops sitting on the outer guard petals
  const dewDrops = useMemo(() => {
    const outer = petalSpecs.slice(-5);
    const drops: { pos: THREE.Vector3; size: number }[] = [];
    outer.forEach((p, k) => {
      const n = 2 + Math.floor(pseudoRandom(seed + k * 17) * 2);
      for (let d = 0; d < n; d++) {
        const u = (pseudoRandom(seed + k * 13 + d * 7) - 0.5) * 1.1;
        const t = 0.3 + pseudoRandom(seed + k * 19 + d * 3) * 0.5;
        const pt = petalPoint(p, u, t);
        // Push slightly outward so the drop sits on the petal surface
        const out = new THREE.Vector3(pt.x, 0, pt.z).normalize().multiplyScalar(0.004);
        drops.push({ pos: pt.add(out), size: 0.004 + pseudoRandom(seed + k + d * 29) * 0.005 });
      }
    });
    return drops;
  }, [petalSpecs, seed]);

  const sepals = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        angle: (i * Math.PI * 2) / 5 + 0.3,
        droop: 1.9 + pseudoRandom(seed + i * 11) * 0.5,
        length: 0.11 + pseudoRandom(seed + i * 5) * 0.04,
      })),
    [seed]
  );

  return (
    <group>
      {/* 3D Curved Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#2f5a24" radius={0.02} />

      {/* Flower Head */}
      <group position={position} rotation={rotation} scale={scale}>
        {/* Receptacle (green hip under the bloom) */}
        <mesh position={[0, -0.025, 0]} scale={[1, 0.85, 1]} castShadow>
          <sphereGeometry args={[0.034, 14, 12]} />
          <meshStandardMaterial color="#3b6b2c" roughness={0.6} />
        </mesh>

        {/* Slender pointed sepals curling down and away */}
        {sepals.map((s, idx) => {
          const dirX = Math.sin(s.droop);
          const dirY = Math.cos(s.droop);
          return (
            <group key={idx} rotation={[0, s.angle, 0]}>
              <mesh
                position={[0.022 + dirX * s.length * 0.5, -0.03 + dirY * s.length * 0.5, 0]}
                rotation={[0, 0, -s.droop]}
                scale={[1, 1, 0.28]}
                castShadow
              >
                <coneGeometry args={[0.016, s.length, 5]} />
                <meshStandardMaterial color="#3f7a2e" roughness={0.6} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        })}

        {/* All petals — one merged velvet mesh with bicolour vertex colours */}
        <mesh geometry={headGeometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            vertexColors
            roughness={0.48}
            metalness={0}
            sheen={0.6}
            sheenRoughness={0.45}
            sheenColor="#ffffff"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Dew drops */}
        {dewDrops.map((d, i) => (
          <mesh key={i} position={d.pos.toArray()} scale={[1, 0.8, 1]}>
            <sphereGeometry args={[d.size, 8, 6]} />
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.02}
              metalness={0}
              clearcoat={1}
              transparent
              opacity={0.45}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
