'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import { SDFModel, SDFLink, SDFGeometry } from '@/types/sdf.types';
import { poseToMatrix } from './index';

interface Props {
  model: SDFModel;
  isSelected: boolean;
  onSelect: () => void;
}

function GeometryMesh({ geom, material, castShadows }: {
  geom: SDFGeometry;
  material: THREE.Material;
  castShadows: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  if (geom.type === 'box') {
    return (
      <mesh ref={meshRef} castShadow={castShadows} receiveShadow>
        <boxGeometry args={[geom.size[0], geom.size[2], geom.size[1]]} />
        <primitive object={material} attach="material" />
      </mesh>
    );
  }
  if (geom.type === 'sphere') {
    return (
      <mesh ref={meshRef} castShadow={castShadows} receiveShadow>
        <sphereGeometry args={[geom.radius, 32, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
    );
  }
  if (geom.type === 'cylinder') {
    return (
      <mesh ref={meshRef} castShadow={castShadows} receiveShadow>
        <cylinderGeometry args={[geom.radius, geom.radius, geom.length, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
    );
  }
  if (geom.type === 'plane') {
    return (
      <mesh ref={meshRef} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[geom.size[0], geom.size[1]]} />
        <primitive object={material} attach="material" />
      </mesh>
    );
  }
  // Mesh / unknown → wireframe placeholder
  return (
    <group>
      <mesh ref={meshRef} castShadow={castShadows} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#00aaff" wireframe />
      </mesh>
    </group>
  );
}

function LinkMesh({ link, isSelected }: { link: SDFLink; isSelected: boolean }) {
  const { position, rotation } = poseToMatrix(link.pose);

  return (
    <group position={position} rotation={rotation}>
      {link.visuals.map((visual) => {
        const diffuse = visual.material.diffuse;
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(diffuse[0], diffuse[1], diffuse[2]),
          opacity: diffuse[3],
          transparent: diffuse[3] < 1,
          roughness: 0.7,
          metalness: 0.1,
        });

        return (
          <group key={visual.id}>
            <GeometryMesh geom={visual.geometry} material={mat} castShadows={visual.castShadows} />
            {isSelected && (
              <Edges
                geometry={getEdgesGeometry(visual.geometry)}
                color="#ffff00"
                lineWidth={2}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

function getEdgesGeometry(geom: SDFGeometry): THREE.BufferGeometry {
  switch (geom.type) {
    case 'box': return new THREE.BoxGeometry(geom.size[0], geom.size[2], geom.size[1]);
    case 'sphere': return new THREE.SphereGeometry(geom.radius, 32, 32);
    case 'cylinder': return new THREE.CylinderGeometry(geom.radius, geom.radius, geom.length, 32);
    case 'plane': return new THREE.PlaneGeometry(geom.size[0], geom.size[1]);
    default: return new THREE.BoxGeometry(1, 1, 1);
  }
}

export default function ModelMesh({ model, isSelected, onSelect }: Props) {
  if (!model.visible) return null;

  const { position, rotation } = poseToMatrix(model.pose);

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {model.links.map((link) => (
        <LinkMesh key={link.id} link={link} isSelected={isSelected} />
      ))}
    </group>
  );
}
