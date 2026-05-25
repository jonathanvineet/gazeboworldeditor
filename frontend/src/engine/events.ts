/**
 * Editor Event Bus
 * 
 * Central nervous system for the editor.
 * Decouples all systems from each other.
 * 
 * Pattern: Observer pattern with type-safe events
 * No tight coupling between viewport, scene tree, inspector, etc.
 * 
 * Flow:
 * Component calls: editor.selectEntity(id)
 *   ↓
 * Editor mutates scene graph
 *   ↓
 * Editor emits: ENTITY_SELECTED event
 *   ↓
 * All subscribers (viewport, tree, inspector) update independently
 */

export type EditorEventType =
  // Entity lifecycle
  | 'ENTITY_CREATED'
  | 'ENTITY_DELETED'
  | 'ENTITY_SELECTED'
  | 'ENTITY_DESELECTED'
  
  // Transformations
  | 'ENTITY_MOVED'
  | 'ENTITY_ROTATED'
  | 'ENTITY_SCALED'
  
  // Model operations
  | 'MODEL_IMPORTED'
  | 'MODEL_LOADED'
  | 'MESH_LOADED'
  
  // Scene operations
  | 'SCENE_CHANGED'
  | 'SCENE_SAVED'
  | 'SCENE_LOADED'
  
  // Editor state
  | 'SELECTION_CHANGED'
  | 'VIEW_MODE_CHANGED'
  | 'GIZMO_MODE_CHANGED'
  | 'SPACE_MODE_CHANGED'
  
  // XML synchronization
  | 'XML_UPDATED'
  | 'XML_PARSING_STARTED'
  | 'XML_PARSING_COMPLETE'
  | 'XML_PARSING_ERROR'
  
  // History
  | 'UNDO'
  | 'REDO'
  | 'HISTORY_CHANGED'

export interface EditorEventPayload {
  ENTITY_CREATED: { entityId: string; type: string }
  ENTITY_DELETED: { entityId: string }
  ENTITY_SELECTED: { entityId: string }
  ENTITY_DESELECTED: { entityId: string }
  
  ENTITY_MOVED: { entityId: string; position: [number, number, number] }
  ENTITY_ROTATED: { entityId: string; rotation: [number, number, number] }
  ENTITY_SCALED: { entityId: string; scale: [number, number, number] }
  
  MODEL_IMPORTED: { modelId: string; name: string }
  MODEL_LOADED: { modelId: string }
  MESH_LOADED: { meshId: string; triangles: number }
  
  SCENE_CHANGED: { timestamp: number }
  SCENE_SAVED: { path?: string }
  SCENE_LOADED: { path?: string }
  
  SELECTION_CHANGED: { selectedIds: string[] }
  VIEW_MODE_CHANGED: { mode: 'visual' | 'collision' | 'wireframe' | 'physics' | 'sensors' | 'lighting' }
  GIZMO_MODE_CHANGED: { mode: 'translate' | 'rotate' | 'scale' }
  SPACE_MODE_CHANGED: { space: 'world' | 'local' }
  
  XML_UPDATED: { xml: string }
  XML_PARSING_STARTED: { xml: string }
  XML_PARSING_COMPLETE: { success: boolean }
  XML_PARSING_ERROR: { error: string }
  
  UNDO: { commandIndex: number }
  REDO: { commandIndex: number }
  HISTORY_CHANGED: { canUndo: boolean; canRedo: boolean }
}

type EventCallback<T extends EditorEventType> = (payload: EditorEventPayload[T]) => void

/**
 * Type-safe event bus for editor
 * 
 * Usage:
 * ```
 * eventBus.on('ENTITY_SELECTED', (payload) => {
 *   console.log('Selected:', payload.entityId)
 * })
 * 
 * eventBus.emit('ENTITY_SELECTED', { entityId: 'robot_1' })
 * ```
 */
export class EventBus {
  private listeners: Map<EditorEventType, Set<EventCallback<any>>> = new Map()
  private eventHistory: Array<{ event: EditorEventType; timestamp: number }> = []
  private maxHistorySize = 100

  /**
   * Subscribe to an event
   */
  on<T extends EditorEventType>(event: T, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(callback as EventCallback<any>)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        callbacks.delete(callback as EventCallback<any>)
      }
    }
  }

  /**
   * Subscribe to an event once
   */
  once<T extends EditorEventType>(event: T, callback: EventCallback<T>): () => void {
    const unsubscribe = this.on(event, ((payload: EditorEventPayload[T]) => {
      callback(payload)
      unsubscribe()
    }) as EventCallback<T>)
    return unsubscribe
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends EditorEventType>(event: T, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback as EventCallback<any>)
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T extends EditorEventType>(event: T, payload: EditorEventPayload[T]): void {
    const callbacks = this.listeners.get(event)
    
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(payload)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      }
    }

    // Track in history
    this.eventHistory.push({ event, timestamp: Date.now() })
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }
  }

  /**
   * Get event emission history (for debugging)
   */
  getHistory(): Array<{ event: EditorEventType; timestamp: number }> {
    return [...this.eventHistory]
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear()
    this.eventHistory = []
  }

  /**
   * Get listener count for an event (for debugging)
   */
  listenerCount(event: EditorEventType): number {
    return this.listeners.get(event)?.size ?? 0
  }
}

/**
 * Singleton event bus instance
 */
export const eventBus = new EventBus()
