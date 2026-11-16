import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useBouquetStore } from '@/store/useBouquetStore';
import { isVaseWrapping } from '@/types';
import { BouquetArrangement } from './BouquetArrangement';

const LED_POS = new THREE.Vector3(1.55, 3.25, 1.35);
const LED_TARGET_WRAP = new THREE.Vector3(0, 0.85, 0);
const LED_TARGET_VASE = new THREE.Vector3(0, 0.0, 0);

const SUN_SKY_POS = new THREE.Vector3(4.8, 5.4, -8.8);
const SUNSET_SKY_POS = new THREE.Vector3(5.6, 1.5, -9.8);

/**
 * Full-360° procedural HD sky dome with atmospheric scattering, radiant sun,
 * and multi-octave billowy cumulus + wispy cirrus clouds (zero plane-edge clipping).
 */
const AtmosphericSkyDome: React.FC<{
  mode: 'sunlight' | 'sunset';
  sunPosition: THREE.Vector3;
  sunIntensity?: number;
}> = ({ mode, sunPosition, sunIntensity = 1.25 }) => {
  const material = useMemo(() => {
    const isSunset = mode === 'sunset';
    const sunDir = sunPosition.clone().normalize();

    return new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uSunDir: { value: sunDir },
        uTime: { value: 0 },
        uIsSunset: { value: isSunset ? 1.0 : 0.0 },
        uSunIntensity: { value: sunIntensity },
      },
      vertexShader: `
        varying vec3 vWorldDir;
        void main() {
          vWorldDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform float uTime;
        uniform float uIsSunset;
        uniform float uSunIntensity;
        varying vec3 vWorldDir;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }

        float fbm7(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
          for (int i = 0; i < 7; i++) {
            v += a * noise(p);
            p = rot * p * 2.03 + vec2(13.1, 7.7);
            a *= 0.5;
          }
          return v;
        }

        float billowyCloud(vec2 p) {
          float n = fbm7(p);
          float detail = fbm7(p * 2.6 + vec2(4.2, -3.1));
          // Cauliflower cumulus lobes
          float lobe = 1.0 - abs(detail * 2.0 - 1.0);
          return n * 0.72 + lobe * 0.28;
        }

        void main() {
          vec3 dir = normalize(vWorldDir);
          float h = clamp(dir.y, -0.15, 1.0);
          float sunDot = max(0.0, dot(dir, normalize(uSunDir)));

          // 1. Sky Gradient (Daylight vs Realistic Sunset)
          vec3 skyCol;
          if (uIsSunset > 0.5) {
            vec3 zenith = vec3(0.22, 0.21, 0.38);     // Deep twilight periwinkle
            vec3 midSky = vec3(0.76, 0.36, 0.49);     // Dusty rose-magenta
            vec3 horizon = vec3(0.98, 0.57, 0.36);    // Glowing coral-amber
            vec3 sunHorizon = vec3(1.0, 0.82, 0.44);  // Golden horizon band

            skyCol = mix(horizon, midSky, smoothstep(0.0, 0.34, h));
            skyCol = mix(skyCol, zenith, smoothstep(0.25, 0.85, h));
            // Warm horizontal glow near the setting sun
            skyCol = mix(skyCol, sunHorizon, pow(sunDot, 4.0) * smoothstep(0.45, -0.05, h) * 0.75);
          } else {
            vec3 zenith = vec3(0.16, 0.42, 0.76);     // Rich cerulean blue
            vec3 midSky = vec3(0.44, 0.70, 0.93);     // Clear sky blue
            vec3 horizon = vec3(0.86, 0.93, 0.98);    // Soft sunlit mist

            skyCol = mix(horizon, midSky, smoothstep(0.0, 0.28, h));
            skyCol = mix(skyCol, zenith, smoothstep(0.22, 0.85, h));
          }

          // 2. Radiant Atmospheric Sun
          float sunCore = smoothstep(0.9990, 0.99975, sunDot);
          float sunInner = pow(sunDot, 90.0);
          float sunCorona = pow(sunDot, 9.0);
          vec3 sunTint = uIsSunset > 0.5 ? vec3(1.0, 0.62, 0.25) : vec3(1.0, 0.92, 0.68);
          vec3 sunCoreCol = uIsSunset > 0.5 ? vec3(1.0, 0.94, 0.74) : vec3(1.0, 0.99, 0.95);
          float sunBoost = uIsSunset > 0.5 ? 1.0 : clamp(0.65 + uSunIntensity * 0.35, 0.5, 1.4);

          skyCol += sunTint * sunCorona * (uIsSunset > 0.5 ? 0.55 : 0.28) * sunBoost;
          skyCol += sunCoreCol * sunInner * 0.85 * sunBoost;
          skyCol = mix(skyCol, sunCoreCol * 1.15, sunCore);

          // 3. HD Multi-Octave Clouds (continuous spherical projection, zero edges)
          float horizonMask = smoothstep(-0.02, 0.16, dir.y);
          if (horizonMask > 0.005) {
            vec2 proj = dir.xz / (max(0.08, dir.y + 0.12));
            vec2 drift = vec2(uTime * 0.012, uTime * 0.004);

            if (uIsSunset > 0.5) {
              // Sunset: wispy horizontal cirrus + mid-altitude coral/gold clouds
              vec2 p1 = proj * vec2(0.75, 1.95) + drift + vec2(2.4, 1.1);
              vec2 p2 = proj * vec2(1.4, 2.8) + drift * 1.4 + vec2(-3.1, 4.2);
              float c1 = billowyCloud(p1);
              float c2 = fbm7(p2);
              float density = smoothstep(0.46, 0.76, c1 * 0.7 + c2 * 0.35) * horizonMask;

              // Self-shadowing toward sunset sun
              float cShadow = billowyCloud(p1 + normalize(uSunDir.xz) * 0.09);
              float lit = clamp((c1 - cShadow) * 4.5 + 0.55, 0.0, 1.0);
              float sunNear = pow(sunDot, 5.0);

              vec3 darkCloud = vec3(0.42, 0.26, 0.42);   // Deep twilight violet-mauve
              vec3 coralCloud = vec3(0.98, 0.50, 0.48);  // Glowing pink-coral underlit
              vec3 goldEdge = vec3(1.0, 0.84, 0.48);     // Fiery gold rim near sun

              vec3 cloudCol = mix(darkCloud, coralCloud, lit * 0.85 + 0.15);
              cloudCol = mix(cloudCol, goldEdge, clamp(lit * sunNear * 1.3 + sunNear * 0.45, 0.0, 1.0));
              skyCol = mix(skyCol, cloudCol, density * 0.86);
            } else {
              // Daylight: crisp HD cumulus clouds with sunlit tops & shaded bottoms
              vec2 p1 = proj * 0.85 + drift + vec2(1.7, -2.3);
              float c1 = billowyCloud(p1);
              float density = smoothstep(0.50, 0.74, c1) * horizonMask;

              // Directional sun self-shadowing inside the cloud
              float cShadow = billowyCloud(p1 + normalize(uSunDir.xz) * 0.10);
              float lit = clamp((c1 - cShadow) * 5.2 + 0.58, 0.0, 1.0);
              float silverLining = pow(sunDot, 10.0) * 0.45;

              vec3 shadowCol = vec3(0.68, 0.76, 0.86);   // Soft cool cumulus underside
              vec3 litCol = vec3(1.0, 0.995, 0.98);      // Crisp sunlit white
              vec3 cloudCol = mix(shadowCol, litCol, lit);
              cloudCol += vec3(1.0, 0.96, 0.86) * silverLining;

              skyCol = mix(skyCol, cloudCol, density * 0.94);
            }
          }

          gl_FragColor = vec4(skyCol, 1.0);
        }
      `,
    });
  }, [mode, sunPosition, sunIntensity]);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[42, 48, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const STAGE_LEFT_POS = new THREE.Vector3(-2.85, -1.76, 0);
const STAGE_RIGHT_POS = new THREE.Vector3(2.85, -1.76, 0);
const STAGE_TARGET_WRAP = new THREE.Vector3(0, 0.95, 0);
const STAGE_TARGET_VASE = new THREE.Vector3(0, 0.05, 0);

interface AimedSpotlightWithBeamProps {
  position: THREE.Vector3;
  target: THREE.Vector3;
  color: string;
  beamColor?: string;
  intensity: number;
  angle?: number;
  penumbra?: number;
  beamOpacity?: number;
  beamBottomRadius?: number;
  castShadow?: boolean;
  fixtureType?: 'stage' | 'ceiling';
}

/**
 * Physical black stage spotlight (PAR can + U-bracket yoke + base + glowing lens)
 * mounted at `position` and aimed directly at `target`.
 */
const StageSpotlightFixture: React.FC<{
  position: THREE.Vector3;
  target: THREE.Vector3;
  lensColor: string;
}> = ({ position, target, lensColor }) => {
  const { yaw, pitch } = useMemo(() => {
    const dir = target.clone().sub(position).normalize();
    return {
      yaw: Math.atan2(dir.x, dir.z),
      pitch: -Math.asin(THREE.MathUtils.clamp(dir.y, -0.99, 0.99)),
    };
  }, [position, target]);

  return (
    <group position={[position.x, position.y, position.z]} rotation={[0, yaw, 0]}>
      {/* Circular floor base */}
      <mesh position={[0, -0.22, 0]} receiveShadow>
        <cylinderGeometry args={[0.17, 0.19, 0.035, 32]} />
        <meshStandardMaterial color="#2a2c35" roughness={0.35} metalness={0.7} />
      </mesh>

      {/* U-bracket yoke base bar */}
      <mesh position={[0, -0.195, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.045]} />
        <meshStandardMaterial color="#2f313b" roughness={0.38} metalness={0.75} />
      </mesh>

      {/* Left & Right yoke arms */}
      <mesh position={[-0.14, -0.09, 0]}>
        <boxGeometry args={[0.022, 0.22, 0.045]} />
        <meshStandardMaterial color="#2f313b" roughness={0.38} metalness={0.75} />
      </mesh>
      <mesh position={[0.14, -0.09, 0]}>
        <boxGeometry args={[0.022, 0.22, 0.045]} />
        <meshStandardMaterial color="#2f313b" roughness={0.38} metalness={0.75} />
      </mesh>

      {/* Side tension knobs */}
      <mesh position={[-0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.026, 0.026, 0.022, 16]} />
        <meshStandardMaterial color="#3d404c" roughness={0.42} metalness={0.65} />
      </mesh>
      <mesh position={[0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.026, 0.026, 0.022, 16]} />
        <meshStandardMaterial color="#3d404c" roughness={0.42} metalness={0.65} />
      </mesh>

      {/* Tilted PAR Can Spotlight Housing (+Z forward) */}
      <group rotation={[pitch, 0, 0]}>
        {/* Main cylindrical body */}
        <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <cylinderGeometry args={[0.115, 0.115, 0.26, 32]} />
          <meshStandardMaterial color="#262830" roughness={0.28} metalness={0.78} />
        </mesh>

        {/* Rear heat-sink cap */}
        <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.092, 0.088, 0.07, 24]} />
          <meshStandardMaterial color="#2e303a" roughness={0.35} metalness={0.72} />
        </mesh>

        {/* Front bezel hood */}
        <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.118, 0.115, 0.055, 32, 1, true]} />
          <meshStandardMaterial
            color="#30323c"
            roughness={0.25}
            metalness={0.82}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Reflective inner silver rim */}
        <mesh position={[0, 0, 0.135]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.112, 0.105, 0.045, 32, 1, true]} />
          <meshStandardMaterial
            color="#e2e6f0"
            roughness={0.16}
            metalness={0.92}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Glowing LED / Fresnel lens */}
        <mesh position={[0, 0, 0.128]}>
          <circleGeometry args={[0.102, 32]} />
          <meshStandardMaterial
            color={lensColor}
            emissive={lensColor}
            emissiveIntensity={3.4}
            roughness={0.12}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
};

