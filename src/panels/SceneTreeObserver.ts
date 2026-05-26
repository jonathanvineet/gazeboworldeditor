/**
 * Scene Tree Observer
 * 
 * ARCHITECTURE VALIDATION PROOF #2
 * 
 * This proves:
 * 1. Tree is pure PROJECTION of scene graph
 * 2. Tree NEVER owns entity data
 * 3. Tree ONLY listens to events
 * 4. Tree updates automatically on any mutation
 * 
 * Flow:
 * Scene Graph mutation → Event emission → Tree listener → Tree renders
 * 
 * Tree NEVER:
 * - Mutates scene state
 * - Stores entity data
 * - Directly updates other components
 */

import { eventBus } from '@/engine/events'
import { getEditorEngine } from '@/engine/editorEngine'

/**
 * Scene tree node for hierarchical display
 */
export interface TreeNode {
  id: string
  name: string
  type: 'model' | 'light' | 'world'
  children: TreeNode[]
  expanded: boolean
  selected: boolean
}

/**
 * Scene Tree Manager
 * 
 * Manages DISPLAY of hierarchy.
 * NOT storage of entity data.
 */
export class SceneTreeManager {
  private root: TreeNode
  private selectedIds: Set<string> = new Set()
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.root = {
      id: 'world',
      name: 'World',
      type: 'world',
      children: [],
      expanded: true,
      selected: false,
    }

    this.setupEventListeners()
  }

  /**
   * Setup event listeners
   * 
   * Tree ONLY updates in response to events.
   * That's the entire contract.
   */
  private setupEventListeners() {
    // When entity created
    eventBus.on('ENTITY_CREATED', (payload) => {
      console.log('[Tree] Entity created:', payload.entityId)
      this.rebuildTree()
      this.notifyListeners()
    })

    // When entity deleted
    eventBus.on('ENTITY_DELETED', (payload) => {
      console.log('[Tree] Entity deleted:', payload.entityId)
      this.rebuildTree()
      this.notifyListeners()
    })

    // When entity selected
    eventBus.on('ENTITY_SELECTED', (payload) => {
      console.log('[Tree] Entity selected:', payload.entityId)
      this.selectNode(payload.entityId)
      this.notifyListeners()
    })

    // When entity deselected
    eventBus.on('ENTITY_DESELECTED', (payload) => {
      console.log('[Tree] Entity deselected:', payload.entityId)
      this.deselectNode(payload.entityId)
      this.notifyListeners()
    })

    // When selection cleared
    const handleSelectionCleared = () => {
      console.log('[Tree] Selection cleared')
      this.selectedIds.clear()
      this.clearSelection()
      this.notifyListeners()
    }
    ;(eventBus.on as any)('SELECTION_CLEARED', handleSelectionCleared)

    // When scene changed (undo/redo, import, etc.)
    eventBus.on('SCENE_CHANGED', (payload) => {
      console.log('[Tree] Scene changed')
      this.rebuildTree()
      this.notifyListeners()
    })
  }

  /**
   * Rebuild tree from scene graph
   * 
   * This is PURE:
   * Scene graph → Tree hierarchy
   * 
   * No mutations.
   * No state storage.
   * Only rendering data.
   */
  private rebuildTree() {
    const engine = getEditorEngine()
    const world = engine.getWorld()

    // Reset children
    this.root.children = []

    // Add all models
    if (world?.models) {
      world.models.forEach((model: any) => {
        const node: TreeNode = {
          id: model.id,
          name: model.name || 'Model',
          type: 'model',
          children: [],
          expanded: false,
          selected: this.selectedIds.has(model.id),
        }
        this.root.children.push(node)
      })
    }

    // Add all lights
    if (world?.lights) {
      world.lights.forEach((light: any) => {
        const node: TreeNode = {
          id: light.id,
          name: light.name || 'Light',
          type: 'light',
          children: [],
          expanded: false,
          selected: this.selectedIds.has(light.id),
        }
        this.root.children.push(node)
      })
    }

    console.log('[Tree] Rebuilt from scene graph, nodes:', this.root.children.length)
  }

  /**
   * Select a node
   */
  private selectNode(nodeId: string) {
    const node = this.findNode(nodeId)
    if (node) {
      node.selected = true
      this.selectedIds.add(nodeId)
    }
  }

  /**
   * Deselect a node
   */
  private deselectNode(nodeId: string) {
    const node = this.findNode(nodeId)
    if (node) {
      node.selected = false
      this.selectedIds.delete(nodeId)
    }
  }

  /**
   * Clear all selection
   */
  private clearSelection() {
    const clearNode = (node: TreeNode) => {
      node.selected = false
      node.children.forEach(clearNode)
    }
    clearNode(this.root)
  }

  /**
   * Find node by ID
   */
  private findNode(id: string, node: TreeNode = this.root): TreeNode | null {
    if (node.id === id) return node
    for (const child of node.children) {
      const found = this.findNode(id, child)
      if (found) return found
    }
    return null
  }

  /**
   * Toggle node expansion
   */
  toggleExpanded(nodeId: string) {
    const node = this.findNode(nodeId)
    if (node) {
      node.expanded = !node.expanded
      this.notifyListeners()
    }
  }

  /**
   * User clicks node
   * 
   * CRITICAL:
   * We ONLY emit intent to EditorEngine.
   * We do NOT mutate scene ourselves.
   * 
   * EditorEngine → Scene Graph update → Event → Tree updates
   */
  selectNodeInUI(nodeId: string) {
    console.log('[Tree] User clicked node:', nodeId)
    // EMIT INTENT, don't mutate
    getEditorEngine().selectEntity(nodeId)
    // Engine will emit ENTITY_SELECTED
    // Event listener above will update tree
  }

  /**
   * User deletes node from tree context menu
   */
  deleteNodeInUI(nodeId: string) {
    console.log('[Tree] User deleted node:', nodeId)
    // EMIT INTENT
    getEditorEngine().deleteEntity(nodeId)
    // Engine will emit ENTITY_DELETED
    // Event listener above will rebuild tree
  }

  /**
   * Get tree for rendering
   */
  getTree(): TreeNode {
    return this.root
  }

  /**
   * Subscribe to tree changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach((cb) => cb())
  }
}

/**
 * Summary:
 * 
 * This proves:
 * 
 * ✅ Tree has NO entity data
 * ✅ Tree ONLY projects scene graph
 * ✅ Tree ONLY listens to events
 * ✅ Tree ONLY emits intents (selectNodeInUI, deleteNodeInUI)
 * ✅ EditorEngine handles all mutations
 * 
 * If this works:
 * Architecture is CORRECT.
 */
