'use client'

import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Grid,
  GizmoHelper,
  GizmoViewport,
  Environment,
  PerspectiveCamera,
} from '@react-three/drei'
import { useWorldStore } from '@/engine/worldStore'

export default function Viewport() {
  const { world } = useWorldStore()

  return (
    <div className="w-full h-full">
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
        <SceneRenderer />
      </Canvas>
    </div>
  )
}

function SceneRenderer() {
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
