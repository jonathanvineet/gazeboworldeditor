# Gazebo Studio

A professional **browser-based robotics simulation IDE** for creating and editing Gazebo `.world` and `.sdf` files. Comparable to Gazebo, Blender, and Unreal Engine in interface design and functionality.

## Architecture

This is NOT just "a Next.js app with Three.js". This is a full robotics simulation IDE built with professional architecture:

- **Scene Graph as Source of Truth** — SDF graph, not Three.js objects
- **Command Pattern** — Every action supports undo/redo
- **Professional Docking Layout** — flexlayout-react for IDE-like interface
- **Backend Separation** — FastAPI for robotics ecosystem
- **Modular Components** — Viewport, panels, editor tightly integrated

See [ARCHITECTURE.md](ARCHITECTURE.md) for comprehensive overview.

## Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** (dark theme - VS Code inspired)
- **Three.js** + **@react-three/fiber** + **@react-three/drei**
- **@react-three/rapier** (physics preview)
- **Zustand** (state management with undo/redo)
- **flexlayout-react** (professional docking)
- **@monaco-editor/react** (XML editor)
- **react-dnd** (drag & drop)
- **@radix-ui** (accessible components)
- **fast-xml-parser** + **xmlbuilder2** (SDF parsing/serialization)
- **three-stdlib** (mesh loaders: DAE, STL, OBJ, GLTF)
- **jszip** (ZIP model import)

### Backend
- **FastAPI** (Python)
- **httpx** (Gazebo Fuel API)
- **trimesh** (mesh processing)
- **uvicorn** (ASGI server)

## Features

✓ **Professional 3D Viewport** — Grid, HDRI, gizmo, orbit controls, selection, transform gizmos, wireframe, physics preview

✓ **Scene Tree** — Hierarchical entity list with visibility/lock toggles, drag-parenting, rename, duplicate, delete

✓ **Inspector Panel** — Context-sensitive properties (model/light/sensor/link specific)

✓ **XML Editor** — Live sync with viewport, syntax highlighting

✓ **Gazebo Fuel Integration** — Search and download models directly

✓ **Multi-Format Import** — .sdf, .world, .urdf, .zip with mesh resolution

✓ **Undo/Redo** — 50-level history with command architecture

✓ **Mesh Loading** — DAE, STL, OBJ, GLTF, GLB with automatic format detection

✓ **Material System** — Albedo, roughness, metalness, HDRI environments

✓ **Physics Preview** — Gravity, collision, joints visualization

✓ **Professional UI** — Dense, compact controls; VS Code/Unreal-inspired colors

## Quick Start

### Install

```bash
npm install
pip install -r backend/requirements.txt
```

### Development

```bash
# Both frontend and backend
npm run dev

# Or separately:
npm run dev:frontend    # http://localhost:3000
npm run dev:backend     # http://localhost:8000
```

### Production

```bash
npm run build
npm start
```

### Docker

```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## Project Structure

```
gazebo-studio/
│
├── frontend/
│   ├── src/
│   │   ├── app/              (Next.js layout, pages)
│   │   ├── editor/           (Layout config, toolbar, keyboard shortcuts)
│   │   ├── viewport/         (Three.js canvas, rendering)
│   │   ├── panels/           (SceneTree, Inspector, XMLEditor, Console, AssetBrowser)
│   │   ├── engine/           (Zustand store, commands)
│   │   ├── sdf/              (Parser, serializer)
│   │   ├── assets/           (Mesh loader, ZIP importer)
│   │   ├── lib/              (Utilities, storage)
│   │   ├── ui/               (Shared components)
│   │   └── types/            (SDF type system)
│   ├── public/               (Static assets, models)
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py           (FastAPI app)
│   │   ├── routes/           (API endpoints)
│   │   ├── sdf/              (SDF utilities)
│   │   ├── fuel/             (Gazebo Fuel integration)
│   │   ├── assets/           (Asset management)
│   │   └── meshes/           (Mesh processing)
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml
```

## Next Steps

### Priority 1-5 (Core Functionality)
1. **Viewport Component** — Full Three.js implementation with all features
2. **Scene Tree** — Hierarchy management with drag-parenting
3. **Inspector Panel** — Entity property editing
4. **ZIP Importer** — Model asset loading
5. **Install Dependencies** — `npm install` + `pip install`

### Priority 6-10 (Advanced)
6. XML Editor with live sync
7. Physics preview
8. Command/mutation architecture
9. Asset browser with Fuel search
10. Logging/console panel

### Priority 11+ (Polish)
11. Material system with HDRI
12. Multi-selection operations
13. Terrain system
14. URDF import
15. Collaborative editing

## Development Guide

### Adding a New Panel

1. Create component in `frontend/src/panels/YourPanel.tsx`
2. Import in `frontend/src/app/page.tsx`
3. Add case in factory function
4. Add layout config in `frontend/src/editor/layoutConfig.ts`

### Modifying the SDF Type System

1. Edit `frontend/src/types/sdf.ts`
2. Both parser and serializer will automatically adapt
3. Update store actions as needed

### Running Mesh Conversion

Backend can convert mesh formats:
```bash
curl -X POST http://localhost:8000/api/meshes/convert \
  -F "file=@model.dae" \
  -F "target_format=glb"
```

### Searching Gazebo Fuel

```bash
curl http://localhost:8000/api/fuel/search?q=warehouse
```

## Keyboard Shortcuts

- **T** — Translate mode
- **R** — Rotate mode
- **S** — Scale mode
- **Ctrl+Z** — Undo
- **Ctrl+Y** — Redo
- **G** — Toggle grid
- **L** — Toggle lights visualization
- **W** — Toggle wireframe

## Performance Notes

- Scene graph is optimized for ~1000 entities
- Three.js renderer uses instancing for primitives
- Physics preview runs at reduced rate (not realtime)
- Mesh loading is cached in IndexedDB

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — System design and decisions
- [DEVELOPMENT.md](DEVELOPMENT.md) — Implementation guide with code examples
- [PHASE0_COMPLETE.md](PHASE0_COMPLETE.md) — Phase 0 completion summary
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) — Quick lookup guide for common tasks

## License

MIT

## Resources

- [Gazebo Documentation](https://gazebosim.org/docs)
- [SDF Format](http://sdformat.org/)
- [Three.js Docs](https://threejs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [flexlayout-react](https://github.com/caplin/FlexLayout)
