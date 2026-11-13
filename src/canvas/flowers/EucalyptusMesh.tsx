import React, { useMemo } from 'react';
import * as THREE from 'three';
import { FlowerTransform } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface EucalyptusMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

export const EucalyptusMesh: React.FC<EucalyptusMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  // Pairs of round silver-dollar leaves along upper branch
  const leafNodes = useMemo(() => {
    const nodes = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      const height = 0.36 - i * 0.085; // From top down, lowest stays safely above wrapping rim
      const leafScale = 0.14 + (count - i) * 0.012;
      const angle = (i * Math.PI * 0.6) + 0.2;
      nodes.push({
        height,
        leafScale,
        angle,
      });
    }
    return nodes;
  }, []);

  return (
    <group>
      {/* 3D Curved Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#4a6352" radius={0.02} />

      {/* Foliage Sprig */}
      <group position={position} rotation={rotation} scale={scale}>
        {/* Central extension twig */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.012, 0.016, 0.52, 8]} />
          <meshStandardMaterial color="#4a6352" roughness={0.7} />
        </mesh>

        {/* Opposite round leaves */}
        {leafNodes.map((node, idx) => (
          <group key={idx} position={[0, node.height, 0]} rotation={[0, node.angle, 0]}>
            {/* Left leaf */}
            <group position={[0.08, 0, 0]} rotation={[0.2, 0.1, -0.2]}>
              <mesh scale={[node.leafScale, 0.01, node.leafScale * 0.85]} castShadow receiveShadow>
                <sphereGeometry args={[1, 12, 10]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.75}
                  metalness={0.02}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>

            {/* Right leaf */}
            <group position={[-0.08, 0, 0]} rotation={[-0.15, -0.2, 0.25]}>
              <mesh scale={[node.leafScale, 0.01, node.leafScale * 0.85]} castShadow receiveShadow>
                <sphereGeometry args={[1, 12, 10]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.75}
                  metalness={0.02}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          </group>
        ))}

        {/* Top budding leaf tip */}
        <mesh position={[0, 0.44, 0]} scale={[0.07, 0.01, 0.05]} castShadow>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