/**
 * Ceiling-mounted cylindrical LED spotlight (canopy plate + drop stem + swivel barrel)
 * for Dramatik Noir mode, aimed down at the bouquet.
 */
const CeilingSpotlightFixture: React.FC<{
  position: THREE.Vector3;
  target: THREE.Vector3;
  lensColor: string;
}> = ({ position, target, lensColor }) => {
  const { yaw, pitch } = useMemo(() => {
    const dir = target.clone().sub(position).normalize();
    return {
      yaw: Math.atan2(dir.x, dir.z),
      pitch: -Math.asin(THREE.MathUtils.clamp(dir.y, -0.99, 0.99)),
    };
  }, [position, target]);

  return (
    <group position={[position.x, position.y, position.z]} rotation={[0, yaw, 0]}>
      {/* Ceiling canopy plate */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.022, 32]} />
        <meshStandardMaterial color="#252730" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* Vertical drop stem */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.34, 16]} />
        <meshStandardMaterial color="#2c2e38" roughness={0.32} metalness={0.78} />
      </mesh>

      {/* Articulated swivel knuckle */}
      <mesh position={[0, 0.01, 0]}>
        <sphereGeometry args={[0.036, 16, 16]} />
        <meshStandardMaterial color="#343642" roughness={0.35} metalness={0.72} />
      </mesh>

      {/* Tilted cylindrical LED barrel (+Z toward bouquet) */}
      <group rotation={[pitch, 0, 0]}>
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.088, 0.088, 0.30, 32]} />
          <meshStandardMaterial color="#262832" roughness={0.28} metalness={0.8} />
        </mesh>

        {/* Inner reflector rim */}
        <mesh position={[0, 0, 0.155]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.084, 0.078, 0.04, 32, 1, true]} />
          <meshStandardMaterial
            color="#e6ebf5"
            roughness={0.18}
            metalness={0.9}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Glowing LED lens */}
        <mesh position={[0, 0, 0.152]}>
          <circleGeometry args={[0.078, 32]} />
          <meshStandardMaterial
            color={lensColor}
            emissive={lensColor}
            emissiveIntensity={3.4}
            roughness={0.12}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
};

