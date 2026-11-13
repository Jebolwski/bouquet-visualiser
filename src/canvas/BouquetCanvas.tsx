'use client';

import React, { ComponentRef, Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterScene } from './CharacterScene';
import { Loader2 } from 'lucide-react';

const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 1.3, 5.2);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.45, 0);
const MIN_POLAR = 0.12;
const MAX_POLAR = Math.PI * 0.72; // ~130 deg: allows low-angle shots looking upward

// Vertical "elevator" travel limits for the look-target (world units)
const ELEVATOR_STEP = 0.3;
const ELEVATOR_SPEED = 1.2; // units / second while holding
const MIN_TARGET_Y = -1.6;
const MAX_TARGET_Y = 2.4;

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/80 backdrop-blur-md shadow-glass text-stone-700">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-xs font-medium tracking-wider uppercase">Çiçekler Açıyor...</span>
      </div>
    </Html>
  );
}

function CameraRig() {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const holdDirectionRef = useRef<'up' | 'down' | null>(null);
  // Pending vertical travel (world units) still to be applied for click-steps
  const pendingLiftRef = useRef(0);
  const resettingRef = useRef(false);

  useEffect(() => {
    const onStep = (e: Event) => {
      const action = (e as CustomEvent<'up' | 'down' | 'reset'>).detail;
      if (action === 'reset') {
        pendingLiftRef.current = 0;
        holdDirectionRef.current = null;
        resettingRef.current = true;
        return;
      }
      resettingRef.current = false;
      pendingLiftRef.current += action === 'up' ? ELEVATOR_STEP : -ELEVATOR_STEP;
    };

    const onHold = (e: Event) => {
      const dir = (e as CustomEvent<'up' | 'down' | null>).detail;
      holdDirectionRef.current = dir;
      if (dir) {
        resettingRef.current = false;
        pendingLiftRef.current = 0;
      }
    };

    window.addEventListener('bouquet-camera-step', onStep);
    window.addEventListener('bouquet-camera-hold', onHold);
    return () => {
      window.removeEventListener('bouquet-camera-step', onStep);
      window.removeEventListener('bouquet-camera-hold', onHold);
    };
  }, []);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object;

    if (resettingRef.current) {
      const lerpAlpha = Math.min(1, delta * 7);
      camera.position.lerp(DEFAULT_CAMERA_POS, lerpAlpha);
      controls.target.lerp(DEFAULT_TARGET, lerpAlpha);
      if (
        camera.position.distanceTo(DEFAULT_CAMERA_POS) < 0.01 &&
        controls.target.distanceTo(DEFAULT_TARGET) < 0.01
      ) {
        camera.position.copy(DEFAULT_CAMERA_POS);
        controls.target.copy(DEFAULT_TARGET);
        resettingRef.current = false;
      }
      controls.update();
      return;
    }

    // Elevator: translate camera AND its look-target straight up/down together,
    // so the viewing angle stays exactly as the user set it with the mouse.
    let lift = 0;
    if (holdDirectionRef.current) {
      lift = (holdDirectionRef.current === 'up' ? 1 : -1) * ELEVATOR_SPEED * delta;
    } else if (pendingLiftRef.current !== 0) {
      const stepNow = pendingLiftRef.current * Math.min(1, delta * 10);
      lift = Math.abs(pendingLiftRef.current) < 0.002 ? pendingLiftRef.current : stepNow;
      pendingLiftRef.current -= lift;
    }

    if (lift !== 0) {
      const newTargetY = THREE.MathUtils.clamp(controls.target.y + lift, MIN_TARGET_Y, MAX_TARGET_Y);
      const applied = newTargetY - controls.target.y;
      if (applied === 0) pendingLiftRef.current = 0;
      controls.target.y += applied;
      camera.position.y += applied;
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[DEFAULT_TARGET.x, DEFAULT_TARGET.y, DEFAULT_TARGET.z]}
      minDistance={2.2}
      maxDistance={8.0}
      minPolarAngle={MIN_POLAR}
      maxPolarAngle={MAX_POLAR}
      enablePan
      enableDamping
      dampingFactor={0.06}
      onStart={() => {
        pendingLiftRef.current = 0;
        resettingRef.current = false;
      }}
    />
  );
}

export const BouquetCanvas: React.FC = () => {
  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [DEFAULT_CAMERA_POS.x, DEFAULT_CAMERA_POS.y, DEFAULT_CAMERA_POS.z], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        className="w-full h-full"
      >
        <Suspense fallback={<CanvasLoader />}>
          <CharacterScene />
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
};
