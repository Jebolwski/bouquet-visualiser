import React, { useMemo } from 'react';
import * as THREE from 'three';
import { FlowerTransform } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface DaisyMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

export const DaisyMesh: React.FC<DaisyMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  // 24 radiating petals
  const petals = useMemo(() => {
    const count = 24;
    return Array.from({ length: count }, (_, i) => ({
      angle: (i * Math.PI * 2) / count,
      tilt: 0.12 + (i % 3) * 0.03, // Slight natural droop
      length: 0.32 + ((i * 7) % 5) * 0.015,
    }));
  }, []);

  return (
    <group>
      {/* 3D Curved Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#3a5c2d" radius={0.018} />

      {/* Flower Head (scaled to natural proportion relative to tulips & roses) */}
      <group position={position} rotation={rotation} scale={scale * 0.48}>
        {/* Calyx green base */}
        <mesh position={[0, -0.04, 0]} castShadow>
          <sphereGeometry args={[0.08, 12, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
          <meshStandardMaterial color="#2d4a23" roughness={0.7} />
        </mesh>

        {/* Central Yellow Floret Disc */}
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.095, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial
            color="#fca311"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Radiating Petals */}
        {petals.map((p, idx) => (
          <group key={idx} rotation={[0, p.angle, 0]}>
            <mesh
              position={[0.09 + p.length * 0.5, 0.01, 0]}
              rotation={[0, 0, -p.tilt]}
              scale={[p.length, 0.015, 0.065]}
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial
                color={color}
                roughness={0.4}
                metalness={0.05}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}

        {/* Small delicate upper stem leaf */}
        <group position={[0.015, -0.05, 0]} rotation={[0.12, 0, 0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.008, 0.025, 0.10, 6]} />
            <meshStandardMaterial color="#3a5c2d" roughness={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