/**
 * Reusable aimed SpotLight paired with a soft additive volumetric beam cone.
 */
const AimedSpotlightWithBeam: React.FC<AimedSpotlightWithBeamProps> = ({
  position,
  target,
  color,
  beamColor = color,
  intensity,
  angle = 0.42,
  penumbra = 0.55,
  beamOpacity = 0.085,
  beamBottomRadius = 2.35,
  castShadow = true,
  fixtureType,
}) => {
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetObj = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.copy(target);
    return obj;
  }, [target]);

  useEffect(() => {
    if (spotRef.current) {
      spotRef.current.target = targetObj;
    }
  }, [targetObj]);

  const { lightOrigin, beamPosition, beamQuaternion, beamLength, beamMaterial } = useMemo(() => {
    const dir = target.clone().sub(position);
    const dirNorm = dir.clone().normalize();
    // Emit light & beam cleanly in front of the fixture's front bezel so it never self-shadows
    const origin = fixtureType ? position.clone().addScaledVector(dirNorm, 0.24) : position.clone();
    const len = target.clone().sub(origin).length() + 1.25;
    const pos = origin.clone().addScaledVector(dirNorm, len * 0.5);
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
        uColor: { value: new THREE.Color(beamColor) },
        uOpacity: { value: beamOpacity },
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
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vNormalView;
        varying vec3 vViewPos;
        void main() {
          float verticalFade = smoothstep(0.0, 0.55, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
          vec3 viewDir = normalize(vViewPos);
          float edgeFade = pow(abs(dot(normalize(vNormalView), viewDir)), 1.8);
          float alpha = verticalFade * edgeFade * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });

    return {
      lightOrigin: origin,
      beamPosition: pos,
      beamQuaternion: quat,
      beamLength: len,
      beamMaterial: mat,
    };
  }, [position, target, beamColor, beamOpacity, fixtureType]);

  useEffect(() => {
    return () => {
      beamMaterial.dispose();
    };
  }, [beamMaterial]);

  return (
    <>
      <primitive object={targetObj} />
      {fixtureType === 'stage' && (
        <StageSpotlightFixture position={position} target={target} lensColor={color} />
      )}
      {fixtureType === 'ceiling' && (
        <CeilingSpotlightFixture position={position} target={target} lensColor={color} />
      )}
      {/* Local subtle fill at the lens so the spotlight housing is clearly lit */}
      {fixtureType && (
        <pointLight
          position={[lightOrigin.x, lightOrigin.y, lightOrigin.z]}
          intensity={1.1}
          distance={1.8}
          decay={2}
          color={color}
        />
      )}
      <spotLight
        ref={spotRef}
        position={[lightOrigin.x, lightOrigin.y, lightOrigin.z]}
        angle={angle}
        penumbra={penumbra}
        intensity={intensity}
        decay={1}
        distance={20}
        color={color}
        castShadow={castShadow}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00015}
      />
      <mesh position={beamPosition} quaternion={beamQuaternion}>
        <cylinderGeometry
          args={[fixtureType ? 0.085 : 0.16, beamBottomRadius, beamLength, 48, 1, true]}
        />
        <primitive object={beamMaterial} attach="material" />
      </mesh>
    </>
  );
};

