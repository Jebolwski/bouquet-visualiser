import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { FlowerTransform, pseudoRandom } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface TulipMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

interface TulipPetalSpec {
  azimuth: number;
  baseY: number;
  height: number;
  rBase: number;
  rBelly: number;
  rTip: number;
  halfAngle: number;
  cupDepth: number;
  isOuter: boolean;
}

const U_SEG = 12;
const V_SEG = 16;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Point on a cupped tulip petal surface for u ∈ [-1, 1] (across), t ∈ [0, 1] (base → tip). */
function tulipPetalPoint(p: TulipPetalSpec, u: number, t: number): THREE.Vector3 {
  // Rounded tulip petal tip (slightly pointed oval)
  const v = t * (1 - 0.18 * u * u);

  // Petal width: narrow claw at stem attachment, broad rounded belly, tapering to tip
  const widthProfile = Math.sin(Math.PI * Math.pow(Math.min(1, v * 0.94 + 0.04), 0.72));
  const phi = u * p.halfAngle * (0.28 + 0.72 * widthProfile);

  // Classic goblet silhouette: swells plumply in lower third, curves gently inward toward closed tip
  let r: number;
  if (v < 0.38) {
    const k = Math.sin((v / 0.38) * Math.PI * 0.5);
    r = p.rBase + (p.rBelly - p.rBase) * Math.pow(k, 0.72);
  } else {
    const k = (v - 0.38) / 0.62;
    r = p.rBelly + (p.rTip - p.rBelly) * (k * k * (2.2 - 1.2 * k));
  }

  // Gentle outward bow along the center rib so petals look plump, while edges tuck in cleanly
  const ribCurve = Math.sin(v * Math.PI);
  r += p.cupDepth * (1 - u * u) * ribCurve;

  const y = p.baseY + p.height * v;
  const a = p.azimuth + phi;
  return new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r);
}

