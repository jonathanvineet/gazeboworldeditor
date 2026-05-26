# Entity Lifecycle Validation Checklist

## Architecture Validation: Phase B - Integration Testing

This checklist validates that the complete entity lifecycle works end-to-end with all components communicating through the event-driven architecture.

---

## Pre-Test Setup

### System Components Status
- [ ] EditorEngine (editorEngine.ts) - createPrimitive() method exists
- [ ] SceneGraphManager (sceneGraphManager.ts) - addModel() works
- [ ] CommandSystem (commandSystem.ts) - Undo/redo history functional
- [ ] EventBus (events.ts) - All 23 events typed
- [ ] ViewportObserver (ViewportObserver.ts) - Listening to events
- [ ] SceneTreeObserver (SceneTreeObserver.ts) - Listening to events
- [ ] XMLSerializerObserver (XMLSerializerObserver.ts) - Listening to events

### Integration Setup
- [ ] EntityLifecycleTest component created
- [ ] useEditorShortcuts hook created
- [ ] Test component integrated into viewport/main page
- [ ] All three observers instantiated in viewport

---

## Test Workflow #1: Create Box → All Observers Update

### Trigger
**User Action**: Click "Create Box" button in EntityLifecycleTest component

### Expected Behavior
```
Button Click
    ↓
EntityLifecycleTest.handleCreateBox()
    ↓
engine.createPrimitive('box')
    ↓
sceneGraphManager.addModel() [Scene graph updates]
    ↓
commandSystem.execute() [Command recorded]
    ↓
eventBus.emit('ENTITY_CREATED') [Event 1]
    ↓
eventBus.emit('SCENE_CHANGED') [Event 2]
    ↓
All Observers Receive Events (independently):
  ├─ ViewportObserver.renderEntity() → Three.js mesh added
  ├─ SceneTreeObserver.rebuildTree() → Tree shows new entity
  └─ XMLSerializerObserver.serializeScene() → XML auto-updates
```

### Validation Checklist
- [ ] Console logs show `[ENGINE] Entity created: <id>`
- [ ] Console logs show `[VIEWPORT] Entity created event received`
- [ ] Console logs show `[TREE] Rebuilding tree from scene graph`
- [ ] Console logs show `[XML] Serializing scene`
- [ ] **Viewport**: Blue box mesh visible at origin (0,0,0)
- [ ] **Scene Tree**: Entity appears in hierarchy with correct name
- [ ] **XML Panel**: Entity appears in serialized SDF XML
- [ ] Status shows `Box created: <entity-id>`
- [ ] Created count increments to 1

### Actual Results
```
[Fill this in when you run the test]
✓/✗ Viewport renders mesh
✓/✗ Scene tree shows entity
✓/✗ XML serializes entity
✓/✗ All three are in sync
```

---

## Test Workflow #2: Undo → All Observers Update

### Trigger
**User Action**: Press Ctrl+Z or click "Undo" button

### Expected Behavior
```
Ctrl+Z
    ↓
useEditorShortcuts.handleKeyDown()
    ↓
engine.undo()
    ↓
commandSystem.undo()
    ↓
sceneGraphManager.deleteModel() [Scene graph updates]
    ↓
eventBus.emit('ENTITY_DELETED') [Event 1]
    ↓
eventBus.emit('SCENE_CHANGED') [Event 2]
    ↓
All Observers Receive Events (independently):
  ├─ ViewportObserver.removeEntity() → Three.js mesh removed
  ├─ SceneTreeObserver.rebuildTree() → Tree removes entity
  └─ XMLSerializerObserver.serializeScene() → XML updates (entity gone)
```

### Validation Checklist
- [ ] Console logs show `[ENGINE] Undo executed`
- [ ] Console logs show `[SHORTCUTS] Undo executed`
- [ ] Console logs show `[VIEWPORT] Entity deleted event received`
- [ ] Console logs show `[TREE] Rebuilding tree from scene graph`
- [ ] Console logs show `[XML] Serializing scene`
- [ ] **Viewport**: Blue box mesh disappears from view
- [ ] **Scene Tree**: Entity removed from hierarchy
- [ ] **XML Panel**: Entity removed from SDF XML
- [ ] Status shows `Undo executed`
- [ ] Created count remains 1 (history tracking)

