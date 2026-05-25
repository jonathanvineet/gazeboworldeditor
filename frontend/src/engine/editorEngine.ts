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
      mode,
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
