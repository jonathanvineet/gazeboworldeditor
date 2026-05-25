'use client';

import React, { useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import * as THREE from 'three';
import { useWorldStore } from '@/store/worldStore';
import { Pose6D } from '@/types/sdf.types';
import ModelMesh from './ModelMesh';
import LightObject from './LightObject';
import IncludePlaceholder from './IncludePlaceholder';
import SelectionTransform from './SelectionTransform';

function poseToMatrix(pose: Pose6D): { position: [number, number, number]; rotation: [number, number, number] } {
  return {
    position: [pose.x, pose.z, -pose.y], // SDF Y-forward → Three.js Z-forward
    rotation: [pose.roll, pose.yaw, -pose.pitch],
  };
}

export { poseToMatrix };

export default function Viewport() {
  const world = useWorldStore(s => s.world);
  const selectedItem = useWorldStore(s => s.selectedItem);
  const setSelectedItem = useWorldStore(s => s.setSelectedItem);

  const handleMiss = useCallback(() => {
    setSelectedItem(null);
  }, [setSelectedItem]);

  return (
    <div className="w-full h-full bg-zinc-800 relative">
      <Canvas
        shadows
        camera={{ position: [10, 8, 10], fov: 50, near: 0.01, far: 10000 }}
        onPointerMissed={handleMiss}
        gl={{ antialias: true }}
      >
        <ambientLight
          intensity={world.scene.ambient[0] * 2}
          color={new THREE.Color(
            world.scene.ambient[0],
            world.scene.ambient[1],
            world.scene.ambient[2]
          )}
        />

        {/* Models */}
        {world.models.map((model) => (
          <ModelMesh
            key={model.id}
            model={model}
            isSelected={selectedItem?.kind === 'model' && selectedItem.id === model.id}
            onSelect={() => setSelectedItem({ kind: 'model', id: model.id })}
          />
        ))}

        {/* Lights */}
        {world.lights.map((light) => (
          <LightObject
            key={light.id}
            light={light}
            isSelected={selectedItem?.kind === 'light' && selectedItem.id === light.id}
            onSelect={() => setSelectedItem({ kind: 'light', id: light.id })}
          />
        ))}

        {/* Includes */}
        {world.includes.map((inc) => (
          <IncludePlaceholder
            key={inc.id}
            include={inc}
            isSelected={selectedItem?.kind === 'include' && selectedItem.id === inc.id}
            onSelect={() => setSelectedItem({ kind: 'include', id: inc.id })}
          />
        ))}

        {/* Transform controls for selected item */}
        <SelectionTransform />

        {/* Grid */}
        {world.scene.grid && (
          <Grid
            args={[100, 100]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#4a4a6a"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#6060a0"
            fadeDistance={80}
            fadeStrength={1}
            infiniteGrid
          />
        )}

        {/* Axes helper in corner */}
        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport axisColors={['#e05560', '#60b560', '#5060e0']} labelColor="white" />
        </GizmoHelper>

        <OrbitControls makeDefault enableDamping={false} />
      </Canvas>
    </div>
  );
}
