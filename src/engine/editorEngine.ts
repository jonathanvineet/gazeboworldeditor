/**
 * Editor Engine
 * 
 * Main orchestrator for the editor.
 * 
 * Architecture:
 * - Receives component intents (selectEntity, moveEntity, importModel, etc.)
 * - Validates operations
 * - Mutates scene graph
 * - Executes commands (for undo/redo)
 * - Emits events for all observers to update independently
 * 
 * Pattern: Component → EditorEngine → SceneGraph mutation → Command execution → Event emission
 * 
 * No component should ever:
 * - Directly mutate scene state
 * - Directly update Three.js
 * - Directly access other components
 * 
 * Everything goes through EditorEngine API.
 */

import type { World } from '@/types/sdf'
import { eventBus, type EditorEventType, type EditorEventPayload } from './events'
import { SceneGraphManager } from './sceneGraphManager'
import {
  CommandStack,
  MoveEntityCommand,
  RotateEntityCommand,
  DeleteEntityCommand,
  AddEntityCommand,
} from './commandSystem'

/**
 * Main editor engine class
 * 
 * This is the primary API that all components interact with.
 * Components should NEVER directly mutate state.
 * Components ONLY call methods on EditorEngine.
 */
export class EditorEngine {
  private sceneGraph: SceneGraphManager
  private commandStack: CommandStack
  private selectedGizmoMode: 'move' | 'rotate' | 'scale' = 'move'
  private selectedSpaceMode: 'world' | 'local' = 'world'

  constructor() {
    this.sceneGraph = new SceneGraphManager()
    this.commandStack = new CommandStack()

    // Initialize editor state
    this.selectSpaceMode('world')
    this.selectGizmoMode('move')
  }

  /**
   * Main initialization entry point
   * Called once from React useEffect on application startup
   */
  initialize(): void {
    this.initializeDefaultWorld()
  }

  /**
   * ============================================================
   * INITIALIZATION API
   * ============================================================
   */

  /**
   * Initialize default world with ground plane and sun light.
   * Called once on application startup (from React useEffect at top level).
   * 
   * This is the CORRECT pattern:
   * - EditorEngine owns world initialization
   * - React calls editor.initializeDefaultWorld() once via useEffect at component top level
   * - No useEffect nesting, no Zustand selector side effects
   */
  initializeDefaultWorld(): void {
    // Check if ground plane already exists
    const hasGroundPlane = this.sceneGraph
      .getModels()
      .some((m) => m.name === 'ground_plane')

    if (!hasGroundPlane) {
      // Create ground plane
      this.createPrimitive('plane')
      const groundPlane = this.sceneGraph.getModels()[
        this.sceneGraph.getModels().length - 1
      ]
      if (groundPlane) {
        groundPlane.name = 'ground_plane'
        groundPlane.pose = {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
        }
      }
    }

    // Check if sun light already exists
    const hasSunLight = this.sceneGraph
      .getWorld()
      .scene.lights?.some((l) => l.name === 'sun')

    if (!hasSunLight) {
      // Create sun light (add as a light in the scene)
      const sunLight = {
        name: 'sun',
        type: 'light',
        pose: {
          position: [0, 0, 10],
          rotation: [0, 0, 0],
        },
        light: {
          type: 'directional',
          diffuse: [0.8, 0.8, 0.8, 1],
          specular: [0.8, 0.8, 0.8, 1],
          direction: [0, 0, -1],
        },
      }

      this.sceneGraph.getWorld().scene.lights = this.sceneGraph
        .getWorld()
        .scene.lights || []
      this.sceneGraph.getWorld().scene.lights.push(sunLight)

      eventBus.emit('SCENE_CHANGED', {
        world: this.sceneGraph.getWorld(),
      } as EditorEventPayload['SCENE_CHANGED'])
    }
  }

  /**
   * ============================================================
   * SELECTION API
   * ============================================================
   */

  selectEntity(entityId: string): void {
    const entity = this.sceneGraph.getEntity(entityId)
    if (!entity) {
      console.warn(`Entity not found: ${entityId}`)
      return
    }

    this.sceneGraph.selectEntity(entityId)

    eventBus.emit('ENTITY_SELECTED', {
      entityId,
      entity,
    } as EditorEventPayload['ENTITY_SELECTED'])
  }

  selectEntities(entityIds: string[]): void {
    this.sceneGraph.selectEntities(new Set(entityIds))

    eventBus.emit('ENTITY_SELECTED', {
      entityId: entityIds[0] || '',
      entity: entityIds.length > 0 ? this.sceneGraph.getEntity(entityIds[0]) : undefined,
    } as EditorEventPayload['ENTITY_SELECTED'])
  }

  addToSelection(entityId: string): void {
    const entity = this.sceneGraph.getEntity(entityId)
    if (!entity) return

    this.sceneGraph.addToSelection(entityId)

    eventBus.emit('ENTITY_SELECTED', {
      entityId,
      entity,
    } as EditorEventPayload['ENTITY_SELECTED'])
  }

