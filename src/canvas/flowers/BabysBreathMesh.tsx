import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FlowerTransform } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface BabysBreathMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

interface Segment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  rBottom: number;
  rTop: number;
}

interface TipNode {
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  scale: number;
  isBud: boolean;
}

/**
 * Deterministic pseudo-random helper in [-1, 1] for organic variation.
 */
function hashSigned(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/**
 * Builds a single merged BufferGeometry of all dichotomous panicle twigs
 * so every floret and bud is physically connected to the main stem.
 */
function buildPanicleSkeleton(segments: Segment[]): THREE.BufferGeometry {
  const radialSegs = 6;
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion();
  const dir = new THREE.Vector3();
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();

  let vertOffset = 0;

  for (const seg of segments) {
    dir.copy(seg.end).sub(seg.start);
    const len = dir.length();
    if (len < 1e-5) continue;
    dir.divideScalar(len);
    quat.setFromUnitVectors(up, dir);

    for (let ring = 0; ring <= 1; ring++) {
      const y = ring === 0 ? 0 : len;
      const r = ring === 0 ? seg.rBottom : seg.rTop;
      const basePos = ring === 0 ? seg.start : seg.end;

      for (let i = 0; i <= radialSegs; i++) {
        const theta = (i / radialSegs) * Math.PI * 2;
        const cx = Math.cos(theta);
        const cz = Math.sin(theta);

        n.set(cx, 0, cz).applyQuaternion(quat).normalize();
        v.set(cx * r, y, cz * r).applyQuaternion(quat).add(seg.start);
        if (ring === 1) {
          v.copy(n).multiplyScalar(r).add(basePos);
        }

        positions.push(v.x, v.y, v.z);
        normals.push(n.x, n.y, n.z);
      }
    }

    const stride = radialSegs + 1;
    for (let i = 0; i < radialSegs; i++) {
      const a = vertOffset + i;
      const b = a + 1;
      const c = vertOffset + stride + i;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }

    vertOffset += stride * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  return geo;
}

/**
 * Builds a miniature double-layered ruffled gypsophila blossom (2 whorls of 5 cupped petals)
 * with vertex colors for a subtle warm-cream center throat.
 * Oriented with base at (0, 0, 0) opening toward +Y.
 */
function createGypsophilaBlossomGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const whorls = [
    { count: 5, radius: 0.036, tilt: 0.95, lift: 0.014, angleOffset: 0, shade: 1.0 },
    { count: 5, radius: 0.025, tilt: 0.55, lift: 0.019, angleOffset: Math.PI / 5, shade: 0.97 },
  ];

  const segU = 4;
  const segV = 4;
  let vertOffset = 0;

  for (const w of whorls) {
    for (let p = 0; p < w.count; p++) {
      const azimuth = (p / w.count) * Math.PI * 2 + w.angleOffset;
      const cosA = Math.cos(azimuth);
      const sinA = Math.sin(azimuth);

      for (let iv = 0; iv <= segV; iv++) {
        const v = iv / segV; // 0 (center) -> 1 (petal tip)
        // Fan-shaped petal width with ruffled/notched tip
        const width = 0.018 * Math.sin(Math.pow(v, 0.7) * Math.PI * 0.85) + 0.004 * v;

        for (let iu = 0; iu <= segU; iu++) {
          const u = (iu / segU) * 2 - 1; // -1..1
          const absU = Math.abs(u);

          // Ruffled notched outer edge
          const ruffle = v > 0.65 ? Math.sin(u * Math.PI * 2.5) * 0.0025 * (v - 0.65) : 0;
          const radial = v * w.radius + ruffle;
          const localZ = u * width;
          const localY =
            Math.sin(v * Math.PI * 0.65) * w.lift * w.tilt +
            absU * absU * 0.0035 * v +
            0.004;

          const x = radial * cosA - localZ * sinA;
          const z = radial * sinA + localZ * cosA;
          const y = localY;

          positions.push(x, y, z);

          // Subtle warm creamy-greenish tint deep in the throat, pure white/tint at outer petals
          const throat = Math.exp(-v * 4.5);
          const r = THREE.MathUtils.lerp(w.shade, 0.96, throat);
          const g = THREE.MathUtils.lerp(w.shade, 0.95, throat);
          const b = THREE.MathUtils.lerp(w.shade, 0.82, throat);
          colors.push(r, g, b);
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

      vertOffset += (segU + 1) * (segV + 1);
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
 * Generates an airy, connected dichotomous panicle of branches, florets, and buds.
 */
function generatePanicleData(): {
  segments: Segment[];
  openFlorets: TipNode[];
  buds: TipNode[];
} {
  const segments: Segment[] = [];
  const openFlorets: TipNode[] = [];
  const buds: TipNode[] = [];

  const rootBase = new THREE.Vector3(0, -0.05, 0);
  const rootSplit = new THREE.Vector3(0, 0.1, 0);
  segments.push({ start: rootBase, end: rootSplit, rBottom: 0.013, rTop: 0.01 });

  // 4 primary forks from the main stem + 1 upper central continuation
  const primaryConfigs = [
    { startY: 0.08, az: 0.2, tilt: 0.58, len: 0.16 },
    { startY: 0.1, az: 2.3, tilt: 0.55, len: 0.17 },
    { startY: 0.12, az: 4.4, tilt: 0.52, len: 0.16 },
    { startY: 0.14, az: 1.25, tilt: 0.34, len: 0.19 },
    { startY: 0.15, az: 3.4, tilt: 0.28, len: 0.21 },
  ];

  // Central stem continuation from 0.10 to 0.16
  segments.push({
    start: rootSplit,
    end: new THREE.Vector3(0, 0.16, 0),
    rBottom: 0.01,
    rTop: 0.0075,
  });

  primaryConfigs.forEach((p, pi) => {
    const pStart = new THREE.Vector3(0, p.startY, 0);
    const pDir = new THREE.Vector3(
      Math.sin(p.tilt) * Math.cos(p.az),
      Math.cos(p.tilt),
      Math.sin(p.tilt) * Math.sin(p.az)
    ).normalize();
    const pEnd = pStart.clone().addScaledVector(pDir, p.len);

    segments.push({ start: pStart, end: pEnd, rBottom: 0.007, rTop: 0.0048 });

    // Split each primary branch into 2-3 secondary dichotomous forks
    const secCount = 3;
    for (let si = 0; si < secCount; si++) {
      const seed = pi * 17 + si * 7 + 1;
      const sAz = p.az + (si - 1) * 1.15 + hashSigned(seed) * 0.28;
      const sTilt = p.tilt * 0.85 + 0.22 + hashSigned(seed + 1) * 0.12;
      const sLen = 0.095 + hashSigned(seed + 2) * 0.022;

      const sDir = new THREE.Vector3(
        Math.sin(sTilt) * Math.cos(sAz),
        Math.cos(sTilt),
        Math.sin(sTilt) * Math.sin(sAz)
      ).normalize();
      const sEnd = pEnd.clone().addScaledVector(sDir, sLen);

      segments.push({ start: pEnd, end: sEnd, rBottom: 0.0044, rTop: 0.0028 });

      // Tertiary pedicels leading directly to florets & buds
      const pedCount = 2 + (si % 2);
      for (let ti = 0; ti < pedCount; ti++) {
        const tSeed = seed * 13 + ti * 5;
        const tAz = sAz + (ti - 0.5) * 1.45 + hashSigned(tSeed) * 0.35;
        const tTilt = 0.35 + Math.abs(hashSigned(tSeed + 1)) * 0.55;
        const tLen = 0.055 + hashSigned(tSeed + 2) * 0.016;

        const tDir = new THREE.Vector3(
          Math.sin(tTilt) * Math.cos(tAz),
          Math.cos(tTilt),
          Math.sin(tTilt) * Math.sin(tAz)
        ).normalize();
        const tEnd = sEnd.clone().addScaledVector(tDir, tLen);

        segments.push({ start: sEnd, end: tEnd, rBottom: 0.0026, rTop: 0.0018 });

        const isBud = (pi + si + ti) % 3 === 1;
        const node: TipNode = {
          pos: tEnd,
          dir: tDir,
          scale: isBud ? 0.85 + hashSigned(tSeed + 3) * 0.18 : 0.9 + hashSigned(tSeed + 3) * 0.22,
          isBud,
        };
        if (isBud) {
          buds.push(node);
        } else {
          openFlorets.push(node);
        }
      }
    }
  });

  return { segments, openFlorets, buds };
}

export const BabysBreathMesh: React.FC<BabysBreathMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  const { branchGeo, blossomGeo, calyxGeo, budGeo, openFlorets, buds } = useMemo(() => {
    const data = generatePanicleData();
    const bGeo = buildPanicleSkeleton(data.segments);
    const flGeo = createGypsophilaBlossomGeometry();

    // Cupped green calyx sitting right beneath each blossom/bud
    const calGeo = new THREE.CylinderGeometry(0.011, 0.0032, 0.014, 7, 1, false);
    calGeo.translate(0, -0.002, 0);

    // Tight oval bud sitting atop its calyx
    const bdGeo = new THREE.SphereGeometry(0.013, 8, 7);
    bdGeo.scale(0.88, 1.15, 0.88);
    bdGeo.translate(0, 0.012, 0);

    return {
      branchGeo: bGeo,
      blossomGeo: flGeo,
      calyxGeo: calGeo,
      budGeo: bdGeo,
      openFlorets: data.openFlorets,
      buds: data.buds,
    };
  }, []);

  useEffect(() => {
    return () => {
      branchGeo.dispose();
      blossomGeo.dispose();
      calyxGeo.dispose();
      budGeo.dispose();
    };
  }, [branchGeo, blossomGeo, calyxGeo, budGeo]);

  const blossomRef = useRef<THREE.InstancedMesh>(null);
  const openCalyxRef = useRef<THREE.InstancedMesh>(null);
  const budRef = useRef<THREE.InstancedMesh>(null);
  const budCalyxRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);

    if (blossomRef.current && openCalyxRef.current) {
      openFlorets.forEach((f, i) => {
        dummy.position.copy(f.pos);
        dummy.quaternion.setFromUnitVectors(up, f.dir);
        dummy.scale.setScalar(f.scale);
        dummy.updateMatrix();
        blossomRef.current!.setMatrixAt(i, dummy.matrix);
        openCalyxRef.current!.setMatrixAt(i, dummy.matrix);
      });
      blossomRef.current.instanceMatrix.needsUpdate = true;
      openCalyxRef.current.instanceMatrix.needsUpdate = true;
    }

    if (budRef.current && budCalyxRef.current) {
      buds.forEach((b, i) => {
        dummy.position.copy(b.pos);
        dummy.quaternion.setFromUnitVectors(up, b.dir);
        dummy.scale.setScalar(b.scale);
        dummy.updateMatrix();
        budRef.current!.setMatrixAt(i, dummy.matrix);
        budCalyxRef.current!.setMatrixAt(i, dummy.matrix);
      });
      budRef.current.instanceMatrix.needsUpdate = true;
      budCalyxRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [openFlorets, buds]);

  return (
    <group>
      {/* 3D Curved Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#4d6844" radius={0.015} />

      {/* Connected Dichotomous Gypsophila Panicle */}
      <group position={position} rotation={rotation} scale={scale}>
        {/* All branching twigs & pedicels */}
        <mesh geometry={branchGeo} castShadow receiveShadow>
          <meshStandardMaterial color="#556e48" roughness={0.72} />
        </mesh>

        {/* Open double-ruffled blossoms */}
        <instancedMesh
          ref={blossomRef}
          args={[blossomGeo, undefined, openFlorets.length]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={color}
            vertexColors
            roughness={0.45}
            metalness={0.02}
            side={THREE.DoubleSide}
          />
        </instancedMesh>

        {/* Green calyces for open blossoms */}
        <instancedMesh
          ref={openCalyxRef}
          args={[calyxGeo, undefined, openFlorets.length]}
          castShadow
        >
          <meshStandardMaterial color="#607d4f" roughness={0.68} />
        </instancedMesh>

        {/* Closed / half-open buds */}
        <instancedMesh
          ref={budRef}
          args={[budGeo, undefined, buds.length]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={color} roughness={0.42} metalness={0.02} />
        </instancedMesh>

        {/* Green calyces for buds */}
        <instancedMesh
          ref={budCalyxRef}
          args={[calyxGeo, undefined, buds.length]}
          castShadow
        >
          <meshStandardMaterial color="#607d4f" roughness={0.68} />
        </instancedMesh>
      </group>
    </group>
  );
};
