# Quick Reference - Gazebo Studio

## Running the App

```bash
# Install everything
npm install && pip install -r backend/requirements.txt

# Start dev environment (both frontend + backend)
npm run dev

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

## File Locations

| What | Where |
|------|-------|
| Type Definitions | `frontend/src/types/sdf.ts` |
| State Management | `frontend/src/engine/worldStore.ts` |
| SDF Parser | `frontend/src/sdf/parser.ts` |
| SDF Serializer | `frontend/src/sdf/serializer.ts` |
| Main UI Layout | `frontend/src/editor/layoutConfig.ts` |
| Main Page | `frontend/src/app/page.tsx` |
| 3D Viewport | `frontend/src/viewport/Viewport.tsx` |
| Scene Hierarchy | `frontend/src/panels/SceneTree.tsx` |
| Properties | `frontend/src/panels/Inspector.tsx` |
| XML Editor | `frontend/src/panels/XMLEditor.tsx` |
| Mesh Loader | `frontend/src/assets/loadMesh.ts` |
| Backend Server | `backend/app/main.py` |

## Common Tasks

### Add a New Entity Type

1. Add interface to `frontend/src/types/sdf.ts`:
```ts
export interface MyEntity extends BaseEntity {
  type: "my_entity"
  // ... fields
}
```

2. Update `World` interface to include it
3. Update parser in `frontend/src/sdf/parser.ts`
4. Update serializer in `frontend/src/sdf/serializer.ts`
5. Add rendering in `Viewport.tsx`
6. Add display in `SceneTree.tsx`

### Store Access

```ts
import { useWorldStore } from '@/engine/worldStore'

// In component:
const { 
  world,                    // Current world
  selectEntity,            // Select something
  executeCommand,          // Add undo-able action
  undo, redo, canUndo,    // History
  mode, setMode,           // Transform mode
  showGrid, setShowGrid    // View options
} = useWorldStore()
```

### Load a World File

```ts
import { SDFParser } from '@/sdf/parser'

const xmlString = await file.text()
const world = SDFParser.parseWorld(xmlString)
useWorldStore.setState({ world })
```

### Export World

```ts
import { downloadWorld } from '@/sdf/serializer'

downloadWorld(world, 'my-world', 'world')  // Downloads .world file
```

### Add Undo-able Action

```ts
import { useWorldStore } from '@/engine/worldStore'

const command = {
  id: `update-${modelId}`,
  type: 'update',
  timestamp: Date.now(),
  execute: () => {
    // Apply changes to store
  },
  undo: () => {
    // Revert changes
  }
}

useWorldStore.getState().executeCommand(command)
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/fuel/search?q=...` | GET | Search Gazebo Fuel |
| `/api/fuel/model/{owner}/{name}` | GET | Get model metadata |
| `/api/fuel/download/{owner}/{name}` | GET | Download model ZIP |
| `/api/assets/resolve/{path}` | GET | Resolve model:// URI |
| `/api/import/upload` | POST | Upload file |
| `/api/export/world` | POST | Export world |
| `/api/meshes/convert` | POST | Convert mesh format |

## Color Palette

```js
const colors = {
  primary:       '#1e1e1e',  // Main background
  secondary:     '#252526',  // Panels
  accent:        '#3e3e42',  // Viewport bg
  tertiary:      '#2d2d30',  // Hover
  text:          '#cccccc',  // Primary text
  textSecondary: '#858585',  // Dimmed text
  border:        '#464647',  // Dividers
  
  // Highlights
  blue:          '#0e639c',  // Selected
  green:         '#6a9955',  // Success
  red:           '#f48771',  // Error
  orange:        '#ce9178',  // String
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| T | Translate mode |
| R | Rotate mode |
| S | Scale mode |
| G | Toggle grid |
| L | Toggle lights |
| W | Toggle wireframe |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Delete | Delete selected |
| Ctrl+D | Duplicate selected |
| Escape | Deselect |

## Debugging

```ts
// Check current world state
console.log(useWorldStore.getState().world)

// Check selected entity
console.log(useWorldStore.getState().selectedEntity)

// See if can undo
console.log(useWorldStore.getState().canUndo())

// Get all history
console.log(useWorldStore.getState().history)

// Subscribe to all changes
useWorldStore.subscribe((state) => {
  console.log('World updated:', state.world)
})
```

## Performance Checklist

- [ ] Mesh geometries are cached
- [ ] Use InstancedMesh for 100+ same geometry
- [ ] Frustum culling enabled
- [ ] Debounce inspector updates
- [ ] Lazy load mesh assets
- [ ] Compress SDF export
- [ ] Index entities by type for searching

## Testing Workflow

1. **Load example world**
   - Copy one from `/public/models` to test

2. **Test transforms**
   - Click entity → T/R/S modes
   - Verify gizmo appears

3. **Test undo/redo**
   - Make change → Ctrl+Z → change gone
   - Ctrl+Y → change back

4. **Test export**
   - Click Export → download .world
   - Verify XML is valid

5. **Test import**
   - Drag .world file → load
   - Verify entities appear in scene tree

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

## Docker Commands

```bash
# Build and run
docker-compose up

# Rebuild
docker-compose up --build

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Exec into backend
docker-compose exec backend bash
```

## Useful Links

- [Gazebo Docs](https://gazebosim.org/docs)
- [SDF Format](http://sdformat.org/)
- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Zustand](https://github.com/pmndrs/zustand)
- [flexlayout-react](https://github.com/caplin/FlexLayout)

## Error Troubleshooting

| Error | Solution |
|-------|----------|
| `Cannot find module @/types/sdf` | `tsconfig.json` path alias broken, run `npm install` |
| `flexlayout not rendering` | Import CSS: `import 'flexlayout-react/style/light.css'` |
| `Mesh not loading` | Check mesh loader supports format, verify URI |
| `Parser fails` | Validate XML with `XMLValidator.validate()` |
| `Store undefined` | Make sure component is `'use client'` |
| Port 3000/8000 in use | Kill process or change ports in package.json |

---

**That's it! You have everything you need. Start building! 🚀**
