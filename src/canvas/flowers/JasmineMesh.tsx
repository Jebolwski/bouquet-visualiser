import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { FlowerTransform } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface JasmineMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

/**
 * Builds a single oblong-pointed, spoon-cupped Jasmine petal BufferGeometry.
 * Base sits at (0, 0, 0) and extends along +Z.
 */
function createJasminePetalGeometry(): THREE.BufferGeometry {
  const segU = 8;
  const segV = 12;
  const cols = segU + 1;
  const rows = segV + 1;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const length = 0.145;
  const maxHalfWidth = 0.036;

  for (let iv = 0; iv < rows; iv++) {
    const v = iv / segV; // 0 (throat) -> 1 (tip)
    // Narrow claw -> full oblong blade -> soft pointed tip
    const widthProfile = Math.sin(Math.pow(v, 0.72) * Math.PI) * (0.86 + 0.2 * Math.sin(v * Math.PI));

    for (let iu = 0; iu < cols; iu++) {
      const u = (iu / segU) * 2 - 1;
      const absU = Math.abs(u);

      const x = u * maxHalfWidth * widthProfile;
      const z = v * length;

      // Lengthwise spoon-cup + subtle central rib + gentle tip reflex
      const cup = absU * absU * 0.011 * Math.sin(v * Math.PI);
      const centralRib = (1 - absU) * 0.003 * Math.sin(v * Math.PI);
      const arch = 0.016 * Math.sin(v * Math.PI * 0.75) - 0.022 * Math.pow(v, 2.2);
      const y = cup + centralRib + arch;

      positions.push(x, y, z);

      // Subtle warm-cream throat tint near base, pure color along blade
      const throat = Math.exp(-v * 5.0);
      const r = THREE.MathUtils.lerp(1.0, 0.98, throat);
      const g = THREE.MathUtils.lerp(1.0, 0.95, throat);
      const b = THREE.MathUtils.lerp(1.0, 0.78, throat);
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
 * Builds a plump, spiraled teardrop Jasmine bud BufferGeometry.
 */
function createJasmineBudGeometry(): THREE.BufferGeometry {
  const segU = 14;
  const segV = 12;
  const cols = segU + 1;
  const rows = segV + 1;

  const positions: number[] = [];
  const indices: number[] = [];
  const height = 0.115;

  for (let iv = 0; iv < rows; iv++) {
    const v = iv / segV;
    // Plump oval belly tapering to a neat pointed apex
    const baseR = Math.sin(Math.pow(v, 0.65) * Math.PI) * 0.028 * (1 - 0.2 * v);
    const y = v * height;

    for (let iu = 0; iu <= segU; iu++) {
      const u = iu / segU;
      const theta = u * Math.PI * 2;
      // Subtle 4-petal spiral ridge
      const ridge = 1 + 0.06 * Math.sin(theta * 4 + v * 2.2) * Math.sin(v * Math.PI);
      const r = baseR * ridge;
      positions.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
    }
  }

  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * cols + iu;
      const b = a + 1;
      const c = (iv + 1) * cols + iu;
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a glossy lanceolate-acuminate Jasmine leaf with V-folded midrib,
 * graceful downward arch, and vertex-colored pinnate veins.
 * Base sits at (0, 0, 0) and extends along +Z.
 */
function createJasmineLeafGeometry(): THREE.BufferGeometry {
  const segU = 10;
  const segV = 16;
  const cols = segU + 1;
  const rows = segV + 1;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const length = 0.34;
  const maxHalfWidth = 0.088;

  for (let iv = 0; iv < rows; iv++) {
    const v = iv / segV;
    // Lanceolate profile with elongated acuminate tip
    const widthProfile =
      Math.sin(Math.pow(v, 0.65) * Math.PI) * Math.pow(1 - v * 0.35, 0.65);

    for (let iu = 0; iu < cols; iu++) {
      const u = (iu / segU) * 2 - 1;
      const absU = Math.abs(u);

      const x = u * maxHalfWidth * widthProfile;
      const z = v * length;

      // V-folded midrib + natural leaf arch drooping toward tip
      const vFold = Math.pow(absU, 1.25) * 0.022 * Math.sin(v * Math.PI);
      const arch = 0.018 * Math.sin(v * Math.PI * 0.8) - 0.055 * Math.pow(v, 2.0);
      const y = vFold + arch;

      positions.push(x, y, z);

      // Deep glossy green with brighter lime-green midrib & curved pinnate veins
      const midrib = Math.exp(-Math.pow(absU / 0.07, 2)) * (1 - v * 0.35);
      const pinnateCoord = (v * 6.5 - absU * 1.9) * Math.PI;
      const pinnateVein =
        Math.pow(Math.max(0, Math.cos(pinnateCoord)), 10) *
        Math.exp(-absU * 1.1) *
        Math.sin(v * Math.PI);

      const veinMask = Math.min(1, midrib * 0.9 + pinnateVein * 0.55);
      const r = THREE.MathUtils.lerp(0.14, 0.38, veinMask);
      const g = THREE.MathUtils.lerp(0.32, 0.58, veinMask);
      const b = THREE.MathUtils.lerp(0.11, 0.22, veinMask);
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
 * Reusable spiky lime-green calyx whisker ring characteristic of Jasminum.
 */
const JasmineCalyxWhiskers: React.FC<{ count?: number; y?: number; radius?: number }> = ({
  count = 7,
  y = -0.105,
  radius = 0.015,
}) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const angle = (i * Math.PI * 2) / count + (i % 2) * 0.12;
      const tilt = 0.42 + (i % 3) * 0.12;
      return (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[radius, y + 0.032, 0]} rotation={[0, 0, -tilt]}>
            <cylinderGeometry args={[0.0012, 0.0038, 0.075, 5]} />
            <meshStandardMaterial color="#7da63c" roughness={0.55} />
          </mesh>
        </group>
      );
    })}
  </>
);

const SingleJasmineBloom: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  color: string;
  petalGeo: THREE.BufferGeometry;
}> = ({ position, rotation, scale = 1, color, petalGeo }) => {
  const outerPetals = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        angle: (i * Math.PI * 2) / 5,
        pitch: 0.08 + (i % 2) * 0.05,
        roll: ((i % 3) - 1) * 0.06,
      })),
    []
  );

  const innerPetals = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        angle: (i * Math.PI * 2) / 4 + 0.42,
        pitch: -0.14 - (i % 2) * 0.06,
        roll: ((i % 2) - 0.5) * 0.08,
      })),
    []
  );

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Slender corolla tube */}
      <mesh position={[0, -0.058, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.01, 0.125, 8]} />
        <meshStandardMaterial color="#87ad47" roughness={0.55} />
      </mesh>

      {/* Spiky lime-green calyx sepals */}
      <JasmineCalyxWhiskers count={7} y={-0.115} radius={0.013} />

      {/* Recessed golden-yellow throat eye */}
      <mesh position={[0, 0.008, 0]}>
        <cylinderGeometry args={[0.016, 0.009, 0.016, 12]} />
        <meshStandardMaterial color="#e8b22c" roughness={0.45} />
      </mesh>

      {/* Outer tier: 5 spreading star petals */}
      {outerPetals.map((p, idx) => (
        <group key={`outer-${idx}`} rotation={[0, p.angle, 0]}>
          <mesh
            geometry={petalGeo}
            position={[0, 0.006, 0.008]}
            rotation={[p.pitch, 0, p.roll]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={color}
              vertexColors
              roughness={0.38}
              metalness={0.03}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* Inner tier: 4 overlapping slightly cupped petals */}
      {innerPetals.map((p, idx) => (
        <group key={`inner-${idx}`} rotation={[0, p.angle, 0]}>
          <mesh
            geometry={petalGeo}
            position={[0, 0.012, 0.006]}
            rotation={[p.pitch, 0, p.roll]}
            scale={[0.88, 0.88, 0.84]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={color}
              vertexColors
              roughness={0.36}
              metalness={0.03}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const JasmineBud: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  color: string;
  budGeo: THREE.BufferGeometry;
}> = ({ position, rotation, scale = 0.85, color, budGeo }) => (
  <group position={position} rotation={rotation} scale={scale}>
    {/* Slender green corolla tube */}
    <mesh position={[0, -0.055, 0]} castShadow>
      <cylinderGeometry args={[0.012, 0.009, 0.11, 8]} />
      <meshStandardMaterial color="#87ad47" roughness={0.55} />
    </mesh>

    {/* Spiky calyx whiskers */}
    <JasmineCalyxWhiskers count={6} y={-0.105} radius={0.011} />

    {/* Plump spiraled teardrop bud */}
    <mesh geometry={budGeo} position={[0, -0.004, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.42} metalness={0.02} />
    </mesh>
  </group>
);

export const JasmineMesh: React.FC<JasmineMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  const { petalGeo, budGeo, leafGeo } = useMemo(() => {
    return {
      petalGeo: createJasminePetalGeometry(),
      budGeo: createJasmineBudGeometry(),
      leafGeo: createJasmineLeafGeometry(),
    };
  }, []);

  useEffect(() => {
    return () => {
      petalGeo.dispose();
      budGeo.dispose();
      leafGeo.dispose();
    };
  }, [petalGeo, budGeo, leafGeo]);

  return (
    <group>
      {/* 3D Curved Main Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#3e5f2d" radius={0.018} />

      {/* Detailed Jasmine Sprig */}
      <group position={position} rotation={rotation} scale={scale}>
        {/* Central upper shoot */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.009, 0.016, 0.42, 8]} />
          <meshStandardMaterial color="#456833" roughness={0.65} />
        </mesh>

        {/* 1. Terminal Central Double Star Bloom */}
        <SingleJasmineBloom
          position={[0, 0.28, 0]}
          rotation={[0.14, 0.2, -0.05]}
          scale={1.08}
          color={color}
          petalGeo={petalGeo}
        />

        {/* 2. Left Side Open Bloom on connected branch */}
        <group position={[-0.12, 0.17, 0.05]} rotation={[-0.18, -0.4, 0.52]}>
          <mesh position={[0.055, -0.09, 0]} rotation={[0, 0, -0.48]}>
            <cylinderGeometry args={[0.006, 0.009, 0.18, 6]} />
            <meshStandardMaterial color="#4b6f38" roughness={0.65} />
          </mesh>
          <SingleJasmineBloom
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={0.92}
            color={color}
            petalGeo={petalGeo}
          />
        </group>

        {/* 3. Right Side Open Bloom on connected branch */}
        <group position={[0.13, 0.15, -0.04]} rotation={[0.22, 0.5, -0.48]}>
          <mesh position={[-0.055, -0.085, 0]} rotation={[0, 0, 0.48]}>
            <cylinderGeometry args={[0.006, 0.009, 0.17, 6]} />
            <meshStandardMaterial color="#4b6f38" roughness={0.65} />
          </mesh>
          <SingleJasmineBloom
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={0.86}
            color={color}
            petalGeo={petalGeo}
          />
        </group>

        {/* 4. Two Sculpted Jasmine Buds on connected pedicels */}
        <group position={[-0.065, 0.34, -0.065]} rotation={[-0.25, -0.2, 0.32]}>
          <mesh position={[0.025, -0.085, 0.025]} rotation={[0.25, 0, -0.32]}>
            <cylinderGeometry args={[0.005, 0.007, 0.14, 6]} />
            <meshStandardMaterial color="#597d42" roughness={0.6} />
          </mesh>
          <JasmineBud
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={0.9}
            color={color}
            budGeo={budGeo}
          />
        </group>

        <group position={[0.08, 0.29, 0.07]} rotation={[0.28, 0.4, -0.38]}>
          <mesh position={[-0.03, -0.08, -0.025]} rotation={[-0.25, 0, 0.38]}>
            <cylinderGeometry args={[0.005, 0.007, 0.13, 6]} />
            <meshStandardMaterial color="#597d42" roughness={0.6} />
          </mesh>
          <JasmineBud
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={0.78}
            color={color}
            budGeo={budGeo}
          />
        </group>

        {/* 5. Opposite Glossy Pointed Jasmine Leaves with Petioles */}
        {[
          { pos: [0.01, -0.06, 0.01] as [number, number, number], rot: [0.35, 1.35, 0.12] as [number, number, number], s: 0.95 },
          { pos: [-0.01, -0.07, -0.01] as [number, number, number], rot: [0.32, -1.75, -0.12] as [number, number, number], s: 0.92 },
          { pos: [0.005, -0.18, 0.01] as [number, number, number], rot: [0.42, 0.25, -0.08] as [number, number, number], s: 1.05 },
          { pos: [-0.005, -0.2, -0.01] as [number, number, number], rot: [0.4, -2.95, 0.08] as [number, number, number], s: 1.0 },
        ].map((leaf, idx) => (
          <group key={idx} position={leaf.pos} rotation={leaf.rot} scale={leaf.s}>
            {/* Short petiole */}
            <mesh position={[0, 0.004, 0.018]} rotation={[Math.PI / 2 - 0.15, 0, 0]}>
              <cylinderGeometry args={[0.004, 0.006, 0.04, 6]} />
              <meshStandardMaterial color="#456833" roughness={0.55} />
            </mesh>
            {/* Glossy veined leaf blade */}
            <mesh
              geometry={leafGeo}
              position={[0, 0.006, 0.034]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                vertexColors
                roughness={0.34}
                metalness={0.06}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
