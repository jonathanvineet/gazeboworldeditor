# Gazebo Studio - Architecture & Progress

## Overview
Transform Gazebo World Editor into a professional browser-based robotics simulation IDE, comparable to Gazebo, Blender, or Unreal Engine.

## ✅ Completed Foundation

### 1. Project Structure
- **Backend**: FastAPI Python service on port 8000
- **Frontend**: Next.js 16 with TypeScript (frontend/ directory)
- **Docker Compose**: Full stack orchestration with PostgreSQL and Redis

### 2. Type System (`frontend/src/types/sdf.ts`)
Complete SDF graph representation:
- `BaseEntity`: ID, name, pose, visibility, lock state
- `World`: Complete world definition with physics, scene, models, lights, includes
- `ModelEntity`: Models with links, joints, plugins, static flag
- `LinkEntity`: Links with visuals, collisions, sensors, inertial
- `VisualEntity`: Visual rendering with geometry and material
- `CollisionEntity`: Physics collisions with surface properties
- `Joint`: Model joints with axis configuration
- `LightEntity`: Directional, point, and spot lights
- `IncludeEntity`: Model references (model:// URIs)
- `PhysicsConfig`: Engine, gravity, step size
- `SceneConfig`: Ambient light, background, shadows, fog
- `Command`: For undo/redo system
- `EditorState`: Complete editor state including selection, history, mode
- `FuelSearchResult`: Gazebo Fuel API integration

### 3. SDF Parser (`frontend/src/sdf/parser.ts`)
- Converts XML → JSON → Scene Graph using fast-xml-parser
- Supports all geometry types: box, sphere, cylinder, plane, mesh, capsule
- Parses materials with PBR properties
- Handles models, links, visuals, collisions, joints, lights, includes
- Robust error handling and validation

### 4. SDF Serializer (`frontend/src/sdf/serializer.ts`)
- Converts Scene Graph → XML using xmlbuilder2
- Exports to `.world` or `.sdf` format
- Preserves pose, physics, scene configuration
- Download and clipboard support

### 5. State Management (`frontend/src/engine/worldStore.ts`)
Zustand store with:
- World loading/creation/updating
- Multi-entity selection
- Command execution with undo/redo (50-level history)
- Transform modes (translate/rotate/scale)
- World/local space toggle
- View settings (grid, gizmo, wireframe)

### 6. Backend API (`backend/app/main.py`)
FastAPI routes:
- `/health` - Health check
- `/api/fuel/search?q=...` - Search Gazebo Fuel
- `/api/fuel/model/{owner}/{name}` - Get model metadata
- `/api/fuel/download/{owner}/{name}` - Download models
- `/api/assets/resolve/{path}` - Asset URI resolution
- `/api/import/upload` - File upload
- `/api/export/world` - World export
- `/api/physics/preview` - Physics simulation preview
- `/api/meshes/convert` - Mesh format conversion

### 7. Asset Loading (`frontend/src/assets/loadMesh.ts`)
Multi-format mesh loader supporting:
- Collada (`.dae`)
- STL (`.stl`)
- OBJ (`.obj`)
- GLTF/GLB (`.gltf`, `.glb`)
- Drag-drop and ZIP extraction

### 8. Layout System (`frontend/src/editor/layoutConfig.ts`)
Professional flexlayout-react docking:
- Top toolbar
- Left panels: Scene Tree (50%) + Console (50%)
- Center panels: Viewport + XML Editor
- Right panel: Inspector
- VS Code-inspired colors (#1e1e1e, #252526, #3e3e42, #2d2d30)

### 9. Dependencies Updated
```json
Frontend additions:
- @react-three/rapier (physics)
- flexlayout-react (docking)
- leva (UI controls)
- react-dnd (drag & drop)
- @radix-ui/* (UI components)
- @monaco-editor/react (XML editor)
- jszip (ZIP handling)
- xmlbuilder2 (SDF generation)
- three-stdlib (mesh loaders)

Backend requirements.txt:
- FastAPI, uvicorn
- httpx (Fuel API)
- trimesh (mesh processing)
- lxml (XML handling)
```

## 🔄 Next Priority Tasks

### Immediate (Priority 1-5):
1. **Build Viewport Component** - Three.js canvas with grid, HDRI, gizmo, orbit controls, selection, transform gizmos, wireframe
2. **Build Scene Tree Panel** - Hierarchical entity list with visibility/lock toggles, drag-parenting, rename, duplicate, delete  
3. **Build Inspector Panel** - Context-sensitive properties editor (model/light/sensor/link-specific)
4. **Create ZIP Model Importer** - Parse model.config, model.sdf, resolve meshes, load assets
5. **Install Dependencies** - Run `npm install` and `pip install -r backend/requirements.txt`

### Medium (Priority 6-10):
6. Build XML Editor panel with Monaco editor and live sync
7. Implement physics preview with @react-three/rapier
8. Create command architecture for all mutations
9. Build asset browser with Fuel integration
10. Build console/logging panel

### Advanced (Priority 11-15):
11. Implement material system with HDRI environments
12. Multi-selection with group operations
13. Terrain system with heightmaps
14. Import pipeline for .urdf files
15. Export system with zipped assets

## Key Architectural Decisions

✓ **Scene Graph as Source of Truth** - SDF graph, not Three.js objects
✓ **Command Pattern** - All mutations support undo/redo
✓ **Modular Panels** - Docking layout, not fixed dashboard
✓ **Backend Separation** - FastAPI for robotics ecosystem access
✓ **Professional Colors** - VS Code/Unreal-inspired dark theme
✓ **IndexedDB** - Local storage, PostgreSQL later
✓ **Gazebo Fuel Integration** - Search, download, resolve models

## File Structure
```
gazebo-studio/
├── frontend/
│   ├── src/
│   │   ├── app/          (Next.js pages/layout)
│   │   ├── editor/       (Layout, keyboard shortcuts)
│   │   ├── viewport/     (Three.js canvas)
│   │   ├── panels/       (SceneTree, Inspector, Console, etc)
│   │   ├── engine/       (Zustand store, commands)
│   │   ├── sdf/          (Parser, serializer)
│   │   ├── assets/       (Mesh loader, ZIP importer)
│   │   ├── lib/          (Utilities, storage)
│   │   ├── ui/           (Shared UI components)
│   │   └── types/        (SDF type definitions)
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── main.py       (FastAPI app)
│   │   ├── routes/       (API endpoints)
│   │   ├── sdf/          (SDF processing)
│   │   ├── fuel/         (Gazebo Fuel integration)
│   │   ├── assets/       (Asset management)
│   │   └── meshes/       (Mesh processing)
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml
```

## Build & Run

```bash
# Install dependencies
npm install
pip install -r backend/requirements.txt

# Development
npm run dev                 # Runs both frontend and backend
# OR separately:
npm run dev:frontend       # http://localhost:3000
npm run dev:backend        # http://localhost:8000

# Production
npm run build
npm start
```

## Next Steps
1. Run `npm install` to get all dependencies
2. Build Viewport.tsx component with Three.js
3. Build SceneTree.tsx and Inspector.tsx panels
4. Create ZIP importer for model assets
5. Test with example .world files from Gazebo models directory

This is the foundation for a professional robotics simulation IDE.