### Actual Results
```
[Fill this in when you run the test]
✓/✗ Viewport updates (mesh gone)
✓/✗ Scene tree updates (entity removed)
✓/✗ XML updates (entity removed from serialization)
✓/✗ All three are in sync
```

---

## Test Workflow #3: Redo → All Observers Update

### Trigger
**User Action**: Press Ctrl+Y or click "Redo" button

### Expected Behavior
```
Ctrl+Y
    ↓
useEditorShortcuts.handleKeyDown()
    ↓
engine.redo()
    ↓
commandSystem.redo()
    ↓
sceneGraphManager.addModel() [Scene graph updates]
    ↓
eventBus.emit('ENTITY_CREATED') [Event 1]
    ↓
eventBus.emit('SCENE_CHANGED') [Event 2]
    ↓
All Observers Receive Events (independently):
  ├─ ViewportObserver.renderEntity() → Three.js mesh restored
  ├─ SceneTreeObserver.rebuildTree() → Tree shows entity again
  └─ XMLSerializerObserver.serializeScene() → XML updates (entity restored)
```

### Validation Checklist
- [ ] Console logs show `[ENGINE] Redo executed`
- [ ] Console logs show `[SHORTCUTS] Redo executed`
- [ ] Console logs show `[VIEWPORT] Entity created event received`
- [ ] Console logs show `[TREE] Rebuilding tree from scene graph`
- [ ] Console logs show `[XML] Serializing scene`
- [ ] **Viewport**: Blue box mesh reappears at same location
- [ ] **Scene Tree**: Entity reappears in hierarchy
- [ ] **XML Panel**: Entity reappears in SDF XML
- [ ] Status shows `Redo executed`
- [ ] **CRITICAL**: Entity ID matches original (same entity, not new)

### Actual Results
```
[Fill this in when you run the test]
✓/✗ Viewport updates (mesh restored)
✓/✗ Scene tree updates (entity restored)
✓/✗ XML updates (entity restored to serialization)
✓/✗ All three are in sync
✓/✗ Entity ID unchanged (redo is true redo, not new create)
```

---

## Test Workflow #4: Create Multiple Entities

### Trigger
**User Action**: Click "Create Box", then "Create Sphere"

### Expected Behavior
```
Create Box → [all observers update]
    ↓
Create Sphere → [all observers update]
    ↓
Result: Two entities in scene graph, both in viewport, both in tree, both in XML
```

### Validation Checklist
- [ ] Console shows both ENTITY_CREATED events
- [ ] **Viewport**: Blue box + green sphere both visible
- [ ] **Scene Tree**: Both entities in hierarchy
- [ ] **XML Panel**: Both entities in SDF XML
- [ ] Created count shows 2
- [ ] Status shows last created entity ID
- [ ] Each entity has unique ID
- [ ] Each entity has unique name (box_1, sphere_1 etc.)

### Actual Results
```
[Fill this in when you run the test]
✓/✗ Both entities rendered
✓/✗ Both in tree
✓/✗ Both in XML
✓/✗ IDs are unique
✓/✗ All components in sync
```

---

## Test Workflow #5: Undo Multiple Creates

### Trigger
**User Action**: Ctrl+Z (undo sphere), Ctrl+Z (undo box)

### Expected Behavior
```
Undo 1st: Sphere disappears everywhere
    ↓
Undo 2nd: Box disappears everywhere
    ↓
Result: Scene is empty, all three panels empty
```

### Validation Checklist
- [ ] First undo removes only sphere (box remains)
- [ ] Second undo removes box (scene now empty)
- [ ] **Viewport**: Both meshes gone
- [ ] **Scene Tree**: Both entities gone, tree empty
- [ ] **XML Panel**: No entities in XML
- [ ] Status shows undo executions

### Actual Results
```
[Fill this in when you run the test]
✓/✗ Sphere removed first
✓/✗ Box removed second
✓/✗ All panels synchronized
```

---

## Test Workflow #6: Redo Multiple Undoes

### Trigger
**User Action**: Ctrl+Y (redo box), Ctrl+Y (redo sphere)

### Expected Behavior
```
Redo 1st: Box reappears everywhere
    ↓
Redo 2nd: Sphere reappears everywhere
    ↓
Result: Back to state with both entities, all synchronized
```

