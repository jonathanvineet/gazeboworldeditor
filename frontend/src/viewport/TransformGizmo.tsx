'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import { useWorldStore } from '@/engine/worldStore'
import * as THREE from 'three'

export function TransformGizmo() {
  const { world, selectedEntity, mode } = useWorldStore()
  const transformRef = useRef<any>(null)

  const selectedModel = selectedEntity
    ? world.models.find((m) => m.id === selectedEntity)
    : null

  if (!selectedModel) return null

  const position = selectedModel.pose.position
  const rotation = selectedModel.pose.rotation

  return (
    <TransformControls
      ref={transformRef}
      mode={mode === 'rotate' ? 'rotate' : mode === 'scale' ? 'scale' : 'translate'}
      translationSnap={0.25}
      rotationSnap={Math.PI / 12}
      scaleSnap={0.1}
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
    >
      {/* Visual indicator for selected object */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#0e639c"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </TransformControls>
  )
}
