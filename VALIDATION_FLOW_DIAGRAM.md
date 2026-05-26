# Architecture Validation Test - Complete Flow Diagram

## End-to-End Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER TRIGGERS TEST                                   │
└──────────────────────┬──────────────────────────────────────────────────────┘
                       │
                       ├─ Click "Create Box" button
                       ├─ Click "Create Sphere" button
                       ├─ Press Ctrl+Z (Undo)
                       └─ Press Ctrl+Y (Redo)
                       │
┌──────────────────────▼──────────────────────────────────────────────────────┐
│                    VIEWPORT COMPONENT                                        │
│  - EntityLifecycleTest.tsx (UI)                                              │
│  - useEditorShortcuts hook (Keyboard)                                        │
└──────────────────────┬──────────────────────────────────────────────────────┘
                       │
        ┌──────────────┘
        │
        └─────────────────────────────────┐
                                          │
┌─────────────────────────────────────────▼────────────────────────────────────┐
│                         EDITOR ENGINE                                         │
│  Source: frontend/src/engine/editorEngine.ts                                 │
│                                                                              │
│  Methods:                                                                    │
│  - createPrimitive(type: 'box'|'sphere'|'cylinder'|'plane'): string        │
│  - undo(): void                                                             │
│  - redo(): void                                                             │
│  - deleteEntity(id: string): void                                           │
│  - selectEntity(id: string): void                                           │
│                                                                              │
│  CRITICAL: EditorEngine is the ONLY entry point to mutate state            │
└──────────────────────┬─────────────────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ├─ Calls sceneGraphManager    ├─ Creates command
        │   .addModel() or            │   for undo/redo
        │   .deleteModel()            │
        │                             │
└───────▼─────────────────────────────▼──────────────────────────────────────┐
│              SCENE GRAPH MANAGER (Centralized State)                        │
│  Source: frontend/src/engine/sceneGraphManager.ts                          │
│                                                                            │
│  ✓ SINGLE SOURCE OF TRUTH                                                │
│  ✓ No mutations outside this layer                                        │
│  ✓ Pure data operations (getHierarchy, addModel, deleteModel, etc.)       │
│  ✓ World object contains all entity data                                  │
│                                                                            │
│  Data Structure:                                                          │
│  World {                                                                  │
│    models: ModelEntity[]                                                  │
│    lights: LightEntity[]                                                  │
│    includes: IncludeEntity[]                                              │
│    ...                                                                    │
│  }                                                                        │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │
                       │ (State updated)
                       │
┌──────────────────────▼──────────────────────────────────────────────────────┐
│                      EVENT EMISSION                                          │
│  Source: frontend/src/engine/events.ts                                      │
│                                                                             │
│  Events emitted by EditorEngine:                                           │
│  1. ENTITY_CREATED: { entityId, type }                                     │
│  2. SCENE_CHANGED: { world, timestamp }                                    │
│  3. ENTITY_DELETED: { entityId }                                           │
│  4. UNDO: { commandName }                                                  │
│  5. REDO: { commandName }                                                  │
│  ...and 18 more events                                                     │
│                                                                             │
│  ✓ Event bus is the communication backbone                                │
│  ✓ All observers listen independently to events                           │
│  ✓ No observer calls another observer                                      │
└──────────────────────┬──────────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬─────────────────┐
        │              │              │                 │
        │              │              │                 │
    EVENT  EVENT      EVENT          EVENT             EVENT
  CREATED CREATED    CREATED        CREATED            DELETED
    │      │          │               │                 │
    │      │          │               │                 │
    │      │          │               │                 │
┌───▼──────▼──┐  ┌───▼───────────┐  ┌──▼──────────┐  ┌─▼──────────┐
│ VIEWPORT    │  │ SCENE TREE    │  │ XML         │  │ UNDO/REDO  │
│ OBSERVER    │  │ OBSERVER      │  │ SERIALIZER  │  │ (Already   │
│             │  │               │  │ OBSERVER    │  │  handled)  │
└─────────────┘  └───────────────┘  └─────────────┘  └────────────┘
        │              │                  │
        │              │                  │
        ├─ Updates    ├─ Rebuilds       ├─ Serializes
        │  Three.js   │  tree from      │  scene to
        │  objects    │  scene graph    │  SDF XML
        │             │                 │
        │             │                 │
┌───────▼──────┐  ┌──▼────────────┐  ┌──▼──────────┐
│ VIEWPORT     │  │ SCENE TREE    │  │ XML PANEL   │
│ (Rendered    │  │ (UI Component)│  │ (Serialized)│
│  3D scene)   │  │               │  │             │
└──────────────┘  └───────────────┘  └─────────────┘
        │              │                  │
        │              │                  │
        └──────────────┴──────────────────┘
                  │
                  │ ALL THREE SYNCHRONIZED
                  │
         ┌────────▼────────┐
         │ PERFECT SYNC ✓  │
         └─────────────────┘