### Validation Checklist
- [ ] First redo restores box only
- [ ] Second redo restores sphere only
- [ ] Entities have same IDs as before
- [ ] **Viewport**: Both meshes visible again
- [ ] **Scene Tree**: Both entities in hierarchy again
- [ ] **XML Panel**: Both entities in XML again

### Actual Results
```
[Fill this in when you run the test]
✓/✗ Box restored first with correct ID
✓/✗ Sphere restored second with correct ID
✓/✗ All panels synchronized
```

---

## Critical Architecture Validations

### ✓ Proof #1: Scene Graph is Source of Truth
- [ ] No entity data stored in Viewport
- [ ] No entity data stored in SceneTree
- [ ] No entity data stored in XMLSerializer
- [ ] All data comes from `engine.getWorld()` only
- [ ] All mutations go through `sceneGraphManager` only

### ✓ Proof #2: EditorEngine is Single Entry Point
- [ ] Button clicks call `engine.createPrimitive()`
- [ ] Keyboard shortcuts call `engine.undo()/redo()`
- [ ] All mutations flow through EditorEngine
- [ ] Observers never mutate scene directly
- [ ] No observer calls other observer methods

### ✓ Proof #3: Events Propagate to All Observers
- [ ] ENTITY_CREATED → ViewportObserver updates
- [ ] ENTITY_CREATED → SceneTreeObserver updates
- [ ] ENTITY_CREATED → XMLSerializerObserver updates
- [ ] SCENE_CHANGED → All three update
- [ ] Each observer update is independent
- [ ] No observer depends on another's completion

### ✓ Proof #4: No State Duplication
- [ ] Viewport doesn't cache entity data (only Three.js objects)
- [ ] SceneTree doesn't cache entity data (only UI nodes)
- [ ] XMLSerializer doesn't cache entity data (generates from world)
- [ ] Each observer rebuilds from scene graph on change
- [ ] No sync bugs or stale data possible

### ✓ Proof #5: Undo/Redo Works Perfectly
- [ ] Commands recorded in commandSystem
- [ ] Undo reverses state through commandSystem
- [ ] Redo restores state through commandSystem
- [ ] All observers update on command execution
- [ ] Entity IDs remain stable through undo/redo
- [ ] No creation/deletion during undo/redo (true reversal)

---

## Console Output Patterns

When test is working, console should show patterns like:

```
[TEST] Box created: entity_box_1
[ENGINE] Entity created: entity_box_1
[VIEWPORT] Entity created event received
[TREE] Rebuilding tree from scene graph
[XML] Serialized, length: 1234
[TEST] Undo called
[ENGINE] Undo executed
[VIEWPORT] Entity deleted event received
[TREE] Rebuilding tree from scene graph
[XML] Serialized, length: 567
[TEST] Redo called
[ENGINE] Redo executed
[VIEWPORT] Entity created event received
[TREE] Rebuilding tree from scene graph
[XML] Serialized, length: 1234
```

### Check Console Logs
- [ ] No errors or warnings in console
- [ ] All expected log patterns appear
- [ ] Observer updates happen in consistent order
- [ ] No event emission failures
- [ ] No serialization errors

---

## Final Validation Summary

### Architecture Proven?
- [ ] **Yes**: All three panels update independently and stay in sync
- [ ] **Yes**: No state duplication detected
- [ ] **Yes**: EditorEngine is single entry point
- [ ] **Yes**: Events drive all updates
- [ ] **Yes**: Undo/redo work perfectly

### Ready for Phase B.2: Extended Testing?
- [ ] Pass all 6 test workflows
- [ ] Pass all architecture proofs
- [ ] Console clean (no errors)
- [ ] All panels stay synchronized
- [ ] Undo/redo stable

### Next Steps After Validation
1. Implement event persistence (JSON snapshots)
2. Add XML editor integration
3. Build asset browser workflow
4. Add multi-select and batch operations
5. Implement save/load functionality

---

## Notes Section

```
[Add notes here as you run tests]

Test Run #1 Date: ___________
Status: ____________
Issues Found: _______________________________________________

Test Run #2 Date: ___________
Status: ____________
Issues Found: _______________________________________________

Architecture Assessment: 
_________________________________________________________________
```

---

**Document Purpose**: 
This checklist proves that Phase A architecture works end-to-end before scaling to Phase B features. No new features should be added until all checkboxes are verified.

**Key Principle**: 
Professional software is validated before scaling. This test proves the foundation is solid.
