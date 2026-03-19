'use client';

import React, { useRef, useCallback } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useWorldStore } from '@/store/worldStore';
import { Pose6D } from '@/types/sdf.types';
export default function SelectionTransform() {
  const selectedItem = useWorldStore(s => s.selectedItem);
  const transformMode = useWorldStore(s => s.transformMode);
  const world = useWorldStore(s => s.world);
  const updateModelPose = useWorldStore(s => s.updateModelPose);
  const updateLight = useWorldStore(s => s.updateLight);
  const updateInclude = useWorldStore(s => s.updateInclude);
  const { camera, gl } = useThree();

  const groupRef = useRef<THREE.Group>(null);

  const onTransformChange = useCallback(() => {
    if (!groupRef.current || !selectedItem) return;
    const pos = groupRef.current.position;
    const rot = groupRef.current.rotation;

    const newPose: Pose6D = {
      x: pos.x,
      y: -pos.z,
      z: pos.y,
      roll: rot.x,
      pitch: -rot.z,
      yaw: rot.y,
    };

    if (selectedItem.kind === 'model') {
      updateModelPose(selectedItem.id, newPose);
    } else if (selectedItem.kind === 'light') {
      updateLight(selectedItem.id, { pose: newPose });
    } else if (selectedItem.kind === 'include') {
      updateInclude(selectedItem.id, { pose: newPose });
    }
  }, [selectedItem, updateModelPose, updateLight, updateInclude]);

  if (!selectedItem || (selectedItem.kind !== 'model' && selectedItem.kind !== 'light' && selectedItem.kind !== 'include')) {
    return null;
  }

  let pose: Pose6D | null = null;
  if (selectedItem.kind === 'model') {
    pose = world.models.find(m => m.id === selectedItem.id)?.pose ?? null;
  } else if (selectedItem.kind === 'light') {
    pose = world.lights.find(l => l.id === selectedItem.id)?.pose ?? null;
  } else if (selectedItem.kind === 'include') {
    pose = world.includes.find(i => i.id === selectedItem.id)?.pose ?? null;
  }

  if (!pose) return null;

  const position: [number, number, number] = [pose.x, pose.z, -pose.y];
  const rotation: [number, number, number] = [pose.roll, pose.yaw, -pose.pitch];

  return (
    <TransformControls
      mode={transformMode}
      onObjectChange={onTransformChange}
      camera={camera}
      domElement={gl.domElement}
    >
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
      />
    </TransformControls>
  );
}
