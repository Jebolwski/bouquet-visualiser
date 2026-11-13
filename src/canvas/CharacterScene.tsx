import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useBouquetStore } from '@/store/useBouquetStore';
import { BouquetArrangement } from './BouquetArrangement';

const LED_POS = new THREE.Vector3(2.4, 6.2, 2.8);
const LED_TARGET = new THREE.Vector3(0, 0.85, 0);

/**
 * Angled overhead LED spotlight for Dramatik Noir mode:
 * - SpotLight explicitly aimed at the upper bouquet crown (0, 0.85, 0)
 * - Soft additive volumetric beam cone with Fresnel + vertical fade
 */
const NoirLedSpotlight: React.FC = () => {
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetObj = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.copy(LED_TARGET);
    return obj;
  }, []);

  useEffect(() => {
    if (spotRef.current) {
      spotRef.current.target = targetObj;
    }
  }, [targetObj]);

  const { beamPosition, beamQuaternion, beamLength, beamMaterial } = useMemo(() => {
    const dir = LED_TARGET.clone().sub(LED_POS);
    const len = dir.length() + 1.4; // extend slightly past bouquet toward podium
    const dirNorm = dir.clone().normalize();
    const pos = LED_POS.clone().addScaledVector(dirNorm, len * 0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      dirNorm
    );

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color('#eef4ff') },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewPos;
        void main() {
          vUv = uv;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          vNormalView = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewPos;
        void main() {
          // vUv.y = 1 at top (LED source), 0 at bottom
          float verticalFade = smoothstep(0.0, 0.55, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
          vec3 viewDir = normalize(vViewPos);
          float edgeFade = pow(abs(dot(normalize(vNormalView), viewDir)), 1.8);
          float alpha = verticalFade * edgeFade * 0.085;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    return {
      beamPosition: pos,
      beamQuaternion: quat,
      beamLength: len,
      beamMaterial: mat,
    };
  }, []);

  useEffect(() => {
    return () => {
      beamMaterial.dispose();
    };
  }, [beamMaterial]);

  return (
    <>
      <primitive object={targetObj} />

      {/* Main angled overhead LED SpotLight */}
      <spotLight
        ref={spotRef}
        position={[LED_POS.x, LED_POS.y, LED_POS.z]}
        angle={0.42}
        penumbra={0.55}
        intensity={48}
        decay={1}
        distance={20}
        color="#f8fbff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00015}
      />

      {/* Overhead LED fill so top of petals & leaves catch crisp light */}
      <directionalLight
        position={[1.2, 7.0, 1.6]}
        intensity={1.55}
        color="#f5f8ff"
      />

      {/* Soft atmospheric LED beam cone */}
      <mesh position={beamPosition} quaternion={beamQuaternion}>
        <cylinderGeometry args={[0.16, 2.35, beamLength, 48, 1, true]} />
        <primitive object={beamMaterial} attach="material" />
      </mesh>
    </>
  );
};

export const CharacterScene: React.FC = () => {
  const bouquetGroupRef = useRef<THREE.Group>(null);
  const pedestalRef = useRef<THREE.Group>(null);
  const sceneSettings = useBouquetStore((state) => state.scene);

  // Auto-rotate bouquet & hide pedestal when camera is below it for low-angle upward shots
  useFrame((state, delta) => {
    if (sceneSettings.autoRotate && bouquetGroupRef.current) {
      bouquetGroupRef.current.rotation.y += delta * sceneSettings.rotationSpeed;
    }
    if (pedestalRef.current) {
      pedestalRef.current.visible = state.camera.position.y > -1.82;
    }
  });

  // Lighting parameters based on preset
  const lighting = sceneSettings.lighting;

  return (
    <>
      {/* Dynamic Lighting System */}
      {lighting === 'studio' && (
        <>
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.8}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
            shadow-camera-near={0.5}
            shadow-camera-far={25}
            shadow-camera-left={-4}
            shadow-camera-right={4}
            shadow-camera-top={4}
            shadow-camera-bottom={-4}
          />
          {/* Fill Light */}
          <directionalLight position={[-6, 4, -4]} intensity={0.7} color="#f0f4f8" />
          {/* Rim Light */}
          <directionalLight position={[0, 6, -6]} intensity={1.2} color="#ffffff" />
        </>
      )}

      {lighting === 'golden_hour' && (
        <>
          <ambientLight intensity={0.65} color="#ffd8be" />
          <directionalLight
            position={[6, 5, 4]}
            intensity={2.2}
            color="#ffaa5e"
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-5, 3, -4]} intensity={0.8} color="#9d4edd" />
          <pointLight position={[0, 4, 2]} intensity={0.8} color="#ffbe0b" />
        </>
      )}

      {lighting === 'soft_pastel' && (
        <>
          <ambientLight intensity={1.1} color="#fbf7f4" />
          <directionalLight
            position={[4, 7, 6]}
            intensity={1.2}
            color="#fff0f3"
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-4, 5, -4]} intensity={0.6} color="#e0fbfc" />
        </>
      )}

      {lighting === 'dramatic_noir' && (
        <>
          {/* Deep dark studio ambience */}
          <ambientLight intensity={0.28} color="#9aa8c7" />

          {/* Angled Overhead LED Spotlight + subtle volumetric beam */}
          <NoirLedSpotlight />

          {/* Crisp cool LED rim/backlight tracing petal and paper silhouettes */}
          <directionalLight
            position={[-3.2, 4.2, -3.6]}
            intensity={1.1}
            color="#8ab4ff"
          />

          {/* Subtle warm bounce fill from below-front so dark velvet petals keep detail */}
          <directionalLight
            position={[-1.6, 0.6, 3.4]}
            intensity={0.45}
            color="#ffe8d6"
          />
        </>
      )}

      {/* Subtle Studio Backdrop Pedestal */}
      <group ref={pedestalRef} position={[0, -1.9, 0]}>
        {/* Cylindrical Podium */}
        <mesh receiveShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[2.2, 2.4, 0.3, 48]} />
          <meshStandardMaterial
            color={lighting === 'dramatic_noir' ? '#1c1b21' : '#f7f5f0'}
            roughness={lighting === 'dramatic_noir' ? 0.55 : 0.7}
            metalness={lighting === 'dramatic_noir' ? 0.15 : 0.05}
          />
        </mesh>

        {/* Podium Base Trim */}
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[2.45, 2.5, 0.08, 48]} />
          <meshStandardMaterial
            color={lighting === 'dramatic_noir' ? '#121116' : '#dfd9cd'}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* Soft Contact Shadows on Podium */}
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.6}
          scale={5.5}
          blur={1.8}
          far={3.0}
        />
      </group>

      {/* Main Bouquet Container with Float effect */}
      <Float
        speed={1.2}
        rotationIntensity={0.05}
        floatIntensity={0.08}
        floatingRange={[-0.04, 0.04]}
      >
        <group ref={bouquetGroupRef}>
          <BouquetArrangement />
        </group>
      </Float>
    </>
  );
};