  removeFromSelection(entityId: string): void {
    this.sceneGraph.removeFromSelection(entityId)

    eventBus.emit('ENTITY_DESELECTED', {
      entityId,
    } as EditorEventPayload['ENTITY_DESELECTED'])
  }

  clearSelection(): void {
    this.sceneGraph.clearSelection()

    eventBus.emit('SELECTION_CLEARED', {} as EditorEventPayload['SELECTION_CLEARED'])
  }

  getSelectedEntity() {
    return this.sceneGraph.getSelectedEntity()
  }

  getSelectedEntities() {
    return this.sceneGraph.getSelectedEntities()
  }

  /**
   * ============================================================
   * ENTITY TRANSFORMATION API
   * ============================================================
   */

  moveEntity(entityId: string, position: [number, number, number]): void {
    const entity = this.sceneGraph.getEntity(entityId)
    if (!entity) {
      console.warn(`Entity not found: ${entityId}`)
      return
    }

    const oldPosition = entity.pose?.position || [0, 0, 0]

    // Create command for undo/redo
    const command = new MoveEntityCommand(
      () => this.sceneGraph.getEntity(entityId),
      oldPosition as [number, number, number],
      position
    )

    // Execute through command system
    this.commandStack.execute(command)

    // Emit event for all observers
    eventBus.emit('ENTITY_MOVED', {
      entityId,
      position,
    } as EditorEventPayload['ENTITY_MOVED'])
  }

  rotateEntity(entityId: string, rotation: [number, number, number]): void {
    const entity = this.sceneGraph.getEntity(entityId)
    if (!entity) {
      console.warn(`Entity not found: ${entityId}`)
      return
    }

    const oldRotation = entity.pose?.rotation || [0, 0, 0]

    const command = new RotateEntityCommand(
      () => this.sceneGraph.getEntity(entityId),
      oldRotation as [number, number, number],
      rotation
    )

    this.commandStack.execute(command)

    eventBus.emit('ENTITY_ROTATED', {
      entityId,
      rotation,
    } as EditorEventPayload['ENTITY_ROTATED'])
  }

  scaleEntity(entityId: string, scale: [number, number, number]): void {
    const entity = this.sceneGraph.getEntity(entityId)
    if (!entity) {
      console.warn(`Entity not found: ${entityId}`)
      return
    }

    this.sceneGraph.scaleEntity(entityId, scale)

    eventBus.emit('ENTITY_SCALED', {
      entityId,
      scale,
    } as EditorEventPayload['ENTITY_SCALED'])
  }

  /**
   * ============================================================
   * ENTITY LIFECYCLE API
   * ============================================================
   */

  addModel(model: any): string {
    const id = this.sceneGraph.addModel(model)

    const command = new AddEntityCommand(
      () => this.sceneGraph.getWorld().scene,
      model
    )
    this.commandStack.execute(command)

    eventBus.emit('ENTITY_CREATED', {
      entityId: id,
      entity: model,
      type: 'model',
    } as EditorEventPayload['ENTITY_CREATED'])

    return id
  }

  addLight(light: any): string {
    const id = this.sceneGraph.addLight(light)

    const command = new AddEntityCommand(
      () => this.sceneGraph.getWorld().scene,
      light
    )
    this.commandStack.execute(command)

    eventBus.emit('ENTITY_CREATED', {
      entityId: id,
      entity: light,
      type: 'light',
    } as EditorEventPayload['ENTITY_CREATED'])

    return id
  }

  deleteEntity(entityId: string): void {
    const entity = this.sceneGraph.getEntity(entityId)
    if (!entity) {
      console.warn(`Entity not found: ${entityId}`)
      return
    }

    const command = new DeleteEntityCommand(
      () => this.sceneGraph.getWorld().scene,
      entity
    )
    this.commandStack.execute(command)

    eventBus.emit('ENTITY_DELETED', {
      entityId,
    } as EditorEventPayload['ENTITY_DELETED'])
  }

  duplicateEntity(entityId: string): string | null {
    const newId = this.sceneGraph.duplicateEntity(entityId)
    if (!newId) {
      console.warn(`Could not duplicate entity: ${entityId}`)
      return null
    }

    const newEntity = this.sceneGraph.getEntity(newId)
    const command = new AddEntityCommand(
      () => this.sceneGraph.getWorld().scene,
      newEntity
    )
    this.commandStack.execute(command)

    eventBus.emit('ENTITY_CREATED', {
      entityId: newId,
      entity: newEntity,
      type: newEntity.type === 'model' ? 'model' : 'light',
    } as EditorEventPayload['ENTITY_CREATED'])

    return newId
  }