const NoirLedSpotlight: React.FC<{ isVase: boolean; color: string }> = ({
  isVase,
  color,
}) => (
  <>
    <AimedSpotlightWithBeam
      position={LED_POS}
      target={isVase ? LED_TARGET_VASE : LED_TARGET_WRAP}
      color={color}
      beamColor={color}
      intensity={38}
      angle={0.44}
      penumbra={0.55}
      beamOpacity={0.085}
      beamBottomRadius={1.95}
      fixtureType="ceiling"
    />
    {/* Overhead LED fill so top of petals & leaves catch crisp light */}
    <directionalLight position={[1.2, 7.0, 1.6]} intensity={1.55} color={color} />
  </>
);

/**
 * Dual bottom-left and bottom-right spotlights shining diagonally upward onto the bouquet.
 */
const StageLightingRig: React.FC<{ isVase: boolean; color?: string }> = ({
  isVase,
  color,
}) => {
  const stageTarget = isVase ? STAGE_TARGET_VASE : STAGE_TARGET_WRAP;
  const leftColor = color || '#fff2dc';
  const rightColor = color || '#eef6ff';
  const leftBeam = color || '#ffe8c8';
  const rightBeam = color || '#dcebff';
  return (
    <>
      <AimedSpotlightWithBeam
        position={STAGE_LEFT_POS}
        target={stageTarget}
        color={leftColor}
        beamColor={leftBeam}
        intensity={38}
        angle={0.44}
        penumbra={0.58}
        beamOpacity={0.075}
        beamBottomRadius={1.95}
        fixtureType="stage"
      />
      <AimedSpotlightWithBeam
        position={STAGE_RIGHT_POS}
        target={stageTarget}
        color={rightColor}
        beamColor={rightBeam}
        intensity={38}
        angle={0.44}
        penumbra={0.58}
        beamOpacity={0.075}
        beamBottomRadius={1.95}
        fixtureType="stage"
      />
    </>
  );
};

