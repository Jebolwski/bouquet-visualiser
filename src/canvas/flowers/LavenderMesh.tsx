import React, { useMemo } from 'react';
import * as THREE from 'three';
import { FlowerTransform } from '@/utils/math';
import { StemCurveMesh } from './StemCurveMesh';

interface LavenderMeshProps {
  color: string;
  transform: FlowerTransform;
  scale?: number;
}

export const LavenderMesh: React.FC<LavenderMeshProps> = ({
  color,
  transform,
  scale = 1.0,
}) => {
  const { position, rotation, stemCurvePoints } = transform;

  // Florets arranged in whorled rings along the spike
  const whorls = useMemo(() => {
    const list = [];
    const tiers = 9;
    const baseColor = new THREE.Color(color);

    for (let t = 0; t < tiers; t++) {
      const height = t * 0.065;
      const tierFlorets = 5;
      const radius = 0.045 - t * 0.002; // Slight taper toward tip
      const tierColor = baseColor
        .clone()
        .offsetHSL(0, (t % 2) * 0.04, ((t % 3) - 1) * 0.04)
        .getHexString();

      for (let f = 0; f < tierFlorets; f++) {
        const angle = (f * Math.PI * 2) / tierFlorets + t * 0.4;
        list.push({
          x: Math.cos(angle) * radius,
          y: height,
          z: Math.sin(angle) * radius,
          rotY: angle,
          color: `#${tierColor}`,
        });
      }
    }
    return list;
  }, [color]);

  return (
    <group>
      {/* 3D Curved Stem */}
      <StemCurveMesh curvePoints={stemCurvePoints} stemColor="#3e5932" radius={0.018} />

      {/* Flower Spike */}
      <group position={position} rotation={rotation} scale={scale}>
        {/* Central spike rod */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.01, 0.016, 0.65, 8]} />
          <meshStandardMaterial color="#3e5932" roughness={0.7} />
        </mesh>

        {/* Whorled Florets */}
        {whorls.map((w, idx) => (
          <group key={idx} position={[w.x, w.y, w.z]} rotation={[0.2, w.rotY, 0]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshStandardMaterial
                color={w.color}
                roughness={0.5}
                metalness={0.05}
              />
            </mesh>
          </group>
        ))}

        {/* Slender lavender leaves hugging upper stem */}
        <group position={[0.012, -0.05, 0]} rotation={[0.1, 0.15, 0.15]}>
          <mesh scale={[0.01, 0.14, 0.005]} castShadow>
            <cylinderGeometry args={[1, 1, 1, 6]} />
            <meshStandardMaterial color="#476239" roughness={0.7} />
          </mesh>
        </group>
        <group position={[-0.012, -0.08, 0]} rotation={[-0.1, -0.15, -0.15]}>
          <mesh scale={[0.01, 0.12, 0.005]} castShadow>
            <cylinderGeometry args={[1, 1, 1, 6]} />
            <meshStandardMaterial color="#476239" roughness={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
