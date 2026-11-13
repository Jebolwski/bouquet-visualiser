import React, { useMemo } from 'react';
import * as THREE from 'three';

interface StemCurveMeshProps {
  curvePoints: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];
  stemColor?: string;
  radius?: number;
}

export const StemCurveMesh: React.FC<StemCurveMeshProps> = ({
  curvePoints,
  stemColor = '#3a5a40',
  radius = 0.022,
}) => {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.25);
  }, [curvePoints]);

  return (
    <mesh castShadow receiveShadow>
      <tubeGeometry args={[curve, 32, radius, 8, false]} />
      <meshStandardMaterial
        color={stemColor}
        roughness={0.75}
        metalness={0.05}
      />
    </mesh>
  );
};