```

---

## Test Workflow #1: Create Box

```
USER ACTION
    │
    └─ Click "Create Box" button in EntityLifecycleTest
                  │
                  ▼
         engine.createPrimitive('box')
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
sceneGraph.   commandSystem.   eventBus.emit()
addModel()    execute()        'ENTITY_CREATED'
    │             │             │
    │             │             ▼
    │             │         eventBus.emit()
    │             │         'SCENE_CHANGED'
    │             │             │
    └─────────────┼─────────────┤
                  │             │
                  ▼             ▼
           [Scene Graph Updated] [Events Fired]
                  │
    ┌─────────────┼─────────────────┬──────────────┐
    │             │                 │              │
    ▼             ▼                 ▼              ▼
ViewportObserver SceneTreeObserver XMLSerializerObserver [CommandSystem]
listens to       listens to        listens to       (Already stored)
ENTITY_CREATED   ENTITY_CREATED    ENTITY_CREATED
    │             │                 │              
    ▼             ▼                 ▼              
renderEntity() rebuildTree()  serializeScene()  
    │             │                 │              
    ▼             ▼                 ▼              
[Blue box   [Entity in      [Entity in XML]    
appears in  tree]           
viewport]
```

---

## Test Workflow #2: Undo (Ctrl+Z)

```
USER ACTION
    │
    └─ Press Ctrl+Z (or click Undo button)
                  │
                  ▼
    useEditorShortcuts.handleKeyDown()
                  │
                  ▼
         engine.undo()
                  │
                  ▼
      commandSystem.undo()
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
sceneGraph.   commandHistory  eventBus.emit()
deleteModel() .pop() & execute() 'ENTITY_DELETED'
    │             │             │
    │             │             ▼
    │             │         eventBus.emit()
    │             │         'SCENE_CHANGED'
    │             │             │
    └─────────────┼─────────────┤
                  │             │
                  ▼             ▼
           [Scene Graph Updated] [Events Fired]
                  │
    ┌─────────────┼─────────────────┬──────────────┐
    │             │                 │              │
    ▼             ▼                 ▼              ▼
ViewportObserver SceneTreeObserver XMLSerializerObserver [CommandSystem]
listens to       listens to        listens to       (History available)
ENTITY_DELETED   ENTITY_DELETED    SCENE_CHANGED    
    │             │                 │              
    ▼             ▼                 ▼              
removeEntity()  rebuildTree()  serializeScene()  
    │             │                 │              
    ▼             ▼                 ▼              
[Blue box   [Entity removed   [Entity removed     
removed     from tree]        from XML]           
from view]
```

---

## Test Workflow #3: Redo (Ctrl+Y)

```
USER ACTION
    │
    └─ Press Ctrl+Y (or click Redo button)
                  │
                  ▼
    useEditorShortcuts.handleKeyDown()
                  │
                  ▼
         engine.redo()
                  │
                  ▼
      commandSystem.redo()
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
sceneGraph.   commandHistory  eventBus.emit()
addModel()    .execute()       'ENTITY_CREATED'
    │             │             │
    │             │             ▼
    │             │         eventBus.emit()
    │             │         'SCENE_CHANGED'
    │             │             │
    └─────────────┼─────────────┤
                  │             │
                  ▼             ▼
           [Scene Graph Updated] [Events Fired]
                  │
    ┌─────────────┼─────────────────┬──────────────┐
    │             │                 │              │
    ▼             ▼                 ▼              ▼
ViewportObserver SceneTreeObserver XMLSerializerObserver [CommandSystem]
listens to       listens to        listens to       (History rewound)
ENTITY_CREATED   ENTITY_CREATED    SCENE_CHANGED    
    │             │                 │              
    ▼             ▼                 ▼              
renderEntity()  rebuildTree()  serializeScene()  
    │             │                 │              
    ▼             ▼                 ▼              
[Blue box   [Entity restored   [Entity restored    
restored    in tree with       in XML with         
with SAME   SAME ID]           SAME ID]            
ID]
```

---

## Observer Independence Proof

```
┌──────────────────────────────────────────────────────────────────┐
│                    EVENT BUS (Communication Hub)                 │
│                                                                  │
│  eventBus.on('ENTITY_CREATED', (payload) => {                   │
│    // Three separate listeners, none calling each other         │
│  })                                                              │
└──────────────────────────────────────────────────────────────────┘
        │                    │                      │
        │                    │                      │
        ▼                    ▼                      ▼
┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│ ViewportObserver│  │ SceneTreeObserver│  │ XMLSerializerObs│
│                │  │                 │  │                  │
│ setupEventList │  │ setupEventList  │  │ setupEventList   │
│ (Independent)  │  │ (Independent)   │  │ (Independent)    │
│                │  │                 │  │                  │
│ renderEntity() │  │ rebuildTree()   │  │ serializeScene() │
│ [Updates Three │  │ [Updates React  │  │ [Generates SDF   │
│  .js only]     │  │  components]    │  │  XML only]       │
│                │  │                 │  │                  │
│ ✓ NO state sync│  │ ✓ NO state sync │  │ ✓ NO state sync  │
│ ✓ NO race conds│  │ ✓ NO race conds │  │ ✓ NO race conds  │
│ ✓ NO tight     │  │ ✓ NO tight      │  │ ✓ NO tight       │
│   coupling     │  │   coupling      │  │   coupling       │
└────────────────┘  └─────────────────┘  └──────────────────┘
        │                    │                      │
        │                    │                      │
        └────────┬───────────┴──────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ PERFECT SYNC ✓     │
        │ NO STATE DUPLICATION│
        │ NO SYNC BUGS       │
        └────────────────────┘
```

---

## State Flow Principle

```
BEFORE:
Viewport State
   +
Tree State
   +
XML State
   = SYNC PROBLEMS (3 separate sources of truth)


AFTER (This Architecture):
        ┌──────────────────────────┐
        │  Scene Graph (SINGLE     │
        │  SOURCE OF TRUTH)        │
        │                          │
        │  world.models[]          │
        │  world.lights[]          │
        │  world.includes[]        │
        └────────┬─────────────────┘
                 │
        ┌────────┼─────────────┐
        │        │             │
        ▼        ▼             ▼
    VIEWPORT  SCENE TREE    XML
   (Reads)    (Reads)       (Reads)
        │        │             │
        └────────┴─────────────┘
             │
        PERFECT SYNC
       (No state duplication)
```

---

## Architecture Validation Success Criteria

All criteria must be met for validation to pass:

### ✓ Proof #1: Centralized State
- [ ] No entity data in ViewportObserver
- [ ] No entity data in SceneTreeObserver
- [ ] No entity data in XMLSerializerObserver
- [ ] All data comes from scene graph only
- [ ] All mutations through sceneGraphManager only

### ✓ Proof #2: Single Entry Point
- [ ] Button clicks call engine.createPrimitive()
- [ ] Keyboard shortcuts call engine.undo()/redo()
- [ ] No direct sceneGraph mutations from UI
- [ ] No observer calls another observer
- [ ] EditorEngine coordinates all

### ✓ Proof #3: Event-Driven
- [ ] ENTITY_CREATED → all three observers update
- [ ] SCENE_CHANGED → all three observers update
- [ ] Observers don't poll, only listen
- [ ] Event payload contains sufficient data
- [ ] No callbacks between observers

### ✓ Proof #4: No Sync Bugs
- [ ] Viewport and tree show same entities
- [ ] Tree and XML show same entities
- [ ] Viewport and XML show same entities
- [ ] Entity IDs are consistent across all three
- [ ] Properties match across all three

### ✓ Proof #5: Undo/Redo Perfect
- [ ] CommandSystem records all mutations
- [ ] Undo truly reverses (doesn't delete/recreate)
- [ ] Redo truly reapplies (doesn't create new)
- [ ] Entity IDs stable through undo/redo
- [ ] All three panels update on undo/redo

---

## Expected Console Logs

When test runs perfectly:

```
[TEST] Box created: entity_box_1
[ENGINE] Entity created: entity_box_1
[VIEWPORT] Entity created event received
[TREE] Rebuilding tree from scene graph (models: 1)
[XML] Serialized, length: 1456

[TEST] Undo called
[ENGINE] Undo executed
[VIEWPORT] Entity deleted event received
[TREE] Rebuilding tree from scene graph (models: 0)
[XML] Serialized, length: 234

[TEST] Redo called
[ENGINE] Redo executed
[VIEWPORT] Entity created event received
[TREE] Rebuilding tree from scene graph (models: 1)
[XML] Serialized, length: 1456
```

---

## When This Test Is Complete

The architect can confidently say:
- ✓ "The scene graph is our single source of truth"
- ✓ "The EditorEngine is the gatekeeper for all mutations"
- ✓ "Events propagate perfectly to all observers"
- ✓ "No state duplication means no sync bugs"
- ✓ "Undo/redo work flawlessly across all systems"
- ✓ "We can scale with confidence"

---

## Next Phase (After Validation)

Once all checkboxes pass:
1. Build Phase B.2: Event persistence and snapshots
2. Build Phase B.3: XML editor integration
3. Build Phase B.4: Asset browser drag-drop
4. Build Phase B.5: Properties panel editing
5. Scale to full IDE

But not before validation is complete.
