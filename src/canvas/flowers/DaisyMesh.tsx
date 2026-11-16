import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FlowerTransform } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface DaisyMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

const GOLDEN_ANGLE = 2.39996323;

/**
 * Builds a strap-shaped daisy ray petal with two longitudinal grooves,
 * a softly notched/toothed tip, gentle arch, and warm-cream base tint.
 * Base sits at (0, 0, 0) and extends along +Z.
 */
function createDaisyPetalGeometry(): THREE.BufferGeometry {
  const segU = 8;
  const segV = 12;
  const cols = segU + 1;
  const rows = segV + 1;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const length = 0.44;
  const maxHalfWidth = 0.068;

  for (let iv = 0; iv < rows; iv++) {
    const v = iv / segV;
    // Narrow base -> full strap blade -> softly rounded tip
    const widthProfile =
      0.24 + 0.76 * Math.sin(Math.pow(v, 0.62) * Math.PI * 0.92);

    for (let iu = 0; iu < cols; iu++) {
      const u = (iu / segU) * 2 - 1;
      const absU = Math.abs(u);

      // Characteristic subtle 2-3 tooth notch at the outer petal tip
      const tipNotch = v > 0.86 ? (Math.cos(u * Math.PI * 2.0) - 1) * 0.012 * ((v - 0.86) / 0.14) : 0;

      const x = u * maxHalfWidth * widthProfile;
      const z = v * length + tipNotch;

      // Two subtle longitudinal grooves + gentle upward cup + outer arch
      const grooves = -0.0045 * Math.cos(u * Math.PI * 2.0) * Math.sin(v * Math.PI);
      const cup = absU * absU * 0.008 * Math.sin(v * Math.PI);
      const arch = 0.024 * Math.sin(v * Math.PI * 0.7) - 0.032 * Math.pow(v, 2.2);
      const y = grooves + cup + arch;

      positions.push(x, y, z);

      // Subtle warm creamy-yellowish base blending to pure petal color
      const baseFade = Math.exp(-v * 5.2);
      const r = THREE.MathUtils.lerp(1.0, 0.96, baseFade);
      const g = THREE.MathUtils.lerp(1.0, 0.94, baseFade);
      const b = THREE.MathUtils.lerp(1.0, 0.78, baseFade);
      colors.push(r, g, b);
    }
  }

  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * cols + iu;
      const b = a + 1;
      const c = (iv + 1) * cols + iu;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the central golden floret cushion with a slight central dimple
 * and warm amber-to-bright-gold radial vertex coloring.
 */
function createDaisyDiscGeometry(): THREE.BufferGeometry {
  const segU = 24;
  const segV = 10;
  const cols = segU + 1;
  const rows = segV + 1;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const discRadius = 0.145;

  for (let iv = 0; iv < rows; iv++) {
    const v = iv / segV; // 0 (center) -> 1 (rim)
    const r = v * discRadius;
    // Cushioned dome with subtle central navel depression
    const domeY = Math.cos(v * Math.PI * 0.5) * 0.055 - Math.exp(-v * v * 12) * 0.012;

    for (let iu = 0; iu <= segU; iu++) {
      const theta = (iu / segU) * Math.PI * 2;
      positions.push(Math.cos(theta) * r, domeY, Math.sin(theta) * r);

      // Richer amber-gold in center, brighter pollen-yellow toward outer ring
      const cr = THREE.MathUtils.lerp(0.86, 1.0, v);
      const cg = THREE.MathUtils.lerp(0.58, 0.82, v);
      const cb = THREE.MathUtils.lerp(0.04, 0.08, v);
      colors.push(cr, cg, cb);
    }
  }

  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * cols + iu;
      const b = a + 1;
      const c = (iv + 1) * cols + iu;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a serrated/toothed spatulate-lanceolate daisy leaf with V-folded midrib
 * and vertex-colored pale-green veins.
 * Base sits at (0, 0, 0) and extends along +Z.
 */
function createDaisyLeafGeometry(): THREE.BufferGeometry {
  const segU = 10;
  const segV = 14;
  const cols = segU + 1;
  const rows = segV + 1;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const length = 0.36;
  const maxHalfWidth = 0.095;

  for (let iv = 0; iv < rows; iv++) {
    const v = iv / segV;
    // Spatulate-lanceolate profile with serrated tooth indentations along edges
    const baseOutline = Math.sin(Math.pow(v, 0.72) * Math.PI);
    const teeth = v > 0.22 && v < 0.94 ? 1 + 0.16 * Math.sin(v * Math.PI * 10.0) : 1;
    const widthProfile = baseOutline * teeth;

    for (let iu = 0; iu < cols; iu++) {
      const u = (iu / segU) * 2 - 1;
      const absU = Math.abs(u);

      const x = u * maxHalfWidth * widthProfile;
      const z = v * length;

      const vFold = Math.pow(absU, 1.3) * 0.018 * Math.sin(v * Math.PI);
      const arch = 0.015 * Math.sin(v * Math.PI * 0.7) - 0.048 * Math.pow(v, 2.0);
      positions.push(x, vFold + arch, z);

      // Deep meadow green with pale-green midrib & pinnate veins
      const midrib = Math.exp(-Math.pow(absU / 0.08, 2)) * (1 - v * 0.3);
      const lateralCoord = (v * 6.0 - absU * 1.8) * Math.PI;
      const lateralVein =
        Math.pow(Math.max(0, Math.cos(lateralCoord)), 10) *
        Math.exp(-absU * 1.2) *
        Math.sin(v * Math.PI);
      const veinMask = Math.min(1, midrib * 0.85 + lateralVein * 0.45);

      const r = THREE.MathUtils.lerp(0.18, 0.38, veinMask);
      const g = THREE.MathUtils.lerp(0.36, 0.56, veinMask);
      const b = THREE.MathUtils.lerp(0.14, 0.24, veinMask);
      colors.push(r, g, b);
    }
  }

  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * cols + iu;
      const b = a + 1;
      const c = (iv + 1) * cols + iu;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export const DaisyMesh: React.FC<DaisyMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  const { petalGeo, discGeo, floretBumpGeo, leafGeo } = useMemo(() => {
    const pGeo = createDaisyPetalGeometry();
    const dGeo = createDaisyDiscGeometry();
    const bumpGeo = new THREE.SphereGeometry(0.011, 6, 5);
    bumpGeo.scale(1, 0.75, 1);
    const lGeo = createDaisyLeafGeometry();
    return { petalGeo: pGeo, discGeo: dGeo, floretBumpGeo: bumpGeo, leafGeo: lGeo };
  }, []);

  useEffect(() => {
    return () => {
      petalGeo.dispose();
      discGeo.dispose();
      floretBumpGeo.dispose();
      leafGeo.dispose();
    };
  }, [petalGeo, discGeo, floretBumpGeo, leafGeo]);

  // Two slightly staggered tiers of ray petals (14 upper + 12 lower)
  const petals = useMemo(() => {
    const list: {
      angle: number;
      pitch: number;
      roll: number;
      lenScale: number;
      yOff: number;
    }[] = [];

    const upperCount = 14;
    for (let i = 0; i < upperCount; i++) {
      list.push({
        angle: (i * Math.PI * 2) / upperCount,
        pitch: 0.04 + (i % 3) * 0.035,
        roll: ((i % 5) - 2) * 0.02,
        lenScale: 0.94 + ((i * 3) % 5) * 0.03,
        yOff: 0.008,
      });
    }

    const lowerCount = 12;
    for (let i = 0; i < lowerCount; i++) {
      list.push({
        angle: (i * Math.PI * 2) / lowerCount + Math.PI / lowerCount,
        pitch: 0.14 + (i % 2) * 0.04,
        roll: ((i % 4) - 1.5) * 0.025,
        lenScale: 0.98 + ((i * 7) % 4) * 0.025,
        yOff: -0.002,
      });
    }

    return list;
  }, []);

  // Fibonacci spiral micro-floret bumps across the golden center disc
  const discFlorets = useMemo(() => {
    const count = 68;
    const discRadius = 0.136;
    const pts: { x: number; y: number; z: number; s: number }[] = [];
    for (let i = 0; i < count; i++) {
      const frac = (i + 0.5) / count;
      const r = Math.sqrt(frac) * discRadius;
      const theta = i * GOLDEN_ANGLE;
      const v = r / 0.145;
      const domeY = Math.cos(v * Math.PI * 0.5) * 0.055 - Math.exp(-v * v * 12) * 0.012 + 0.005;
      pts.push({
        x: Math.cos(theta) * r,
        y: domeY,
        z: Math.sin(theta) * r,
        s: 0.8 + frac * 0.45,
      });
    }
    return pts;
  }, []);

  const floretRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!floretRef.current) return;
    const dummy = new THREE.Object3D();
    discFlorets.forEach((pt, i) => {
      dummy.position.set(pt.x, pt.y, pt.z);
      dummy.scale.setScalar(pt.s);
      dummy.updateMatrix();
      floretRef.current!.setMatrixAt(i, dummy.matrix);
    });
    floretRef.current.instanceMatrix.needsUpdate = true;
  }, [discFlorets]);

  return (
    <group>
      {/* 3D Curved Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#3a5c2d" radius={0.016} />

      {/* Flower Head (proportional to or slightly smaller than tulips) */}
      <group position={position} rotation={rotation} scale={scale * 0.24}>
        {/* Layered green involucre calyx cup */}
        <mesh position={[0, -0.032, 0]} castShadow>
          <cylinderGeometry args={[0.125, 0.045, 0.075, 16]} />
          <meshStandardMaterial color="#385a2a" roughness={0.68} />
        </mesh>

        {/* Pointed green phyllary bracts cradling the base */}
        {Array.from({ length: 10 }, (_, i) => (
          <group key={`bract-${i}`} rotation={[0, (i * Math.PI * 2) / 10, 0]}>
            <mesh position={[0.105, -0.025, 0]} rotation={[0, 0, -1.05]}>
              <coneGeometry args={[0.02, 0.075, 4]} />
              <meshStandardMaterial color="#446933" roughness={0.65} />
            </mesh>
          </group>
        ))}

        {/* Golden Floret Cushion Disc */}
        <mesh geometry={discGeo} position={[0, 0.004, 0]} castShadow receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.82} metalness={0.04} />
        </mesh>

        {/* Fibonacci Micro-Floret Bumps on Disc */}
        <instancedMesh
          ref={floretRef}
          args={[floretBumpGeo, undefined, discFlorets.length]}
          castShadow
        >
          <meshStandardMaterial color="#fbbf24" roughness={0.75} metalness={0.05} />
        </instancedMesh>

        {/* Two-Tiered Grooved & Notched Ray Petals */}
        {petals.map((p, idx) => (
          <group key={idx} rotation={[0, p.angle, 0]}>
            <mesh
              geometry={petalGeo}
              position={[0, p.yOff, 0.115]}
              rotation={[p.pitch, 0, p.roll]}
              scale={[1, 1, p.lenScale]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={color}
                vertexColors
                roughness={0.4}
                metalness={0.03}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Serrated Daisy Leaves along the upper stem */}
      <group position={position} rotation={rotation} scale={scale * 0.42}>
        <mesh
          geometry={leafGeo}
          position={[0.01, -0.22, 0.01]}
          rotation={[0.38, 0.75, 0.1]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial vertexColors roughness={0.58} side={THREE.DoubleSide} />
        </mesh>
        <mesh
          geometry={leafGeo}
          position={[-0.01, -0.34, -0.01]}
          rotation={[0.42, -2.35, -0.1]}
          scale={0.92}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial vertexColors roughness={0.58} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
