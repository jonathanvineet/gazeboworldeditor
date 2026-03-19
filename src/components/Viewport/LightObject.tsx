'use client';

import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { SDFLight } from '@/types/sdf.types';
import { poseToMatrix } from './index';

interface Props {
  light: SDFLight;
  isSelected: boolean;
  onSelect: () => void;
}

export default function LightObject({ light, isSelected, onSelect }: Props) {
  if (!light.visible) return null;

  const { position, rotation } = poseToMatrix(light.pose);
  const color = new THREE.Color(light.diffuse[0], light.diffuse[1], light.diffuse[2]);
  const intensity = light.diffuse[0] * 2 + light.diffuse[1] * 2 + light.diffuse[2] * 2;

  return (
    <group position={position} rotation={rotation}>
      {/* Visual indicator */}
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color={isSelected ? '#ffff00' : '#ffcc00'} />
      </mesh>

      {/* Label */}
      <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          color: '#ffd700',
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: 11,
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          💡 {light.name}
        </div>
      </Html>

      {/* Actual Three.js lights */}
      {light.type === 'point' && (
        <pointLight
          color={color}
          intensity={intensity}
          distance={light.attenuationRange}
          decay={2}
          castShadow={light.castShadows}
        />
      )}
      {light.type === 'directional' && (
        <directionalLight
          color={color}
          intensity={intensity}
          castShadow={light.castShadows}
          position={[0, 0, 0]}
        />
      )}
      {light.type === 'spot' && (
        <spotLight
          color={color}
          intensity={intensity}
          distance={light.attenuationRange}
          angle={light.outerAngle ?? 0.5}
          penumbra={light.falloff ?? 0.5}
          decay={2}
          castShadow={light.castShadows}
        />
      )}
    </group>
  );
}
