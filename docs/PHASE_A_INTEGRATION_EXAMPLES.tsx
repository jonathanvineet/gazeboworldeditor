/**
 * PHASE A ARCHITECTURE EXAMPLE
 * 
 * This file shows the exact pattern for integrating Phase A systems
 * with existing React components.
 * 
 * Copy these patterns into your viewport, tree, XML editor, asset browser.
 */

import { useEffect, useState } from 'react'
import { getEditorEngine } from '@/engine/editorEngine'
import { eventBus } from '@/engine/events'

/**
 * ============================================================
 * EXAMPLE 1: Scene Tree Component
 * 
 * Listens to entity lifecycle events
 * Emits selection changes through EditorEngine
 * ============================================================
 */
export function SceneTreeExample() {
  const engine = getEditorEngine()
  const [entities, setEntities] = useState([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Subscribe to events
  useEffect(() => {
    // Listen when entity is added
    const unsubEntity = eventBus.on('ENTITY_CREATED', (payload) => {
      console.log('Entity created:', payload.entity.name)
      // Trigger scene tree rebuild from hierarchy
      const hierarchy = engine.getSceneHierarchy()
      setEntities(hierarchy)
    })

    // Listen when entity is deleted
    const unsubDelete = eventBus.on('ENTITY_DELETED', (payload) => {
      console.log('Entity deleted:', payload.entityId)
      // Rebuild tree
      const hierarchy = engine.getSceneHierarchy()
      setEntities(hierarchy)
    })

    // Listen when entity is selected
    const unsubSelect = eventBus.on('ENTITY_SELECTED', (payload) => {
      console.log('Entity selected:', payload.entityId)
      // Highlight in tree
      setSelectedId(payload.entityId)
    })

    // Listen when scene is loaded
    const unsubSceneLoad = eventBus.on('SCENE_LOADED', (payload) => {
      console.log('Scene loaded')
      // Rebuild tree from new hierarchy
      const hierarchy = engine.getSceneHierarchy()
      setEntities(hierarchy)
    })

    // Initialize tree
    const hierarchy = engine.getSceneHierarchy()
    setEntities(hierarchy)

    // Cleanup on unmount
    return () => {
      unsubEntity()
      unsubDelete()
      unsubSelect()
      unsubSceneLoad()
    }
  }, [engine])

  // User clicks entity in tree
  const handleSelectEntity = (entityId: string) => {
    // Just call the engine
    engine.selectEntity(entityId)
    // Engine handles:
    // 1. Scene graph mutation (selectEntity)
    // 2. Event emission (ENTITY_SELECTED)
    // 3. All observers update (tree highlights, inspector updates, etc.)
  }

  // User deletes entity
  const handleDeleteEntity = (entityId: string) => {
    // Just call the engine
    engine.deleteEntity(entityId)
    // Engine handles:
    // 1. Scene graph mutation (removeEntity)
    // 2. Command execution (for undo)
    // 3. Event emission (ENTITY_DELETED)
    // 4. Tree updates from event listener above
  }

  return (
    <div className="space-y-2">
      <h2>Scene Tree</h2>
      {entities.map((entity) => (
        <div
          key={entity.id}
          onClick={() => handleSelectEntity(entity.id)}
          className={`p-2 cursor-pointer ${
            selectedId === entity.id ? 'bg-blue-500' : 'bg-gray-800'
          }`}
        >
          <div className="flex justify-between">
            <span>{entity.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteEntity(entity.id)
              }}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * ============================================================
 * EXAMPLE 2: Viewport Interaction
 * 
 * Listens to scene changes to update Three.js
 * Emits transform changes through EditorEngine
 * ============================================================
 */
export function ViewportInteractionExample() {
  const engine = getEditorEngine()
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [gizmoMode, setGizmoMode] = useState<'move' | 'rotate' | 'scale'>('move')

  useEffect(() => {
    // Listen when entity is selected
    const unsubSelect = eventBus.on('ENTITY_SELECTED', (payload) => {
      console.log('Selected:', payload.entity?.name)
      setSelectedEntity(payload.entity)
      // Show gizmo over selected entity in Three.js
    })

    // Listen for scene changes to update Three.js
    const unsubSceneChange = eventBus.on('SCENE_CHANGED', (payload) => {
      console.log('Scene changed')
      // Update all Three.js objects from scene graph
      updateThreeScene(payload.world)
    })

    // Listen for entity movements to update Three.js
    const unsubMove = eventBus.on('ENTITY_MOVED', (payload) => {
      console.log('Entity moved:', payload.position)
      // Update specific object in Three.js
      updateObjectPosition(payload.entityId, payload.position)
    })

    // Listen for gizmo mode changes
    const unsubGizmoMode = eventBus.on('GIZMO_MODE_CHANGED', (payload) => {
      console.log('Gizmo mode:', payload.mode)
      setGizmoMode(payload.mode)
      // Update gizmo visualization
    })

    return () => {
      unsubSelect()
      unsubSceneChange()
      unsubMove()
      unsubGizmoMode()
    }
  }, [])

  // User drags gizmo
  const handleGizmoDrag = (entityId: string, newPosition: [number, number, number]) => {
    // Just call the engine
    engine.moveEntity(entityId, newPosition)
    // Engine handles:
    // 1. Scene graph mutation
    // 2. Command execution (for undo)
    // 3. Event emission (ENTITY_MOVED)
    // 4. Listeners above update Three.js and XML
  }

  // User changes gizmo mode
  const handleGizmoModeChange = (mode: 'move' | 'rotate' | 'scale') => {
    // Just call the engine
    engine.selectGizmoMode(mode)
    // Engine emits GIZMO_MODE_CHANGED
  }

  // User presses Ctrl+Z
  const handleUndo = () => {
    const success = engine.undo()
    if (success) {
      console.log('Undo:', engine.getUndoDescription())
      // Event listeners automatically update viewport/tree/XML
    }
  }

  // User presses Ctrl+Y
  const handleRedo = () => {
    const success = engine.redo()
    if (success) {
      console.log('Redo:', engine.getRedoDescription())
      // Event listeners automatically update viewport/tree/XML
    }
  }

  return (
    <div className="space-y-4">
      <div>Gizmo Mode: {gizmoMode}</div>
      <button onClick={() => handleGizmoModeChange('move')}>Move</button>
      <button onClick={() => handleGizmoModeChange('rotate')}>Rotate</button>
      <button onClick={() => handleGizmoModeChange('scale')}>Scale</button>
      <button onClick={handleUndo} disabled={!engine.canUndo()}>
        Undo
      </button>
      <button onClick={handleRedo} disabled={!engine.canRedo()}>
        Redo
      </button>
      {selectedEntity && <div>Selected: {selectedEntity.name}</div>}
    </div>
  )
}

/**
 * ============================================================
 * EXAMPLE 3: Asset Browser Drag-Drop
 * 
 * Drag model from browser → drop in viewport → scene updates
 * ============================================================
 */
export function AssetBrowserExample() {
  const engine = getEditorEngine()

  // Asset card drag start
  const handleDragStart = (e: React.DragEvent, model: any) => {
    e.dataTransfer.setData('model', JSON.stringify(model))
    e.dataTransfer.effectAllowed = 'copy'
  }

  // Viewport drop
  const handleDropOnViewport = (model: any, position: [number, number, number]) => {
    // Add model to scene through engine
    const modelWithPose = {
      ...model,
      pose: {
        position,
        rotation: [0, 0, 0],
      },
    }

    const entityId = engine.addModel(modelWithPose)

    console.log('Model added:', entityId)
    // Engine handles:
    // 1. Scene graph mutation (addModel)
    // 2. Command execution (for undo)
    // 3. Event emission (ENTITY_CREATED)
    // 4. Tree updates (listener from Example 1)
    // 5. XML updates (listener in XML Editor)
    // 6. Viewport updates (listener from Example 2)
  }

  return (
    <div>
      <div
        draggable
        onDragStart={(e) =>
          handleDragStart(e, { name: 'Robot', mesh: 'robot.dae' })
        }
        className="p-4 bg-blue-600 cursor-move"
      >
        Drag me to viewport
      </div>
    </div>
  )
}

/**
 * ============================================================
 * EXAMPLE 4: XML Editor Integration
 * 
 * Listens to scene changes and serializes to XML
 * Parses XML changes and imports as new scene
 * ============================================================
 */
export function XMLEditorExample() {
  const engine = getEditorEngine()
  const [xmlContent, setXmlContent] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)

  useEffect(() => {
    // Listen for scene changes
    const unsubSceneChange = eventBus.on('SCENE_CHANGED', (payload) => {
      console.log('Scene changed, updating XML')
      // Serialize scene to SDF XML
      const xml = serializeToSDF(payload.world)
      setXmlContent(xml)
    })

    // Listen for entities being added
    const unsubEntityCreated = eventBus.on('ENTITY_CREATED', (payload) => {
      console.log('Entity created, updating XML')
      const world = engine.getWorld()
      const xml = serializeToSDF(world)
      setXmlContent(xml)
    })

    // Initial XML from current scene
    const world = engine.getWorld()
    const xml = serializeToSDF(world)
    setXmlContent(xml)

    return () => {
      unsubSceneChange()
      unsubEntityCreated()
    }
  }, [engine])

  // User edits XML and saves
  const handleXMLChange = (newXml: string) => {
    setXmlContent(newXml)

    try {
      // Parse XML to world
      const world = parseFromSDF(newXml)
      setParseError(null)

      // Import world through engine
      engine.importWorld(world)
      // Engine handles:
      // 1. Scene graph update (import)
      // 2. Event emission (SCENE_LOADED)
      // 3. Tree updates (from listener)
      // 4. Viewport updates (from listener)
    } catch (error) {
      setParseError((error as Error).message)
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={xmlContent}
        onChange={(e) => handleXMLChange(e.target.value)}
        className="w-full h-64 bg-gray-900 text-gray-100 p-2 font-mono"
      />
      {parseError && <div className="text-red-500">{parseError}</div>}
    </div>
  )
}

/**
 * ============================================================
 * MOCK FUNCTIONS (replace with real implementations)
 * ============================================================
 */

function updateThreeScene(world: any) {
  console.log('Update Three.js from world:', world)
  // Update all Three.js objects from scene graph
}

function updateObjectPosition(
  entityId: string,
  position: [number, number, number]
) {
  console.log('Update object position:', entityId, position)
  // Update specific object in Three.js
}

function serializeToSDF(world: any): string {
  console.log('Serialize to SDF:', world)
  return '<sdf>...</sdf>'
}

function parseFromSDF(xml: string): any {
  console.log('Parse from SDF:', xml)
  return { scene: { models: [], lights: [] } }
}

/**
 * ============================================================
 * USAGE IN MAIN APP
 * ============================================================
 */

export function EditorLayoutExample() {
  return (
    <div className="grid grid-cols-4 gap-4 h-screen">
      {/* Left: Scene Tree */}
      <div className="bg-gray-900 p-4">
        <SceneTreeExample />
      </div>

      {/* Center: Viewport */}
      <div className="col-span-2 bg-black">
        <ViewportInteractionExample />
      </div>

      {/* Right: Properties */}
      <div className="bg-gray-900 p-4 space-y-4">
        <AssetBrowserExample />
        <XMLEditorExample />
      </div>
    </div>
  )
}
