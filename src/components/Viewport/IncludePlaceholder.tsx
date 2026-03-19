'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { SDFInclude } from '@/types/sdf.types';
import { poseToMatrix } from './index';

interface Props {
  include: SDFInclude;
  isSelected: boolean;
  onSelect: () => void;
}

export default function IncludePlaceholder({ include, isSelected, onSelect }: Props) {
  const { position, rotation } = poseToMatrix(include.pose);

  return (
    <group position={position} rotation={rotation}>
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={isSelected ? '#00ffff' : '#00aaff'} wireframe />
      </mesh>
      <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          color: '#00cfff',
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: 11,
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          📦 {include.name}
        </div>
      </Html>
    </group>
  );
}
