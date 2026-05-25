/**
 * Command System
 * 
 * Implements command pattern for undo/redo.
 * Each mutation is a reversible command.
 * 
 * Pattern:
 * - Command knows how to execute
 * - Command knows how to undo
 * - CommandStack maintains history
 * 
 * This ensures perfect undo/redo with no state confusion.
 */

import type { World, ModelEntity, LightEntity } from '@/types/sdf'

/**
 * Base command interface
 */
export interface Command {
  execute(): void
  undo(): void
  redo?(): void
  description: string
  timestamp: number
}

/**
 * Move entity command
 */
export class MoveEntityCommand implements Command {
  description: string
  timestamp: number

  constructor(
    private entityGetter: () => any,
    private oldPosition: [number, number, number],
    private newPosition: [number, number, number]
  ) {
    this.description = `Move entity to ${newPosition.join(', ')}`
    this.timestamp = Date.now()
  }

  execute(): void {
    const entity = this.entityGetter()
    if (entity?.pose) {
      entity.pose.position = this.newPosition
    }
  }

  undo(): void {
    const entity = this.entityGetter()
    if (entity?.pose) {
      entity.pose.position = this.oldPosition
    }
  }

  redo(): void {
    this.execute()
  }
}

/**
 * Rotate entity command
 */
export class RotateEntityCommand implements Command {
  description: string
  timestamp: number

  constructor(
    private entityGetter: () => any,
    private oldRotation: [number, number, number],
    private newRotation: [number, number, number]
  ) {
    this.description = `Rotate entity`
    this.timestamp = Date.now()
  }

  execute(): void {
    const entity = this.entityGetter()
    if (entity?.pose) {
      entity.pose.rotation = this.newRotation
    }
  }

  undo(): void {
    const entity = this.entityGetter()
    if (entity?.pose) {
      entity.pose.rotation = this.oldRotation
    }
  }

  redo(): void {
    this.execute()
  }
}

/**
 * Delete entity command
 */
export class DeleteEntityCommand implements Command {
  description: string
  timestamp: number

  constructor(
    private sceneGetter: () => any,
    private entity: any,
    private parentId?: string
  ) {
    this.description = `Delete ${entity.name}`
    this.timestamp = Date.now()
  }

  execute(): void {
    const scene = this.sceneGetter()
    if (!scene) return

    // Find and remove from parent
    if (this.entity.type === 'model') {
      scene.models = scene.models.filter((m: any) => m.id !== this.entity.id)
    } else if (this.entity.type === 'directional_light' || this.entity.type === 'point_light') {
      scene.lights = scene.lights.filter((l: any) => l.id !== this.entity.id)
    }
  }

  undo(): void {
    const scene = this.sceneGetter()
    if (!scene) return

    // Re-add entity
    if (this.entity.type === 'model') {
      scene.models.push(this.entity)
    } else if (this.entity.type === 'directional_light' || this.entity.type === 'point_light') {
      scene.lights.push(this.entity)
    }
  }

  redo(): void {
    this.execute()
  }
}

/**
 * Add entity command
 */
export class AddEntityCommand implements Command {
  description: string
  timestamp: number

  constructor(
    private sceneGetter: () => any,
    private entity: any
  ) {
    this.description = `Add ${entity.name}`
    this.timestamp = Date.now()
  }

  execute(): void {
    const scene = this.sceneGetter()
    if (!scene) return

    if (this.entity.type === 'model') {
      scene.models.push(this.entity)
    } else if (this.entity.type === 'directional_light' || this.entity.type === 'point_light') {
      scene.lights.push(this.entity)
    }
  }

  undo(): void {
    const scene = this.sceneGetter()
    if (!scene) return

    if (this.entity.type === 'model') {
      scene.models = scene.models.filter((m: any) => m.id !== this.entity.id)
    } else if (this.entity.type === 'directional_light' || this.entity.type === 'point_light') {
      scene.lights = scene.lights.filter((l: any) => l.id !== this.entity.id)
    }
  }

  redo(): void {
    this.execute()
  }
}

/**
 * Command stack - manages history
 */
export class CommandStack {
  private commands: Command[] = []
  private currentIndex: number = -1
  private maxHistorySize: number = 100

  /**
   * Execute command and add to history
   */
  execute(command: Command): void {
    // Remove any commands after current index (redo stack is invalidated)
    if (this.currentIndex < this.commands.length - 1) {
      this.commands = this.commands.slice(0, this.currentIndex + 1)
    }

    // Execute the command
    command.execute()

    // Add to history
    this.commands.push(command)
    this.currentIndex++

    // Trim history if too large
    if (this.commands.length > this.maxHistorySize) {
      this.commands.shift()
      this.currentIndex--
    }
  }

  /**
   * Undo last command
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false
    }

    const command = this.commands[this.currentIndex]
    command.undo()
    this.currentIndex--
    return true
  }

  /**
   * Redo last undone command
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false
    }

    this.currentIndex++
    const command = this.commands[this.currentIndex]
    command.redo?.() || command.execute()
    return true
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1
  }

  /**
   * Get undo description
   */
  getUndoDescription(): string | undefined {
    if (!this.canUndo()) return undefined
    return this.commands[this.currentIndex].description
  }

  /**
   * Get redo description
   */
  getRedoDescription(): string | undefined {
    if (!this.canRedo()) return undefined
    return this.commands[this.currentIndex + 1].description
  }

  /**
   * Get current history index
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /**
   * Get command count
   */
  getCommandCount(): number {
    return this.commands.length
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.commands = []
    this.currentIndex = -1
  }

  /**
   * Get history for debugging
   */
  getHistory(): Array<{ command: string; index: number }> {
    return this.commands.map((cmd, idx) => ({
      command: cmd.description,
      index: idx,
    }))
  }
}
