import React, { useMemo } from 'react';
import * as THREE from 'three';
import { FlowerTransform } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface BabysBreathMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

export const BabysBreathMesh: React.FC<BabysBreathMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  // Cloud spray of tiny florets on branching twigs
  const florets = useMemo(() => {
    const list = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const radius = 0.12 + (i % 6) * 0.045;
      const angle = (i * 2.39996) + 0.3; // Golden angle spray
      const height = -0.1 + (i / count) * 0.55 + ((i % 4) - 2) * 0.05;
      const floretSize = 0.024 + (i % 3) * 0.008;

      list.push({
        x: Math.cos(angle) * radius,
        y: height,
        z: Math.sin(angle) * radius,
        size: floretSize,
      });
    }
    return list;
  }, []);

  return (
    <group>
      {/* 3D Curved Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#4b6843" radius={0.016} />

      {/* Cloud Spray */}
      <group position={position} rotation={rotation} scale={scale}>
        {/* Main central twig */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.008, 0.014, 0.6, 6]} />
          <meshStandardMaterial color="#4b6843" roughness={0.7} />
        </mesh>

        {/* Tiny white cloud florets */}
        {florets.map((f, idx) => (
          <group key={idx} position={[f.x, f.y, f.z]}>
            <mesh castShadow receiveShadow>
              <dodecahedronGeometry args={[f.size, 0]} />
              <meshStandardMaterial
                color={color}
                roughness={0.4}
                metalness={0.05}
              />
            </mesh>
            {/* Tiny connection filament */}
            <mesh position={[-f.x * 0.3, -f.y * 0.3, -f.z * 0.3]}>
              <cylinderGeometry args={[0.003, 0.004, 0.08, 4]} />
              <meshStandardMaterial color="#55754c" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