  createPrimitive(
    primitiveType: 'box' | 'sphere' | 'cylinder' | 'plane'
  ): string {
    const id = `primitive_${primitiveType}_${Date.now()}`

    // Create model entity with default geometry
    const model: any = {
      id,
      name: `${primitiveType.charAt(0).toUpperCase() + primitiveType.slice(1)}`,
      type: 'model',
      pose: {
        position: [0, 0, 1],
        rotation: [0, 0, 0],
      },
      geometry: {
        type: primitiveType,
        // Default dimensions
        size: primitiveType === 'box' ? [1, 1, 1] : undefined,
        radius: primitiveType === 'sphere' ? 0.5 : undefined,
        length: primitiveType === 'cylinder' ? 2 : undefined,
      },
      visual: {
        geometry: { type: primitiveType },
        material: {
          script: 'Gazebo/Grey',
          ambient: [0.5, 0.5, 0.5, 1],
          diffuse: [0.8, 0.8, 0.8, 1],
          specular: [0.2, 0.2, 0.2, 1],
        },
      },
      collision: {
        geometry: { type: primitiveType },
      },
    }

    // Add to scene graph
    this.sceneGraph.addModel(model)

    // Record command for undo/redo
    const command = new AddEntityCommand(
      () => this.sceneGraph.getWorld().scene,
      model
    )
    this.commandStack.execute(command)

    // Emit event - all observers will update
    eventBus.emit('ENTITY_CREATED', {
      entityId: id,
      entity: model,
      type: 'model',
    } as EditorEventPayload['ENTITY_CREATED'])

    // Also emit scene changed for full synchronization
    eventBus.emit('SCENE_CHANGED', {
      world: this.sceneGraph.getWorld(),
    } as EditorEventPayload['SCENE_CHANGED'])

    return id
  }

  /**
   * ============================================================
   * SCENE GRAPH API
   * ============================================================
   */

  getWorld(): World {
    return this.sceneGraph.getWorld()
  }

  getSceneHierarchy() {
    return this.sceneGraph.getHierarchy()
  }

  getModels() {
    return this.sceneGraph.getModels()
  }

  getLights() {
    return this.sceneGraph.getLights()
  }

  /**
   * ============================================================
   * GIZMO STATE API
   * ============================================================
   */

  selectGizmoMode(mode: 'move' | 'rotate' | 'scale'): void {
    this.selectedGizmoMode = mode

    eventBus.emit('GIZMO_MODE_CHANGED', {
      mode,
    } as EditorEventPayload['GIZMO_MODE_CHANGED'])
  }

  getGizmoMode(): 'move' | 'rotate' | 'scale' {
    return this.selectedGizmoMode
  }

  selectSpaceMode(mode: 'world' | 'local'): void {
    this.selectedSpaceMode = mode

    eventBus.emit('SPACE_MODE_CHANGED', {
      space: mode,
    } as EditorEventPayload['SPACE_MODE_CHANGED'])
  }

  getSpaceMode(): 'world' | 'local' {
    return this.selectedSpaceMode
  }

  /**
   * ============================================================
   * UNDO/REDO API
   * ============================================================
   */

  undo(): boolean {
    const success = this.commandStack.undo()
    if (success) {
      eventBus.emit('UNDO', {
        description: this.commandStack.getUndoDescription(),
        commandIndex: this.commandStack.getCurrentIndex(),
      } as EditorEventPayload['UNDO'])

      // Emit scene changed event so all observers update
      eventBus.emit('SCENE_CHANGED', {
        world: this.sceneGraph.getWorld(),
      } as EditorEventPayload['SCENE_CHANGED'])
    }
    return success
  }

  redo(): boolean {
    const success = this.commandStack.redo()
    if (success) {
      eventBus.emit('REDO', {
        description: this.commandStack.getRedoDescription(),
        commandIndex: this.commandStack.getCurrentIndex(),
      } as EditorEventPayload['REDO'])

      eventBus.emit('SCENE_CHANGED', {
        world: this.sceneGraph.getWorld(),
      } as EditorEventPayload['SCENE_CHANGED'])
    }
    return success
  }

  canUndo(): boolean {
    return this.commandStack.canUndo()
  }

  canRedo(): boolean {
    return this.commandStack.canRedo()
  }

  getUndoDescription(): string | undefined {
    return this.commandStack.getUndoDescription()
  }

  getRedoDescription(): string | undefined {
    return this.commandStack.getRedoDescription()
  }

  /**
   * ============================================================
   * PERSISTENCE API
   * ============================================================
   */

  exportWorld(): World {
    return this.sceneGraph.export()
  }

  importWorld(world: World): void {
    this.sceneGraph.import(world)

    eventBus.emit('SCENE_LOADED', {
      world,
    } as EditorEventPayload['SCENE_LOADED'])
  }

  /**
   * ============================================================
   * DEBUGGING API
   * ============================================================
   */

  getCommandHistory() {
    return this.commandStack.getHistory()
  }

  getCommandCount(): number {
    return this.commandStack.getCommandCount()
  }
}

/**
 * Global editor engine instance
 * 
 * Components access this single instance.
 * This ensures all mutations go through one coordinated point.
 */
let editorEngineInstance: EditorEngine | null = null

export function getEditorEngine(): EditorEngine {
  if (!editorEngineInstance) {
    editorEngineInstance = new EditorEngine()
  }
  return editorEngineInstance
}

export function createEditorEngine(): EditorEngine {
  editorEngineInstance = new EditorEngine()
  return editorEngineInstance
}

/**
 * React hook for editor engine (optional, for convenience)
 */
export function useEditorEngine(): EditorEngine {
  return getEditorEngine()
}