export const CharacterScene: React.FC = () => {
  const bouquetGroupRef = useRef<THREE.Group>(null);
  const pedestalRef = useRef<THREE.Group>(null);
  const sceneSettings = useBouquetStore((state) => state.scene);
  const wrappingType = useBouquetStore((state) => state.wrapping.type);
  const isVase = isVaseWrapping(wrappingType);

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
  const lightingColor = sceneSettings.lightingColor || '#f8fbff';
  const sunIntensity = sceneSettings.sunlightIntensity ?? 1.25;

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

      {lighting === 'sunlight' && (
        <>
          <ambientLight intensity={0.55 * sunIntensity} color="#fff7e2" />
          <hemisphereLight args={['#dff0ff', '#dfd2be', 0.65 * sunIntensity]} />

          {/* HD Sky Dome with Radiant Sun & Multi-Octave Cumulus Clouds */}
          <AtmosphericSkyDome mode="sunlight" sunPosition={SUN_SKY_POS} sunIntensity={sunIntensity} />

          {/* Diagonal overhead sunlight key light aligned with the visible 3D sun */}
          <directionalLight
            position={[SUN_SKY_POS.x, SUN_SKY_POS.y, SUN_SKY_POS.z]}
            intensity={2.4 * sunIntensity}
            color="#fff0cc"
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

          {/* Soft sky bounce fill from opposite side so front petals stay luminous */}
          <directionalLight position={[-4.5, 3.2, 6.5]} intensity={0.75 * sunIntensity} color="#d8ecff" />
        </>
      )}

      {lighting === 'golden_hour' && (
        <>
          <ambientLight intensity={0.65} color="#ffd8be" />
          <AtmosphericSkyDome mode="sunset" sunPosition={SUNSET_SKY_POS} />
          <directionalLight
            position={[SUNSET_SKY_POS.x, SUNSET_SKY_POS.y, SUNSET_SKY_POS.z]}
            intensity={2.2}
            color="#ffaa5e"
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-5, 3, 4]} intensity={0.85} color="#9d4edd" />
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
          <NoirLedSpotlight isVase={isVase} color={lightingColor} />

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

      {lighting === 'stage_lighting' && (
        <>
          {/* Theatrical dark stage ambience */}
          <ambientLight intensity={0.22} color="#a0a8c0" />

          {/* Two bottom-left & bottom-right spotlights shining diagonally upward onto the flowers */}
          <StageLightingRig isVase={isVase} color={sceneSettings.lightingColor} />

          {/* Subtle top-back rim light to separate flower silhouettes from dark backdrop */}
          <directionalLight
            position={[0, 5.2, -3.6]}
            intensity={0.85}
            color="#b8d0ff"
          />
        </>
      )}

      {/* Subtle Studio Backdrop Pedestal */}
      <group ref={pedestalRef} position={[0, -1.9, 0]}>
        {/* Cylindrical Podium */}
        <mesh receiveShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[2.2, 2.4, 0.3, 48]} />
          <meshStandardMaterial
            color={lighting === 'dramatic_noir' || lighting === 'stage_lighting' ? '#1c1b21' : '#f7f5f0'}
            roughness={lighting === 'dramatic_noir' || lighting === 'stage_lighting' ? 0.55 : 0.7}
            metalness={lighting === 'dramatic_noir' || lighting === 'stage_lighting' ? 0.15 : 0.05}
          />
        </mesh>

        {/* Podium Base Trim */}
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[2.45, 2.5, 0.08, 48]} />
          <meshStandardMaterial
            color={lighting === 'dramatic_noir' || lighting === 'stage_lighting' ? '#121116' : '#dfd9cd'}
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
