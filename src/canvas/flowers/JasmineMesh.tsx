import React, { useMemo } from 'react';
import * as THREE from 'three';
import { FlowerTransform } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface JasmineMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

// Single star-shaped Jasmine bloom component
const SingleJasmineBloom: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  color: string;
}> = ({ position, rotation, scale = 1, color }) => {
  // 5 star petals
  const petals = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 5;
      return {
        angle,
        tilt: 0.14 + (i % 2) * 0.04,
      };
    });
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 1. Slender corolla tube (floral calyx tube) */}
      <mesh position={[0, -0.06, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.14, 8]} />
        <meshStandardMaterial color="#446a36" roughness={0.6} />
      </mesh>

      {/* 2. Tiny green sepal teeth around base of tube */}
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
          <mesh position={[0.02, -0.12, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.005, 0.04, 4]} />
            <meshStandardMaterial color="#36572a" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 3. Golden-yellow eye / stamen core */}
      <mesh position={[0, 0.015, 0]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#f7b731" roughness={0.5} />
      </mesh>

      {/* 4. Five Star-Shaped Spreading Petals */}
      {petals.map((p, idx) => (
        <group key={idx} rotation={[0, p.angle, 0]}>
          <mesh
            position={[0.065, 0.01, 0]}
            rotation={[0, 0, -p.tilt]}
            scale={[0.068, 0.008, 0.038]}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial
              color={color}
              roughness={0.4}
              metalness={0.04}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Unopened pointed Jasmine flower bud
const JasmineBud: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}> = ({ position, rotation, color }) => {
  return (
    <group position={position} rotation={rotation} scale={0.75}>
      {/* Green calyx tube */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.012, 0.015, 0.1, 6]} />
        <meshStandardMaterial color="#446a36" roughness={0.65} />
      </mesh>
      {/* Pointed spiraled bud tip */}
      <mesh position={[0, 0.04, 0]}>
        <coneGeometry args={[0.022, 0.12, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
};

export const JasmineMesh: React.FC<JasmineMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  return (
    <group>
      {/* 3D Curved Main Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#3e5f2d" radius={0.019} />

      {/* Jasmine Sprig Head (Terminal Flower + 2 Side Blooms & Buds) */}
      <group position={position} rotation={rotation} scale={scale}>
        {/* Central main stem connector */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.01, 0.016, 0.35, 6]} />
          <meshStandardMaterial color="#3e5f2d" roughness={0.7} />
        </mesh>

        {/* 1. Terminal Central Jasmine Star Flower */}
        <SingleJasmineBloom
          position={[0, 0.28, 0]}
          rotation={[0.1, 0.2, -0.05]}
          scale={1.05}
          color={color}
        />

        {/* 2. Left side open bloom */}
        <group position={[-0.12, 0.16, 0.05]} rotation={[-0.2, -0.4, 0.55]}>
          {/* Side twig */}
          <mesh position={[0.06, -0.08, 0]}>
            <cylinderGeometry args={[0.007, 0.009, 0.18, 5]} />
            <meshStandardMaterial color="#446a36" roughness={0.7} />
          </mesh>
          <SingleJasmineBloom
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={0.9}
            color={color}
          />
        </group>

        {/* 3. Right side bloom / bud */}
        <group position={[0.13, 0.14, -0.04]} rotation={[0.25, 0.5, -0.5]}>
          <mesh position={[-0.06, -0.07, 0]}>
            <cylinderGeometry args={[0.007, 0.009, 0.16, 5]} />
            <meshStandardMaterial color="#446a36" roughness={0.7} />
          </mesh>
          <SingleJasmineBloom
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={0.85}
            color={color}
          />
        </group>

        {/* 4. Sweet little pointed jasmine bud popping out */}
        <JasmineBud
          position={[-0.07, 0.35, -0.06]}
          rotation={[-0.3, -0.2, 0.35]}
          color={color}
        />

        {/* 5. Opposite Glossy Jasmine Leaves */}
        <group position={[0.05, -0.15, 0]} rotation={[0.3, 0.5, -0.6]}>
          <mesh scale={[0.14, 0.01, 0.07]} castShadow receiveShadow>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#2d4f24" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group position={[-0.05, -0.18, 0]} rotation={[-0.2, -0.6, 0.7]}>
          <mesh scale={[0.13, 0.01, 0.065]} castShadow receiveShadow>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#2d4f24" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group position={[0, -0.45, 0.04]} rotation={[0.5, 0.1, 0.5]}>
          <mesh scale={[0.15, 0.01, 0.075]} castShadow receiveShadow>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#2d4f24" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
