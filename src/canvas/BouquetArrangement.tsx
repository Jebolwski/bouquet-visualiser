import React, { useMemo } from 'react';
import { useBouquetStore } from '@/store/useBouquetStore';
import { calculateBouquetLayout } from '@/utils/math';
import { RoseMesh } from './flowers/RoseMesh';
import { TulipMesh } from './flowers/TulipMesh';
import { DaisyMesh } from './flowers/DaisyMesh';
import { EucalyptusMesh } from './flowers/EucalyptusMesh';
import { BabysBreathMesh } from './flowers/BabysBreathMesh';
import { LavenderMesh } from './flowers/LavenderMesh';
import { JasmineMesh } from './flowers/JasmineMesh';
import { WrappingMesh } from './WrappingMesh';
import { RibbonMesh } from './RibbonMesh';
import { GreetingCardMesh } from './GreetingCardMesh';

export const BouquetArrangement: React.FC = () => {
  const flowers = useBouquetStore((state) => state.flowers);
  const scene = useBouquetStore((state) => state.scene);

  // Compute 3D Fibonacci spiral offsets for all flowers
  const arrangedFlowers = useMemo(() => {
    const totalCount = flowers.length;
    return flowers.map((flower, index) => {
      const transform = calculateBouquetLayout(
        index,
        totalCount,
        scene.arrangementStyle,
        scene.tightness,
        scene.stemSpread,
        scene.heightVariance
      );
      return {
        flower,
        transform,
      };
    });
  }, [
    flowers,
    scene.arrangementStyle,
    scene.tightness,
    scene.stemSpread,
    scene.heightVariance,
  ]);

  return (
    <group position={[0, -0.4, 0]}>
      {/* 1. Procedural Stems & Flower Heads */}
      {arrangedFlowers.map(({ flower, transform }) => {
        const key = flower.uid;

        switch (flower.type) {
          case 'rose':
            return (
              <RoseMesh
                key={key}
                color={flower.color}
                transform={transform}
                scale={flower.scale}
                stemLength={flower.stemLength}
              />
            );
          case 'tulip':
            return (
              <TulipMesh
                key={key}
                color={flower.color}
                transform={transform}
                scale={flower.scale}
              />
            );
          case 'daisy':
            return (
              <DaisyMesh
                key={key}
                color={flower.color}
                transform={transform}
                scale={flower.scale}
              />
            );
          case 'eucalyptus':
            return (
              <EucalyptusMesh
                key={key}
                color={flower.color}
                transform={transform}
                scale={flower.scale}
              />
            );
          case 'babys_breath':
            return (
              <BabysBreathMesh
                key={key}
                color={flower.color}
                transform={transform}
                scale={flower.scale}
              />
            );
          case 'lavender':
            return (
              <LavenderMesh
                key={key}
                color={flower.color}
                transform={transform}
                scale={flower.scale}
              />
            );
          case 'jasmine':
            return (
              <JasmineMesh
                key={key}
                color={flower.color}
                transform={transform}
                scale={flower.scale}
              />
            );
          default:
            return null;
        }
      })}

      {/* 2. Wrapping Paper (Newspaper, Kraft, Cellophane, etc.) */}
      <WrappingMesh />

      {/* 3. Ribbon Knot & Streamers */}
      <RibbonMesh />

      {/* 4. Greeting Card Tucked In */}
      <GreetingCardMesh />
    </group>
  );
};
