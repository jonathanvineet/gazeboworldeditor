# Gazebo Studio

A browser-based editor for Gazebo `.world` / `.sdf` files: build a scene visually, then download a real `.world` file to run in your own Gazebo install. No server-side simulation — this is an authoring tool, not a physics engine, which keeps it fully static and deployable to Vercel.

## Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Architecture

- **Scene Graph as Source of Truth** — the SDF-derived `World` object in `src/engine/worldStore.ts`, not the Three.js scene
- **Command Pattern** — mutations go through `src/engine/commands.ts` so undo/redo works
- **Professional Docking Layout** — flexlayout-react for an IDE-like interface
- **Everything client-side** — Fuel search is the one thing that needs a server hop (CORS), handled by a Next.js Route Handler (`src/app/api/fuel/*`), which deploys as a Vercel serverless function alongside the static app

## Tech Stack

- **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS**
- **Three.js** + **@react-three/fiber** + **@react-three/drei** for the viewport
- **Zustand** for state (with undo/redo history)
- **flexlayout-react** for the docking layout
- **@monaco-editor/react** for the live XML editor
- **react-dnd** for asset drag-and-drop
- **fast-xml-parser** + **xmlbuilder2** for SDF parsing/serialization
- **three-stdlib** for mesh loading (DAE, STL, OBJ, GLTF)

## Features

- 3D viewport: primitives (box/sphere/cylinder/plane/capsule/mesh), lights, click-to-select, transform gizmo (translate/rotate/scale), undo/redo
- Scene tree: hierarchy with visibility/lock toggles and delete
- Inspector: editable pose, static flag, and color for the selected entity
- XML editor: live, two-way-synced Monaco editor (edit XML directly, or edit visually and watch the XML update)
- Gazebo Fuel search (read-only browsing) via `/api/fuel/search`
- Download the world as a real `.world` file

## Known limitations

- Fuel search results are informational only — dragging a Fuel model into the scene (download → resolve meshes → spawn) isn't wired up yet
- `model://` mesh URIs can't be resolved in the browser (no resource server); only `file://`, `http(s)://`, and local blob URLs load
- Only top-level entities (models/lights/includes) are selectable/editable — link- and joint-level editing isn't in the Inspector yet

## Deploying to Vercel

`npm run build` produces a fully static app plus two serverless functions (`/api/fuel/*`). No environment variables or external services are required. `.npmrc` sets `legacy-peer-deps=true` because `flexlayout-react`'s peer range hasn't caught up to React 19 yet — Vercel's build picks this up automatically.

## Keyboard Shortcuts

- **W** — Translate mode
- **E** — Rotate mode
- **R** — Scale mode
- **F** — Focus on selected
- **Delete** — Delete selected entity
- **Ctrl+Z / Ctrl+Y** — Undo / redo

## Resources

- [Gazebo Documentation](https://gazebosim.org/docs)
- [SDF Format](http://sdformat.org/)
- [Three.js Docs](https://threejs.org/docs/)
