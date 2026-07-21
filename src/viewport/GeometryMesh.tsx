'use client'

import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { GeometryType, MaterialConfig } from '@/types/sdf'
import { meshLoader } from '@/assets/loadMesh'
import { resolveMeshUri } from '@/engine/resourceResolver'

function buildMaterial(material?: MaterialConfig): THREE.Material {
  const albedo = material?.albedo ?? material?.diffuse
  const color = albedo ? new THREE.Color(albedo[0], albedo[1], albedo[2]) : new THREE.Color(0x999999)
  const opacity = albedo ? albedo[3] : 1

  const emissive = material?.emissive
    ? new THREE.Color(material.emissive[0], material.emissive[1], material.emissive[2])
    : undefined

  return new THREE.MeshStandardMaterial({
    color,
    roughness: material?.roughness ?? 0.7,
    metalness: material?.metalness ?? 0,
    transparent: opacity < 1,
    opacity,
    ...(emissive ? { emissive, emissiveIntensity: 0.4 } : {}),
  })
}

function buildGeometry(geometry: GeometryType): THREE.BufferGeometry {
  switch (geometry.type) {
    case 'box':
      return new THREE.BoxGeometry(geometry.size[0], geometry.size[1], geometry.size[2])
    case 'sphere':
      return new THREE.SphereGeometry(geometry.radius, 32, 24)
    case 'cylinder':
      return new THREE.CylinderGeometry(geometry.radius, geometry.radius, geometry.length, 32).rotateX(
        Math.PI / 2
      )
    case 'capsule':
      return new THREE.CapsuleGeometry(geometry.radius, geometry.length, 8, 16).rotateX(Math.PI / 2)
    case 'plane':
      return new THREE.PlaneGeometry(geometry.size[0], geometry.size[1])
    case 'mesh':
      // Real geometry resolved async in MeshGeometryObject; this is only
      // reached for the synchronous primitive branches.
      return new THREE.BoxGeometry(1, 1, 1)
    default:
      return new THREE.BoxGeometry(1, 1, 1)
  }
}

interface GeometryMeshProps {
  geometry: GeometryType
  material?: MaterialConfig
  castShadow?: boolean
  receiveShadow?: boolean
}

export function GeometryMesh({ geometry, material, castShadow, receiveShadow }: GeometryMeshProps) {
  // Hooks must run unconditionally every render (geometry.type can change
  // for the same component slot), so build primitives even when unused.
  const threeGeometry = useMemo(
    () => (geometry.type === 'mesh' ? null : buildGeometry(geometry)),
    [JSON.stringify(geometry)]
  )
  const threeMaterial = useMemo(() => buildMaterial(material), [JSON.stringify(material)])

  if (geometry.type === 'mesh') {
    return (
      <MeshGeometryObject
        uri={geometry.uri}
        scale={geometry.scale}
        material={material}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      />
    )
  }

  const isPlane = geometry.type === 'plane'

  return (
    <mesh
      geometry={threeGeometry!}
      material={threeMaterial}
      rotation={isPlane ? [-Math.PI / 2, 0, 0] : undefined}
      castShadow={castShadow ?? true}
      receiveShadow={receiveShadow ?? true}
    />
  )
}

function MeshGeometryObject({
  uri,
  scale,
  material,
  castShadow,
  receiveShadow,
}: {
  uri: string
  scale: [number, number, number]
  material?: MaterialConfig
  castShadow?: boolean
  receiveShadow?: boolean
}) {
  const [object, setObject] = useState<THREE.Object3D | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setObject(null)
    setFailed(false)

    // model:// URIs need a resource server to resolve; fall back to a
    // known raw-content mirror if this model came from the catalog import,
    // otherwise there's nothing the browser can fetch directly.
    const resolved = resolveMeshUri(uri)
    if (resolved.startsWith('model://')) {
      setFailed(true)
      return
    }

    meshLoader
      .loadMesh(resolved)
      .then((obj) => {
        if (!cancelled) setObject(obj)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [uri])

  // Placeholder material while loading / on failure, so the entity stays
  // visible and selectable even before/without a real mesh.
  const threeMaterial = useMemo(
    () => buildMaterial(material ?? { albedo: [0.5, 0.5, 0.5, failed ? 0.4 : 1] }),
    [failed]
  )

  if (object) {
    return <primitive object={object} scale={scale} />
  }

  return (
    <mesh material={threeMaterial} castShadow={castShadow ?? true} receiveShadow={receiveShadow ?? true}>
      <boxGeometry args={[scale[0], scale[1], scale[2]]} />
    </mesh>
  )
}
