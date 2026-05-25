'use client'

import { useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  Grid,
  GizmoHelper,
  GizmoViewport,
  Environment,
  PerspectiveCamera,
} from '@react-three/drei'
import { useDrop } from 'react-dnd'
import { useWorldStore } from '@/engine/worldStore'
import type { AssetMetadata } from '@/lib/assetDatabase'

export default function Viewport() {
  const { world } = useWorldStore()
  const [dropIndicator, setDropIndicator] = useState<[number, number, number] | null>(null)

  // Accept drag-drop from asset browser
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'asset',
    drop: (asset: AssetMetadata, monitor) => {
      const clientOffset = monitor.getClientOffset()
      if (clientOffset) {
        // TODO: Convert screen coordinates to world coordinates
        console.log('Dropped asset:', asset.name, 'at', clientOffset)
        setDropIndicator(null)
      }
    },
    hover: (asset, monitor) => {
      const clientOffset = monitor.getClientOffset()
      if (clientOffset) {
        setDropIndicator([clientOffset.x, clientOffset.y, 0])
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div 
      ref={drop}
      className={`
        w-full h-full
        transition-colors
        ${isOver ? 'bg-[#0e639c] bg-opacity-10' : ''}
      `}
    >
      <Canvas shadows>
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={[8, 6, 8]}
          fov={45}
        />

        {/* Background & Atmosphere */}
        <color attach="background" args={['#1a1a1a']} />
        <fog attach="fog" args={['#1a1a1a', 20, 60]} />

        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight
          castShadow
          position={[10, 20, 10]}
          intensity={3}
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />

        {/* Environment HDRI */}
        <Environment preset="warehouse" />

        {/* Grid */}
        <Grid
          args={[200, 200]}
          cellSize={0.5}
          sectionSize={5}
          fadeDistance={100}
          fadeStrength={1}
        />

        {/* Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
        />

        {/* Gizmo Helper */}
        <GizmoHelper alignment="bottom-right">
          <GizmoViewport />
        </GizmoHelper>

        {/* Scene Content */}
        <SceneRenderer dropIndicator={dropIndicator} />
      </Canvas>

      {/* Drop indicator overlay */}
      {isOver && (
        <div
          className="
            absolute
            inset-0
            border-2
            border-dashed
            border-[#0e639c]
            pointer-events-none
            flex
            items-center
            justify-center
          "
        >
          <div className="text-sm text-[#0e639c] bg-black bg-opacity-50 px-3 py-1.5 rounded">
            Drop to spawn model
          </div>
        </div>
      )}
    </div>
  )
}

function SceneRenderer({ dropIndicator }: { dropIndicator: [number, number, number] | null }) {
  const { world, selectedEntity } = useWorldStore()

  return (
    <>
      {world.models.map((model) => (
        <ModelRenderer
          key={model.id}
          model={model}
          isSelected={selectedEntity === model.id}
        />
      ))}
      {world.lights.map((light) => (
        <LightRenderer key={light.id} light={light} />
      ))}
    </>
  )
}

function ModelRenderer({ model, isSelected }: any) {
  // Placeholder for model rendering
  // TODO: Render links, visuals, collisions, joints
  return null
}

function LightRenderer({ light }: any) {
  // Placeholder for light rendering
  // TODO: Render light helpers for preview
  return null
}
