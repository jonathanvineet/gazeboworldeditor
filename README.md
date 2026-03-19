# Gazebo World Editor

A visual **Gazebo `.world` / `.sdf` file editor** built as a Next.js 14 (App Router) single-page application. Create, import, edit, and export Gazebo world files entirely in the browser — no backend required.

## Tech Stack

- **Next.js 14** (App Router, client components where needed)
- **TypeScript**
- **Three.js** + **@react-three/fiber** + **@react-three/drei** for 3D rendering
- **Zustand** for state management with undo/redo history
- **Tailwind CSS** (dark theme)
- **fast-xml-parser** for SDF XML parsing and serialization

## Features

- 🎨 **3D Viewport** — React Three Fiber canvas with OrbitControls, grid, and gizmo helper
- 📦 **Primitive Rendering** — SDF geometries rendered as Three.js primitives (box, sphere, cylinder, plane, mesh wireframe)
- 🔧 **Transform Controls** — Click to select objects; T/R/S modes for translate, rotate, scale
- 🌳 **Scene Tree** — Hierarchical panel with visibility toggle and delete buttons
- 📋 **Properties Panel** — Edit model, light, scene, physics, and include properties
- 🛠️ **Toolbar** — Add primitives and lights, import/export, undo/redo, settings
- 📂 **Import** — Drag-and-drop or file picker for `.sdf` / `.world` files with merge/replace dialog
- 💾 **Export** — Download as `.world` or `.sdf`, or copy SDF XML to clipboard
- ↩️ **Undo/Redo** — 50-step history (Ctrl+Z / Ctrl+Y)
- ⚙️ **World Settings** — Edit world name, SDF version, gravity, scene colors
- 🔗 **Includes** — Add `model://` URI references (displayed as placeholders)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the editor.

## Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
  app/
    page.tsx           ← Main page layout
    layout.tsx
  components/
    Viewport/          ← Three.js canvas + mesh/light/include renderers
    SceneTree/         ← Left panel (hierarchical scene list)
    PropertiesPanel/   ← Right panel (property editors)
    Toolbar/           ← Top toolbar (add, import, export, undo/redo)
    Modals/            ← Settings, merge, add-include dialogs
    StatusBar.tsx      ← Bottom info bar
  store/
    worldStore.ts      ← Zustand state + history middleware
  lib/
    sdfParser.ts       ← XML → WorldState
    sdfSerializer.ts   ← WorldState → XML string
    sdfDefaults.ts     ← Default values for world objects
  types/
    sdf.types.ts       ← TypeScript type definitions
```
