import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FlowerTransform } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface LavenderMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

interface CalyxInstance {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  scale: number;
}

interface FloretInstance {
  pos: THREE.Vector3;
  quat: THREE.Quaternion;
  scale: number;
}

/**
 * Builds an elongated, 6-ribbed teardrop lavender calyx / bud BufferGeometry.
 * Base sits at (0, 0, 0) and extends along +Y.
 */
function createLavenderCalyxBudGeometry(): THREE.BufferGeometry {
  const segU = 12;
  const segV = 10;
  const cols = segU + 1;
  const rows = segV + 1;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const height = 0.072;

  for (let iv = 0; iv < rows; iv++) {
    const v = iv / segV;
    const baseR = Math.sin(Math.pow(v, 0.62) * Math.PI) * 0.0175 * (1 - 0.15 * v);
    const y = v * height;

    for (let iu = 0; iu <= segU; iu++) {
      const u = iu / segU;
      const theta = u * Math.PI * 2;
      const flute = 1 + 0.09 * Math.cos(theta * 6) * Math.sin(v * Math.PI);
      const r = baseR * flute;

      positions.push(Math.cos(theta) * r, y, Math.sin(theta) * r);

      // Sage-green/muted base transitioning to rich lavender tip (multiplied with `color`)
      const tipBlend = Math.pow(v, 0.75);
      const cr = THREE.MathUtils.lerp(0.68, 1.0, tipBlend);
      const cg = THREE.MathUtils.lerp(0.84, 0.96, tipBlend);
      const cb = THREE.MathUtils.lerp(0.72, 1.04, tipBlend);
      colors.push(cr, cg, cb);
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
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds an open two-lipped tubular lavender floret (slender tube + 5 flared petal lobes)
 * oriented along +Y from base (0, 0, 0).
 */
function createLavenderFloretGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  let vertOffset = 0;

  // 1. Slender flared corolla tube (0 -> 0.048 along +Y)
  const tubeSegU = 8;
  const tubeSegV = 5;
  for (let iv = 0; iv <= tubeSegV; iv++) {
    const v = iv / tubeSegV;
    const y = v * 0.046;
    const r = THREE.MathUtils.lerp(0.0045, 0.0085, v);
    for (let iu = 0; iu <= tubeSegU; iu++) {
      const theta = (iu / tubeSegU) * Math.PI * 2;
      positions.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
      // Darker plum throat transitioning to bright lilac rim
      const shade = THREE.MathUtils.lerp(0.62, 1.08, v);
      colors.push(shade, shade * 0.95, shade * 1.08);
    }
  }
  const tubeStride = tubeSegU + 1;
  for (let iv = 0; iv < tubeSegV; iv++) {
    for (let iu = 0; iu < tubeSegU; iu++) {
      const a = vertOffset + iv * tubeStride + iu;
      const b = a + 1;
      const c = vertOffset + (iv + 1) * tubeStride + iu;
      const d = c + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }
  vertOffset += (tubeSegV + 1) * tubeStride;

  // 2. Five rounded-oblong flared petal lobes (upper 2 + lower 3)
  const lobeAngles = [0.35, -0.35, 1.55, 2.55, -2.1];
  const segU = 4;
  const segV = 5;

  for (let li = 0; li < lobeAngles.length; li++) {
    const az = lobeAngles[li];
    const isUpper = li < 2;
    const lobeLen = isUpper ? 0.032 : 0.028;
    const lobeHalfW = isUpper ? 0.012 : 0.011;
    const cosA = Math.cos(az);
    const sinA = Math.sin(az);

    for (let iv = 0; iv <= segV; iv++) {
      const v = iv / segV;
      const wProfile = Math.sin(Math.pow(v, 0.7) * Math.PI);
      const radial = 0.007 + v * lobeLen;
      const y = 0.045 + Math.sin(v * Math.PI * 0.45) * 0.012 - v * v * 0.006;

      for (let iu = 0; iu <= segU; iu++) {
        const u = (iu / segU) * 2 - 1;
        const localZ = u * lobeHalfW * wProfile;
        const x = radial * cosA - localZ * sinA;
        const z = radial * sinA + localZ * cosA;
        positions.push(x, y + Math.abs(u) * 0.002, z);

        // Lighter pastel-lavender petal lobes
        const tint = THREE.MathUtils.lerp(1.02, 1.24, v);
        colors.push(tint, tint * 0.96, tint * 1.06);
      }
    }

    const stride = segU + 1;
    for (let iv = 0; iv < segV; iv++) {
      for (let iu = 0; iu < segU; iu++) {
        const a = vertOffset + iv * stride + iu;
        const b = a + 1;
        const c = vertOffset + (iv + 1) * stride + iu;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }
    vertOffset += (segV + 1) * stride;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a slender, gracefully arching linear silvery-sage lavender leaf.
 * Base sits at (0, 0, 0) and extends along +Z.
 */
function createLavenderLeafGeometry(): THREE.BufferGeometry {
  const segU = 6;
  const segV = 12;
  const cols = segU + 1;
  const rows = segV + 1;

  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const length = 0.24;
  const maxHalfW = 0.019;

  for (let iv = 0; iv < rows; iv++) {
    const v = iv / segV;
    const widthProfile = Math.sin(Math.pow(v, 0.72) * Math.PI);

    for (let iu = 0; iu < cols; iu++) {
      const u = (iu / segU) * 2 - 1;
      const absU = Math.abs(u);

      const x = u * maxHalfW * widthProfile;
      const z = v * length;
      const vCup = absU * absU * 0.006 * Math.sin(v * Math.PI);
      const arch = 0.025 * Math.sin(v * Math.PI * 0.7) - 0.042 * Math.pow(v, 2.0);
      positions.push(x, vCup + arch, z);

      // Silvery-sage glaucous leaf with pale midrib
      const midrib = Math.exp(-Math.pow(absU / 0.14, 2));
      const r = THREE.MathUtils.lerp(0.36, 0.56, midrib);
      const g = THREE.MathUtils.lerp(0.48, 0.66, midrib);
      const b = THREE.MathUtils.lerp(0.38, 0.54, midrib);
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
 * Generates whorled calyx buds and open 5-lobed florets for a spike at `origin` along `axisDir`.
 */
function populateSpike(
  origin: THREE.Vector3,
  axisDir: THREE.Vector3,
  tiers: { yOffset: number; count: number; radius: number; scale: number; hasFlorets: boolean }[],
  calyxes: CalyxInstance[],
  florets: FloretInstance[]
) {
  const up = new THREE.Vector3(0, 1, 0);
  const axisQuat = new THREE.Quaternion().setFromUnitVectors(up, axisDir.clone().normalize());

  tiers.forEach((tier, ti) => {
    for (let f = 0; f < tier.count; f++) {
      const az = (f * Math.PI * 2) / tier.count + ti * 0.55;
      const localPos = new THREE.Vector3(
        Math.cos(az) * tier.radius,
        tier.yOffset,
        Math.sin(az) * tier.radius
      ).applyQuaternion(axisQuat).add(origin);

      // Tilt calyx outward ~28 degrees from spike axis
      const outDir = new THREE.Vector3(
        Math.cos(az) * 0.45,
        0.9,
        Math.sin(az) * 0.45
      )
        .normalize()
        .applyQuaternion(axisQuat);

      const qCalyx = new THREE.Quaternion().setFromUnitVectors(up, outDir);
      calyxes.push({ pos: localPos, quat: qCalyx, scale: tier.scale });

      // Open two-lipped blossoms emerge from the calyx tips on middle/lower tiers
      if (tier.hasFlorets && (f + ti) % 2 === 0) {
        const floretBase = localPos.clone().addScaledVector(outDir, 0.042 * tier.scale);
        const floretDir = new THREE.Vector3(
          Math.cos(az) * 0.72,
          0.68,
          Math.sin(az) * 0.72
        )
          .normalize()
          .applyQuaternion(axisQuat);
        const qFloret = new THREE.Quaternion().setFromUnitVectors(up, floretDir);
        florets.push({ pos: floretBase, quat: qFloret, scale: tier.scale * 1.05 });
      }
    }
  });
}

export const LavenderMesh: React.FC<LavenderMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  const { calyxGeo, floretGeo, leafGeo, sideBranchGeo, calyxes, florets } = useMemo(() => {
    const cGeo = createLavenderCalyxBudGeometry();
    const fGeo = createLavenderFloretGeometry();
    const lGeo = createLavenderLeafGeometry();

    // Gently curving secondary side stem
    const sideCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.1, 0),
      new THREE.Vector3(-0.045, 0.04, 0.015),
      new THREE.Vector3(-0.095, 0.19, 0.03),
      new THREE.Vector3(-0.125, 0.31, 0.04),
    ]);
    const sbGeo = new THREE.TubeGeometry(sideCurve, 12, 0.0075, 6, false);

    const calyxList: CalyxInstance[] = [];
    const floretList: FloretInstance[] = [];

    // Main spike: 1 separate lower whorl + 8 dense tapered tiers
    populateSpike(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
      [
        { yOffset: 0.03, count: 5, radius: 0.022, scale: 0.92, hasFlorets: true },
        { yOffset: 0.14, count: 6, radius: 0.028, scale: 1.02, hasFlorets: true },
        { yOffset: 0.2, count: 6, radius: 0.028, scale: 1.04, hasFlorets: true },
        { yOffset: 0.26, count: 6, radius: 0.026, scale: 1.0, hasFlorets: true },
        { yOffset: 0.32, count: 5, radius: 0.023, scale: 0.95, hasFlorets: true },
        { yOffset: 0.38, count: 5, radius: 0.02, scale: 0.88, hasFlorets: false },
        { yOffset: 0.43, count: 4, radius: 0.016, scale: 0.8, hasFlorets: false },
        { yOffset: 0.48, count: 4, radius: 0.012, scale: 0.72, hasFlorets: false },
        { yOffset: 0.52, count: 3, radius: 0.007, scale: 0.62, hasFlorets: false },
      ],
      calyxList,
      floretList
    );

    // Smaller secondary side bud spike
    const sideDir = new THREE.Vector3(-0.3, 0.94, 0.1).normalize();
    populateSpike(
      new THREE.Vector3(-0.125, 0.31, 0.04),
      sideDir,
      [
        { yOffset: 0.0, count: 4, radius: 0.018, scale: 0.76, hasFlorets: false },
        { yOffset: 0.045, count: 4, radius: 0.016, scale: 0.72, hasFlorets: false },
        { yOffset: 0.088, count: 4, radius: 0.013, scale: 0.66, hasFlorets: false },
        { yOffset: 0.126, count: 3, radius: 0.008, scale: 0.58, hasFlorets: false },
      ],
      calyxList,
      floretList
    );

    return {
      calyxGeo: cGeo,
      floretGeo: fGeo,
      leafGeo: lGeo,
      sideBranchGeo: sbGeo,
      calyxes: calyxList,
      florets: floretList,
    };
  }, []);

  useEffect(() => {
    return () => {
      calyxGeo.dispose();
      floretGeo.dispose();
      leafGeo.dispose();
      sideBranchGeo.dispose();
    };
  }, [calyxGeo, floretGeo, leafGeo, sideBranchGeo]);

  const calyxRef = useRef<THREE.InstancedMesh>(null);
  const floretRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    if (calyxRef.current) {
      calyxes.forEach((c, i) => {
        dummy.position.copy(c.pos);
        dummy.quaternion.copy(c.quat);
        dummy.scale.setScalar(c.scale);
        dummy.updateMatrix();
        calyxRef.current!.setMatrixAt(i, dummy.matrix);
      });
      calyxRef.current.instanceMatrix.needsUpdate = true;
    }

    if (floretRef.current) {
      florets.forEach((f, i) => {
        dummy.position.copy(f.pos);
        dummy.quaternion.copy(f.quat);
        dummy.scale.setScalar(f.scale);
        dummy.updateMatrix();
        floretRef.current!.setMatrixAt(i, dummy.matrix);
      });
      floretRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [calyxes, florets]);

  // Lower silvery-sage leaves + 2 small bracts cradling the lower whorl
  const leafPlacements = useMemo(
    () => [
      { pos: [0.008, 0.015, 0.006] as [number, number, number], rot: [-0.35, 1.4, 0] as [number, number, number], s: 0.45 },
      { pos: [-0.008, 0.015, -0.006] as [number, number, number], rot: [-0.35, -1.7, 0] as [number, number, number], s: 0.45 },
      { pos: [0.008, -0.11, 0.006] as [number, number, number], rot: [-0.72, 0.45, 0] as [number, number, number], s: 0.92 },
      { pos: [-0.008, -0.13, -0.006] as [number, number, number], rot: [-0.75, -2.65, 0] as [number, number, number], s: 0.88 },
      { pos: [0.006, -0.2, -0.008] as [number, number, number], rot: [-0.65, 2.2, 0] as [number, number, number], s: 1.02 },
      { pos: [-0.006, -0.23, 0.008] as [number, number, number], rot: [-0.62, -0.95, 0] as [number, number, number], s: 0.98 },
      { pos: [0.004, -0.28, 0.004] as [number, number, number], rot: [-0.55, -0.1, 0] as [number, number, number], s: 1.05 },
      { pos: [-0.004, -0.3, -0.004] as [number, number, number], rot: [-0.55, 3.05, 0] as [number, number, number], s: 1.0 },
    ],
    []
  );

  return (
    <group>
      {/* 3D Curved Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#4c6b42" radius={0.017} />

      {/* Detailed Lavender Spike & Side Shoot */}
      <group position={position} rotation={rotation} scale={scale}>
        {/* Main central spike axis */}
        <mesh position={[0, 0.21, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.015, 0.68, 8]} />
          <meshStandardMaterial color="#4c6b42" roughness={0.68} />
        </mesh>

        {/* Curved secondary side stem */}
        <mesh geometry={sideBranchGeo} castShadow>
          <meshStandardMaterial color="#55754a" roughness={0.68} />
        </mesh>

        {/* Ribbed Calyx Cups & Buds */}
        <instancedMesh
          ref={calyxRef}
          args={[calyxGeo, undefined, calyxes.length]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={color}
            vertexColors
            roughness={0.55}
            metalness={0.04}
          />
        </instancedMesh>

        {/* Open Two-Lipped 5-Lobed Blossoms */}
        <instancedMesh
          ref={floretRef}
          args={[floretGeo, undefined, florets.length]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={color}
            vertexColors
            roughness={0.42}
            metalness={0.03}
            side={THREE.DoubleSide}
          />
        </instancedMesh>

        {/* Silvery-Sage Linear Leaves & Lower Whorl Bracts */}
        {leafPlacements.map((leaf, idx) => (
          <mesh
            key={idx}
            geometry={leafGeo}
            position={leaf.pos}
            rotation={leaf.rot}
            scale={leaf.s}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              vertexColors
              roughness={0.62}
              metalness={0.02}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
