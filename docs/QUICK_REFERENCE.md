# Quick Reference - Phase A API

## Import EditorEngine
```typescript
import { getEditorEngine } from '@/engine/editorEngine'
const engine = getEditorEngine()
```

## Import EventBus
```typescript
import { eventBus } from '@/engine/events'
```

---

## Selection API
```typescript
engine.selectEntity(id)
engine.selectEntities([id1, id2])
engine.addToSelection(id)
engine.removeFromSelection(id)
engine.clearSelection()

engine.getSelectedEntity()
engine.getSelectedEntities()
```

---

## Transform API
```typescript
engine.moveEntity(id, [x, y, z])
engine.rotateEntity(id, [rx, ry, rz])
engine.scaleEntity(id, [sx, sy, sz])
```

---

## Entity Lifecycle
```typescript
engine.addModel(model)
engine.addLight(light)
engine.deleteEntity(id)
engine.duplicateEntity(id)
```

---

## Undo/Redo
```typescript
engine.undo()
engine.redo()
engine.canUndo()
engine.canRedo()
engine.getUndoDescription()
engine.getRedoDescription()
```

---

## Gizmo Control
```typescript
engine.selectGizmoMode('move' | 'rotate' | 'scale')
engine.selectSpaceMode('world' | 'local')
```

---

## Scene Access
```typescript
engine.getWorld()
engine.getSceneHierarchy()
engine.getModels()
engine.getLights()
```

---

## Event Listener Pattern
```typescript
const unsubscribe = eventBus.on('ENTITY_SELECTED', (payload) => {
  // Update UI from payload
})

// Cleanup
unsubscribe()
```

---

## Common Events
```typescript
'ENTITY_CREATED'       // New entity added
'ENTITY_DELETED'       // Entity removed
'ENTITY_SELECTED'      // Entity selected
'ENTITY_DESELECTED'    // Entity deselected
'ENTITY_MOVED'         // Entity position changed
'ENTITY_ROTATED'       // Entity rotation changed
'ENTITY_SCALED'        // Entity scale changed
'SCENE_CHANGED'        // Any scene change
'UNDO'                 // Undo performed
'REDO'                 // Redo performed
'GIZMO_MODE_CHANGED'   // Gizmo mode changed
'SPACE_MODE_CHANGED'   // World/Local space changed
```

---

## Persistence
```typescript
const world = engine.exportWorld()  // Get world data
engine.importWorld(world)            // Load world data
```

---

## Debugging
```typescript
engine.getCommandHistory()
engine.getCommandCount()
eventBus.getHistory()
eventBus.listenerCount()
```

---

## Component Pattern

```typescript
export function MyComponent() {
  const engine = getEditorEngine()
  const [state, setState] = useState()

  useEffect(() => {
    // Listen to events
    const unsub = eventBus.on('ENTITY_SELECTED', (payload) => {
      setState(payload)
    })

    return unsub
  }, [])

  // Call engine methods
  const handleClick = (id) => {
    engine.selectEntity(id)
  }

  return <div onClick={() => handleClick('entity_1')}>Click me</div>
}
```

---

## File Locations

```
frontend/src/engine/
├── events.ts                    # Event bus
├── sceneGraphManager.ts        # Scene data
├── commandSystem.ts            # Undo/redo
└── editorEngine.ts             # Main API (use this!)
```

---

## Pro Tips

✅ **Always go through EditorEngine** - Never mutate scene directly
✅ **Listen to events** - Don't poll for changes
✅ **Unsubscribe on unmount** - Prevent memory leaks
✅ **Use component state only for UI** - Never for scene data
✅ **Test with undo/redo** - Verify all mutations work both ways

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