function buildTulipHeadGeometry(petals: TulipPetalSpec[], baseColor: string): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const base = new THREE.Color(baseColor);
  const deepBase = base.clone().offsetHSL(-0.01, 0.08, -0.14);
  const throatTint = new THREE.Color('#2d3b22');
  const luminousMid = base.clone().lerp(new THREE.Color('#fff5f0'), 0.24);
  const edgeHighlight = base.clone().lerp(new THREE.Color('#ffffff'), 0.38);
  const tmp = new THREE.Color();

  petals.forEach((p) => {
    const start = positions.length / 3;

    for (let j = 0; j <= V_SEG; j++) {
      const t = j / V_SEG;
      for (let i = 0; i <= U_SEG; i++) {
        const u = (i / U_SEG) * 2 - 1;
        const pt = tulipPetalPoint(p, u, t);
        positions.push(pt.x, pt.y, pt.z);

        // Rich saturated base → luminous upper body → delicate pale edge highlight
        const bodyMix = smoothstep(0.12, 0.68, t);
        tmp.copy(deepBase).lerp(luminousMid, bodyMix);

        // Subtle dark/greenish throat right at stem attachment
        const throatMix = 1 - smoothstep(0.0, 0.09, t);
        tmp.lerp(throatTint, throatMix * 0.45);

        // Soft luminous rim along the upper edge and side margins
        const rimFactor =
          smoothstep(0.55, 1.0, Math.abs(u)) * smoothstep(0.25, 0.75, t) * 0.4 +
          smoothstep(0.82, 1.0, t) * 0.35;
        tmp.lerp(edgeHighlight, Math.min(0.65, rimFactor));

        // Inner petals slightly brighter/softer
        if (!p.isOuter) {
          tmp.lerp(edgeHighlight, 0.12);
        }

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

function createTulipPetals(seed: number): TulipPetalSpec[] {
  const specs: TulipPetalSpec[] = [];
  const jitter = (k: number, amt: number) => (pseudoRandom(seed * 23 + k) - 0.5) * amt;
  const baseRot = jitter(1, 0.8);

  // 3 Inner petals cupping the center
  for (let i = 0; i < 3; i++) {
    specs.push({
      azimuth: (i * Math.PI * 2) / 3 + baseRot + jitter(i + 10, 0.12),
      baseY: 0.0,
      height: 0.34 + jitter(i + 20, 0.02),
      rBase: 0.012,
      rBelly: 0.092 + jitter(i + 30, 0.006),
      rTip: 0.034,
      halfAngle: 0.9,
      cupDepth: 0.024,
      isOuter: false,
    });
  }

  // 3 Outer petals overlapping the gaps
  for (let i = 0; i < 3; i++) {
    specs.push({
      azimuth: (i * Math.PI * 2) / 3 + Math.PI / 3 + baseRot + jitter(i + 40, 0.12),
      baseY: -0.008,
      height: 0.355 + jitter(i + 50, 0.02),
      rBase: 0.016,
      rBelly: 0.112 + jitter(i + 60, 0.008),
      rTip: 0.048,
      halfAngle: 0.94,
      cupDepth: 0.032,
      isOuter: true,
    });
  }

  return specs;
}

export const TulipMesh: React.FC<TulipMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  const seed = Math.floor(
    Math.abs(position[0] * 1000 + position[2] * 7919 + position[1] * 131)
  );

  const petalSpecs = useMemo(() => createTulipPetals(seed), [seed]);
  const headGeometry = useMemo(
    () => buildTulipHeadGeometry(petalSpecs, color),
    [petalSpecs, color]
  );

  useEffect(() => () => headGeometry.dispose(), [headGeometry]);

  // Subtle morning dew drops on the outer petals
  const dewDrops = useMemo(() => {
    const outer = petalSpecs.slice(3);
    const drops: { pos: THREE.Vector3; size: number }[] = [];
    outer.forEach((p, k) => {
      const n = 2 + Math.floor(pseudoRandom(seed + k * 19) * 2);
      for (let d = 0; d < n; d++) {
        const u = (pseudoRandom(seed + k * 11 + d * 7) - 0.5) * 0.9;
        const t = 0.45 + pseudoRandom(seed + k * 29 + d * 5) * 0.42;
        const pt = tulipPetalPoint(p, u, t);
        const out = new THREE.Vector3(pt.x, 0, pt.z).normalize().multiplyScalar(0.003);
        drops.push({ pos: pt.add(out), size: 0.0035 + pseudoRandom(seed + k + d * 17) * 0.004 });
      }
    });
    return drops;
  }, [petalSpecs, seed]);

  return (
    <group>
      {/* 3D Curved Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#3e5f2d" radius={0.023} />

      {/* Flower Head */}
      <group position={position} rotation={rotation} scale={scale}>
        {/* Subtle green stem-to-cup receptacle */}
        <mesh position={[0, -0.005, 0]} castShadow>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshStandardMaterial color="#3c5e2b" roughness={0.65} />
        </mesh>

        {/* Core Pistil / Stamen (glimpsed slightly inside top opening) */}
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.01, 0.014, 0.18, 8]} />
          <meshStandardMaterial color="#d4a373" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.23, 0]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#fca311" roughness={0.4} />
        </mesh>

        {/* 6 Cupped Tulip Petals (merged smooth BufferGeometry) */}
        <mesh geometry={headGeometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            vertexColors
            roughness={0.38}
            metalness={0.02}
            sheen={0.45}
            sheenRoughness={0.4}
            sheenColor="#ffffff"
            clearcoat={0.12}
            clearcoatRoughness={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Morning Dew Drops */}
        {dewDrops.map((d, i) => (
          <mesh key={i} position={d.pos.toArray()} scale={[1, 0.85, 1]}>
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

        {/* Broad Tulip Leaf hugging upper stem (stays safely above wrap rim) */}
        <group position={[0, -0.06, 0.02]} rotation={[0.06, 0.04, 0.03]}>
          <mesh scale={[0.035, 0.2, 0.018]} castShadow receiveShadow>
            <cylinderGeometry args={[0.01, 1, 1, 8]} />
            <meshStandardMaterial color="#446a36" roughness={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
