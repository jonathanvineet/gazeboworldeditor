'use client'

import { LightEntity } from '@/types/sdf'

interface LightRendererProps {
  light: LightEntity
  isSelected: boolean
  onSelect: (id: string) => void
}

export function LightRenderer({ light, isSelected, onSelect }: LightRendererProps) {
  if (!light.visible) return null

  const color = `rgb(${light.diffuse[0] * 255}, ${light.diffuse[1] * 255}, ${light.diffuse[2] * 255})`
  const intensity = 1.5

  const helper = (
    <mesh
      onClick={(e) => {
        e.stopPropagation()
        onSelect(light.id)
      }}
    >
      <sphereGeometry args={[0.15, 12, 12]} />
      <meshBasicMaterial color={isSelected ? '#eaeaea' : color} wireframe={!isSelected} />
    </mesh>
  )

  if (light.type === 'directional_light') {
    return (
      <group position={light.pose.position} rotation={light.pose.rotation}>
        <directionalLight
          color={color}
          intensity={intensity}
          castShadow={light.castShadows}
          shadow-mapSize={[2048, 2048]}
        />
        {helper}
      </group>
    )
  }

  if (light.type === 'point_light') {
    return (
      <group position={light.pose.position} rotation={light.pose.rotation}>
        <pointLight
          color={color}
          intensity={intensity}
          distance={light.range}
          castShadow={light.castShadows}
        />
        {helper}
      </group>
    )
  }

  return (
    <group position={light.pose.position} rotation={light.pose.rotation}>
      <spotLight
        color={color}
        intensity={intensity}
        distance={light.range}
        angle={light.outerAngle}
        penumbra={Math.max(0, 1 - light.innerAngle / Math.max(light.outerAngle, 0.0001))}
        castShadow={light.castShadows}
      />
      {helper}
    </group>
  )
}
