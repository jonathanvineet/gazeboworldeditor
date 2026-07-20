'use client'

import * as THREE from 'three'
import { ModelEntity } from '@/types/sdf'
import { GeometryMesh } from './GeometryMesh'

interface ModelRendererProps {
  model: ModelEntity
  isSelected: boolean
  onSelect: (id: string) => void
  groupRef?: (node: THREE.Group | null) => void
}

export function ModelRenderer({ model, isSelected, onSelect, groupRef }: ModelRendererProps) {
  if (!model.visible) return null

  return (
    <group
      name={model.id}
      ref={groupRef}
      position={model.pose.position}
      rotation={model.pose.rotation}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(model.id)
      }}
    >
      {model.links.map((link) => (
        <group key={link.id} position={link.pose.position} rotation={link.pose.rotation}>
          {link.visuals.map((visual) => (
            <group key={visual.id} position={visual.pose.position} rotation={visual.pose.rotation}>
              <GeometryMesh
                geometry={visual.geometry}
                material={
                  isSelected
                    ? { ...visual.material, emissive: [0.2, 0.4, 0.9, 1] }
                    : visual.material
                }
                castShadow={visual.castShadow}
                receiveShadow={visual.receiveShadow}
              />
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}
