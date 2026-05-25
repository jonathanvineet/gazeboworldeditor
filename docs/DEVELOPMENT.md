# Development Guide - Gazebo Studio

## Current Status

The foundation is complete:
- ✅ Backend FastAPI structure
- ✅ Frontend folder reorganization  
- ✅ SDF type system
- ✅ Layout system (flexlayout-react)
- ✅ State management (Zustand with undo/redo)
- ✅ SDF parser
- ✅ SDF serializer
- ✅ Mesh loader
- ✅ Basic panel placeholders

## Immediate Next Steps (Do This First)

### 1. Install Dependencies

```bash
npm install
pip install -r backend/requirements.txt
```

### 2. Run Development Environment

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Priority Development Tasks

### CRITICAL: Viewport Component (`frontend/src/viewport/Viewport.tsx`)

This is 80% of the app. Make this real:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useWorldStore } from '@/engine/worldStore'
import { Mesh } from 'three'

export default function Viewport() {
  const { world, selectedEntity, setMode, mode, wireframe } = useWorldStore()
  const meshRef = useRef<Mesh>(null)

  return (
    <Canvas
      shadows
      camera={{ position: [10, 10, 10], fov: 50 }}
      className="w-full h-full"
    >
      {/* Lighting */}
      <color attach="background" args={['#3e3e42']} />
      <ambientLight intensity={0.4} />
      <directionalLight castShadow position={[10, 20, 10]} intensity={3} />

      {/* Grid */}
      {world.scene.grid && <Grid args={[100, 100]} />}

      {/* Gizmo */}
      <GizmoHelper alignment="bottom-right">
        <GizmoViewport />
      </GizmoHelper>

      {/* Controls */}
      <OrbitControls />

      {/* Render scene */}
      <SceneRenderer world={world} selectedEntity={selectedEntity} />
    </Canvas>
  )
}

function SceneRenderer({ world, selectedEntity }: any) {
  return (
    <>
      {world.models.map((model: any) => (
        <ModelMesh
          key={model.id}
          model={model}
          isSelected={selectedEntity === model.id}
        />
      ))}
      {world.lights.map((light: any) => (
        <LightMesh key={light.id} light={light} />
      ))}
    </>
  )
}

