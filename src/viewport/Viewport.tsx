'use client'

import { useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Grid,
  GizmoHelper,
  GizmoViewport,
  Environment,
  PerspectiveCamera,
  TransformControls,
} from '@react-three/drei'
import { useDrop } from 'react-dnd'
import * as THREE from 'three'
import { useWorldStore } from '@/engine/worldStore'
import { useThreeOptimization } from '@/hooks/useThreeOptimization'
import { createPatchCommand } from '@/engine/commands'
import { withEntityPose, findEntity } from '@/engine/entityOps'
import { ModelRenderer } from './ModelRenderer'
import { LightRenderer } from './LightRenderer'
import { SDF_TO_THREE_ROTATION } from './sdfToThree'
import type { AssetMetadata } from '@/lib/assetDatabase'

export default function Viewport() {
  const [dropIndicator, setDropIndicator] = useState<[number, number, number] | null>(null)

  // Accept drag-drop from asset browser
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'asset',
    drop: (asset: AssetMetadata, monitor) => {
      const clientOffset = monitor.getClientOffset()
      if (clientOffset) {
        // TODO: Convert screen coordinates to world coordinates
        // Asset drop handler
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
      ref={(node) => { drop(node) }}
      className={`
        w-full h-full
        transition-colors
        ${isOver ? 'bg-[#eaeaea] bg-opacity-10' : ''}
        relative
      `}
    >
      <Canvas
        shadows="soft"
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
        onPointerMissed={() => useWorldStore.getState().selectEntity(undefined)}
      >
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={[8, 6, 8]}
          fov={45}
        />

        {/* Background & Atmosphere */}
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 20, 60]} />

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
          cellColor="#2a2a2a"
          sectionColor="#4a4a4a"
          fadeDistance={100}
          fadeStrength={1}
        />

        {/* Scene Content */}
        <SceneRenderer dropIndicator={dropIndicator} />

        {/* Gizmo Helper */}
        <GizmoHelper alignment="bottom-right">
          <GizmoViewport />
        </GizmoHelper>
      </Canvas>

      {/* Drop indicator overlay */}
      {isOver && (
        <div
          className="
            absolute
            inset-0
            border-2
            border-dashed
            border-[#eaeaea]
            pointer-events-none
            flex
            items-center
            justify-center
          "
        >
          <div className="text-sm text-[#eaeaea] bg-black bg-opacity-50 px-3 py-1.5 rounded">
            Drop to spawn model
          </div>
        </div>
      )}
    </div>
  )
}

function SceneRenderer({ dropIndicator }: { dropIndicator: [number, number, number] | null }) {
  const { world, selectedEntity, mode } = useWorldStore()
  const modelRefs = useRef<Record<string, THREE.Group | null>>({})
  const refCallbacks = useRef<Record<string, (node: THREE.Group | null) => void>>({})
  const [, forceUpdate] = useState(0)
  const orbitRef = useRef<any>(null)
  const draggingBeforeRef = useRef<{ position: [number, number, number]; rotation: [number, number, number] } | null>(null)

  // Configure Three.js and suppress deprecation warnings
  useThreeOptimization()

  const selectEntity = useWorldStore((s) => s.selectEntity)

  // One stable ref-callback identity per model id, so attaching a group
  // doesn't look like a "ref changed" event to React on every render.
  const setModelRef = useCallback((id: string) => {
    if (!refCallbacks.current[id]) {
      refCallbacks.current[id] = (node: THREE.Group | null) => {
        if (modelRefs.current[id] === node) return
        modelRefs.current[id] = node
        forceUpdate((n) => n + 1)
      }
    }
    return refCallbacks.current[id]
  }, [])

  const selectedGroup = selectedEntity ? modelRefs.current[selectedEntity] : null
  const selectedModel = selectedEntity ? world.models.find((m) => m.id === selectedEntity) : undefined

  const handleTransformDown = () => {
    if (orbitRef.current) orbitRef.current.enabled = false
    if (selectedGroup) {
      draggingBeforeRef.current = {
        position: selectedGroup.position.toArray() as [number, number, number],
        rotation: [selectedGroup.rotation.x, selectedGroup.rotation.y, selectedGroup.rotation.z],
      }
    }
  }

  const handleTransformUp = () => {
    if (orbitRef.current) orbitRef.current.enabled = true
    if (!selectedGroup || !selectedEntity || !draggingBeforeRef.current) return

    const before = draggingBeforeRef.current
    const afterPose = {
      position: selectedGroup.position.toArray() as [number, number, number],
      rotation: [selectedGroup.rotation.x, selectedGroup.rotation.y, selectedGroup.rotation.z] as [
        number,
        number,
        number,
      ],
    }
    draggingBeforeRef.current = null

    const entity = findEntity(useWorldStore.getState().world, selectedEntity)
    if (!entity) return

    const command = createPatchCommand(
      'transform-entity',
      withEntityPose(useWorldStore.getState().world, selectedEntity, {
        position: before.position,
        rotation: before.rotation,
      }),
      withEntityPose(useWorldStore.getState().world, selectedEntity, afterPose)
    )
    useWorldStore.getState().executeCommand(command)
  }

  return (
    <>
      <group rotation={SDF_TO_THREE_ROTATION}>
        {world.models.map((model) => (
          <ModelRenderer
            key={model.id}
            model={model}
            isSelected={selectedEntity === model.id}
            onSelect={selectEntity}
            groupRef={setModelRef(model.id)}
          />
        ))}
        {world.lights.map((light) => (
          <LightRenderer
            key={light.id}
            light={light}
            isSelected={selectedEntity === light.id}
            onSelect={selectEntity}
          />
        ))}
      </group>

      <OrbitControls ref={orbitRef} makeDefault enableDamping dampingFactor={0.05} />

      {selectedModel && selectedGroup && mode !== 'none' && (
        <TransformControls
          object={selectedGroup}
          mode={mode as 'translate' | 'rotate' | 'scale'}
          onMouseDown={handleTransformDown}
          onMouseUp={handleTransformUp}
        />
      )}
    </>
  )
}
