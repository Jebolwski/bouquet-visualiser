import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { FlowerTransform } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface EucalyptusMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

interface LeafPlacement {
  pos: [number, number, number];
  rot: [number, number, number];
  leafScale: number;
  petioleLength: number;
  petioleDir: [number, number, number];
  shade: number;
}

/**
 * Builds a high-resolution Silver-Dollar Eucalyptus leaf BufferGeometry
 * with a rounded-ovate silhouette, subtle cordate base, midrib V-fold,
 * gentle longitudinal arch, and vertex-colored midrib/lateral veins.
 * Leaf base sits at (0, 0, 0) and extends along +Z.
 */
function createEucalyptusLeafGeometry(): THREE.BufferGeometry {
  const segU = 14; // across width (-1 to +1)
  const segV = 16; // from base (0) to tip (1)
  const cols = segU + 1;
  const rows = segV + 1;

  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const length = 0.28;
  const maxHalfWidth = 0.135;

  for (let iv = 0; iv < rows; iv++) {
    const v = iv / segV; // 0 (base) -> 1 (tip)
    // Broad rounded-ovate / silver-dollar profile
    const widthProfile =
      Math.sin(Math.pow(v, 0.72) * Math.PI) * (0.88 + 0.18 * Math.sin(v * Math.PI));

    for (let iu = 0; iu < cols; iu++) {
      const u = (iu / segU) * 2 - 1; // -1 -> +1
      const absU = Math.abs(u);

      // Subtle cordate (heart-like) indent at base & soft rounded tip
      const baseIndent = (1 - v) * (1 - v) * 0.025 * (1 - absU * absU);
      const x = u * maxHalfWidth * widthProfile;
      const z = v * length - baseIndent;

      // Midrib V-fold + gentle longitudinal arch + subtle margin wave
      const midribFold = Math.pow(absU, 1.35) * 0.028 * Math.sin(v * Math.PI);
      const arch = -0.042 * Math.pow(v, 1.85) + 0.012 * Math.sin(v * Math.PI);
      const edgeWave =
        Math.sin(v * Math.PI * 3.0 + (u > 0 ? 0.5 : -0.5)) * 0.0045 * absU * widthProfile;
      const y = midribFold + arch + edgeWave;

      positions.push(x, y, z);
      uvs.push((u + 1) * 0.5, v);

      // Vertex colors: pale silvery-sage midrib + delicate lateral veins + dusty bloom
      const midribMask = Math.exp(-Math.pow(absU / 0.075, 2)) * (1 - v * 0.45);
      // Angled lateral veins branching from midrib
      const veinCoord = (v * 5.2 - absU * 1.45) * Math.PI;
      const lateralVein =
        Math.pow(Math.max(0, Math.cos(veinCoord)), 10) *
        Math.exp(-absU * 1.2) *
        Math.sin(v * Math.PI);

      const veinStrength = Math.min(1, midribMask * 0.85 + lateralVein * 0.42);
      // Base dusty-sage vs pale silvery-green veins (multiplied with material color)
      const baseTone = 0.84 + 0.1 * (1 - absU) + 0.06 * v;
      const r = THREE.MathUtils.lerp(baseTone * 0.94, 1.0, veinStrength);
      const g = THREE.MathUtils.lerp(baseTone * 1.0, 1.0, veinStrength);
      const b = THREE.MathUtils.lerp(baseTone * 0.96, 0.98, veinStrength);
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
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a gently curved main twig + two delicate side shoots for realistic branching.
 */
function createTwigGeometry(points: THREE.Vector3[], radiusStart: number, radiusEnd: number): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points);
  const tubularSegments = 16;
  const radialSegments = 7;
  const geo = new THREE.TubeGeometry(curve, tubularSegments, radiusStart, radialSegments, false);

  // Taper radius smoothly toward the tip
  const pos = geo.attributes.position;
  const ringVerts = radialSegments + 1;
  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const center = curve.getPointAt(t);
    const taper = THREE.MathUtils.lerp(1.0, radiusEnd / radiusStart, t);
    for (let j = 0; j < ringVerts; j++) {
      const idx = i * ringVerts + j;
      const vx = pos.getX(idx) - center.x;
      const vy = pos.getY(idx) - center.y;
      const vz = pos.getZ(idx) - center.z;
      pos.setXYZ(idx, center.x + vx * taper, center.y + vy * taper, center.z + vz * taper);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

export const EucalyptusMesh: React.FC<EucalyptusMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  const leafGeo = useMemo(() => createEucalyptusLeafGeometry(), []);

  const { mainTwigGeo, leftShootGeo, rightShootGeo } = useMemo(() => {
    const main = createTwigGeometry(
      [
        new THREE.Vector3(0, -0.06, 0),
        new THREE.Vector3(0.01, 0.12, 0.015),
        new THREE.Vector3(-0.012, 0.3, -0.01),
        new THREE.Vector3(0.008, 0.48, 0.012),
      ],
      0.015,
      0.006
    );
    const left = createTwigGeometry(
      [
        new THREE.Vector3(0.004, 0.14, 0.01),
        new THREE.Vector3(-0.06, 0.25, 0.05),
        new THREE.Vector3(-0.12, 0.36, 0.09),
      ],
      0.009,
      0.0045
    );
    const right = createTwigGeometry(
      [
        new THREE.Vector3(-0.005, 0.22, -0.005),
        new THREE.Vector3(0.065, 0.33, -0.045),
        new THREE.Vector3(0.115, 0.43, -0.075),
      ],
      0.0085,
      0.0045
    );
    return { mainTwigGeo: main, leftShootGeo: left, rightShootGeo: right };
  }, []);

  useEffect(() => {
    return () => {
      leafGeo.dispose();
      mainTwigGeo.dispose();
      leftShootGeo.dispose();
      rightShootGeo.dispose();
    };
  }, [leafGeo, mainTwigGeo, leftShootGeo, rightShootGeo]);

  // Natural alternating/sub-opposite silver-dollar leaves with petioles
  const leaves: LeafPlacement[] = useMemo(
    () => [
      // Lower-mid main stem (broad mature leaves)
      {
        pos: [0.008, 0.06, 0.008],
        rot: [0.38, 0.4, -0.22],
        leafScale: 1.05,
        petioleLength: 0.055,
        petioleDir: [0.35, 0.35, 0.85],
        shade: 0.94,
      },
      {
        pos: [0.008, 0.08, 0.008],
        rot: [0.32, 3.35, 0.2],
        leafScale: 1.0,
        petioleLength: 0.055,
        petioleDir: [-0.25, 0.35, -0.88],
        shade: 0.92,
      },
      // Mid main stem
      {
        pos: [0.0, 0.19, 0.004],
        rot: [0.28, 1.85, -0.18],
        leafScale: 0.96,
        petioleLength: 0.05,
        petioleDir: [0.85, 0.35, -0.25],
        shade: 0.98,
      },
      {
        pos: [-0.004, 0.24, -0.002],
        rot: [0.25, -1.35, 0.16],
        leafScale: 0.92,
        petioleLength: 0.048,
        petioleDir: [-0.85, 0.35, 0.2],
        shade: 0.96,
      },
      // Upper main stem
      {
        pos: [-0.006, 0.35, -0.004],
        rot: [0.2, 0.25, -0.12],
        leafScale: 0.84,
        petioleLength: 0.042,
        petioleDir: [0.25, 0.4, 0.85],
        shade: 1.02,
      },
      {
        pos: [0.0, 0.4, 0.004],
        rot: [0.22, 3.1, 0.14],
        leafScale: 0.78,
        petioleLength: 0.038,
        petioleDir: [0.05, 0.45, -0.85],
        shade: 1.04,
      },
      // Crown tip budding pair
      {
        pos: [0.006, 0.46, 0.01],
        rot: [-0.25, 0.9, -0.15],
        leafScale: 0.62,
        petioleLength: 0.028,
        petioleDir: [0.5, 0.65, 0.45],
        shade: 1.08,
      },
      {
        pos: [0.008, 0.48, 0.012],
        rot: [-0.35, -2.1, 0.15],
        leafScale: 0.54,
        petioleLength: 0.024,
        petioleDir: [-0.5, 0.7, -0.4],
        shade: 1.1,
      },
      // Left side shoot leaves
      {
        pos: [-0.06, 0.25, 0.05],
        rot: [0.35, -0.75, 0.2],
        leafScale: 0.86,
        petioleLength: 0.045,
        petioleDir: [-0.65, 0.35, 0.65],
        shade: 0.97,
      },
      {
        pos: [-0.095, 0.31, 0.072],
        rot: [0.22, -2.25, -0.18],
        leafScale: 0.76,
        petioleLength: 0.04,
        petioleDir: [-0.75, 0.4, -0.45],
        shade: 1.03,
      },
      {
        pos: [-0.12, 0.36, 0.09],
        rot: [-0.15, -0.95, 0.1],
        leafScale: 0.66,
        petioleLength: 0.03,
        petioleDir: [-0.7, 0.55, 0.4],
        shade: 1.08,
      },
      // Right side shoot leaves
      {
        pos: [0.065, 0.33, -0.045],
        rot: [0.32, 2.35, -0.2],
        leafScale: 0.84,
        petioleLength: 0.042,
        petioleDir: [0.65, 0.35, -0.65],
        shade: 0.99,
      },
      {
        pos: [0.095, 0.38, -0.062],
        rot: [0.18, 0.95, 0.16],
        leafScale: 0.74,
        petioleLength: 0.036,
        petioleDir: [0.75, 0.45, 0.45],
        shade: 1.04,
      },
      {
        pos: [0.115, 0.43, -0.075],
        rot: [-0.18, 2.05, -0.1],
        leafScale: 0.62,
        petioleLength: 0.028,
        petioleDir: [0.7, 0.55, -0.4],
        shade: 1.09,
      },
    ],
    []
  );

  // Precompute petiole transforms & per-leaf tinted color
  const renderedLeaves = useMemo(() => {
    const baseCol = new THREE.Color(color);
    return leaves.map((leaf) => {
      const dir = new THREE.Vector3(...leaf.petioleDir).normalize();
      const petioleMid = new THREE.Vector3(...leaf.pos).addScaledVector(
        dir,
        leaf.petioleLength * 0.5
      );
      const petioleQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir
      );
      const leafOrigin = new THREE.Vector3(...leaf.pos).addScaledVector(
        dir,
        leaf.petioleLength
      );
      const leafColor = baseCol.clone().multiplyScalar(leaf.shade);
      return {
        ...leaf,
        petioleMid: [petioleMid.x, petioleMid.y, petioleMid.z] as [number, number, number],
        petioleQuat,
        leafOrigin: [leafOrigin.x, leafOrigin.y, leafOrigin.z] as [number, number, number],
        leafColor: `#${leafColor.getHexString()}`,
      };
    });
  }, [color, leaves]);

  return (
    <group>
      {/* 3D Curved Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#4d6654" radius={0.02} />

      {/* Detailed Eucalyptus Sprig */}
      <group position={position} rotation={rotation} scale={scale}>
        {/* Main curved twig + two side shoots */}
        <mesh geometry={mainTwigGeo} castShadow receiveShadow>
          <meshStandardMaterial color="#556e5c" roughness={0.72} />
        </mesh>
        <mesh geometry={leftShootGeo} castShadow receiveShadow>
          <meshStandardMaterial color="#627d69" roughness={0.7} />
        </mesh>
        <mesh geometry={rightShootGeo} castShadow receiveShadow>
          <meshStandardMaterial color="#627d69" roughness={0.7} />
        </mesh>

        {/* Individual Petioles & Cupped/Veined Silver-Dollar Leaves */}
        {renderedLeaves.map((leaf, idx) => (
          <group key={idx}>
            {/* Slender pale-sage petiole connecting twig to leaf base */}
            <mesh position={leaf.petioleMid} quaternion={leaf.petioleQuat} castShadow>
              <cylinderGeometry args={[0.0032, 0.0046, leaf.petioleLength, 6]} />
              <meshStandardMaterial color="#758f7b" roughness={0.68} />
            </mesh>

            {/* Detailed Leaf Blade */}
            <mesh
              geometry={leafGeo}
              position={leaf.leafOrigin}
              rotation={leaf.rot}
              scale={leaf.leafScale}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={leaf.leafColor}
                vertexColors
                roughness={0.62}
                metalness={0.03}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