function ModelMesh({ model, isSelected }: any) {
  // Render model as mesh or primitives
  // Check model.links[0].visuals[0].geometry.type
  // Create appropriate THREE geometry
  
  return (
    <mesh
      position={model.pose.position}
      rotation={model.pose.rotation}
      onClick={(e) => {
        e.stopPropagation()
        // selectEntity(model.id)
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={isSelected ? '#0e639c' : '#888888'}
      />
    </mesh>
  )
}

function LightMesh({ light }: any) {
  // Render lights - can be invisible or with helper
  return null
}
```

**Requirements:**
- Grid with toggleable display
- HDRI or ambient lighting
- Orbit camera controls
- Selection (click to select)
- Transform gizmo (T/R/S modes)
- Render all geometry types: box, sphere, cylinder, plane, mesh
- Wireframe mode toggle
- Physics debug visualization (optional initially)

### HIGH: Scene Tree Improvements (`frontend/src/panels/SceneTree.tsx`)

Current version is placeholder. Add:

- Hierarchical tree structure (indent children)
- Visibility toggle (eye icon)
- Lock toggle (lock icon)
- Delete button
- Rename (editable on double-click)
- Drag to reorder/reparent
- Right-click context menu
- Duplicate action
- Expand/collapse nodes

### HIGH: Inspector Panel (`frontend/src/panels/Inspector.tsx`)

Make it dynamic and editable:

```tsx
// If model selected:
- Name (editable text)
- Position (X, Y, Z sliders)
- Rotation (X, Y, Z sliders)
- Scale (X, Y, Z sliders)
- Static (checkbox)
- Visible (checkbox)
- Locked (checkbox)

// If light selected:
- Name
- Position
- Intensity (slider 0-5)
- Color (color picker)
- Type (dropdown: directional/point/spot)

// If link selected:
- Name
- Inertial mass
- Visuals count
- Collisions count
```

### MEDIUM: Real Toolbar (`frontend/src/editor/Toolbar.tsx`)

Currently has basic structure. Add:

- Add primitives (box, sphere, cylinder, plane)
- Add lights (directional, point, spot)
- Settings modal (physics, scene, world)
- File operations work properly

### MEDIUM: Import System (`frontend/src/lib/importers.ts`)

Create dedicated import module:

```ts
export async function importWorldFile(file: File): Promise<World> {
  const content = await file.text()
  return SDFParser.parseWorld(content)
}

export async function importZipModel(file: File): Promise<ModelEntity> {
  const zip = await JSZip.loadAsync(file)
  
  // 1. Read model.config
  const config = await zip.file('model.config')?.async('text')
  
  // 2. Read model.sdf
  const sdf = await zip.file('model.sdf')?.async('text')
  const model = SDFParser.parseModel(sdf)
  
  // 3. Load meshes from meshes/ folder
  for (const [path, zipFile] of Object.entries(zip.files)) {
    if (path.includes('meshes/')) {
      const meshData = await zipFile.async('arraybuffer')
      const mesh = await meshLoader.loadFromBuffer(meshData, path)
      // Store reference in model
    }
  }
  
  return model
}
```

### MEDIUM: Export System

Implement proper export:

```ts
export function downloadZipWorld(world: World): void {
  const zip = new JSZip()
  
  // Add .world file
  const sdfXml = exportWorld(world, 'world')
  zip.file(`${world.name}.world`, sdfXml)
  
  // Add meshes folder
  world.models.forEach((model) => {
    model.links.forEach((link) => {
      link.visuals.forEach((visual) => {
        if (visual.geometry.type === 'mesh') {
          // zip.file(`meshes/${meshname}`, meshData)
        }
      })
    })
  })
  
  zip.generateAsync({ type: 'blob' }).then((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${world.name}.zip`
    a.click()
    URL.revokeObjectURL(url)
  })
}
```

## Architecture Details

### Selection Flow

```
User clicks mesh in viewport
  ↓
Viewport calls: selectEntity(modelId)
  ↓
Zustand store updates: selectedEntity, selectedEntities
  ↓
Mesh highlights (selected color)
  ↓
Inspector panel updates to show entity properties
  ↓
SceneTree highlights entity in list
```

### Mutation Flow

```
User edits property in Inspector (e.g., position)
  ↓
Creates Command: UpdatePoseCommand
  ↓
Command.execute() → updates Zustand store
  ↓
Command added to history
  ↓
All components re-render with new state
  ↓
Viewport updates mesh position
  ↓
XML Editor shows updated XML
```

### Undo/Redo

All mutations go through `useWorldStore.executeCommand()`:

```ts
const command = new UpdatePoseCommand(modelId, newPose, oldPose)
executeCommand(command)  // Also can: undo(), redo()
```

## File Structure You Should Create

```
frontend/src/
├── commands/
│   ├── Command.ts           (Abstract base)
│   ├── UpdatePoseCommand.ts
│   ├── AddModelCommand.ts
│   ├── DeleteModelCommand.ts
│   └── ...
│
├── lib/
│   ├── importers.ts        (ZIP, URDF, WORLD loaders)
│   ├── exporters.ts        (World, model ZIP export)
│   └── storage.ts          (IndexedDB)
│
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   └── useWorldSelection.ts
│
└── components/helpers/
    ├── GeometryRenderer.tsx
    ├── MeshRenderer.tsx
    └── LightRenderer.tsx
```

## Testing Strategy

1. **Load example .world** — Use one from /public/models
2. **Try each transform mode** — T/R/S
3. **Test undo/redo** — Ctrl+Z / Ctrl+Y
4. **Import models** — Drag .sdf file
5. **Export** — Download and verify XML
6. **Multi-select** — Shift+click

## Performance Tips

- Use THREE.InstancedMesh for many primitives
- Frustum culling with cameras
- Lazy load model assets
- Debounce inspector updates
- Cache mesh geometries
- Use worker thread for ZIP extraction

## Debugging

```bash
# Check store state
useWorldStore.getState().world

# Log all mutations
const store = useWorldStore.subscribe((state) => {
  console.log('Store updated:', state)
})

# Inspect Three.js
window.THREE = THREE  // In Viewport useEffect
```

## Next Major Features (After Core)

1. **Material Editor** — HDRI, textures, PBR
2. **Joint Editor** — Create/edit constraints
3. **Sensor Visualization** — Camera frustum, lidar rays
4. **ROS Bridge** — Real-time simulation stream
5. **Collaborative Editing** — WebSockets, multiplayer
6. **Cloud Save** — PostgreSQL + S3

## Resources

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Drei Components](https://drei.pmnd.rs/)
- [Gazebo SDF Format](http://sdformat.org/)
- [Zustand Store](https://github.com/pmndrs/zustand)

Good luck building! This is going to be amazing.
