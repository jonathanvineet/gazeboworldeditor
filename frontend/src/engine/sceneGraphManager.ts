/**
 * Scene Graph Manager
 * 
 * Source of truth for all scene state.
 * Pure data operations - NO Three.js objects.
 * NO side effects - just mutations and serialization.
 * 
 * This is what gets saved to disk as XML/JSON.
 * Everything else is a projection of this.
 * 
 * Architecture:
 * - addEntity() → creates new entity in graph
 * - removeEntity() → deletes entity and children
 * - moveEntity() → updates position
 * - serialize() → World → SDF XML
 * - deserialize() → XML → World
 */

import { v4 as uuidv4 } from 'uuid'
import type { World, ModelEntity, LinkEntity, VisualEntity, CollisionEntity, LightEntity } from '@/types/sdf'

export class SceneGraphManager {
  private world: World
  private selectedEntityId: string | undefined
  private selectedEntities: Set<string> = new Set()

  constructor(initialWorld?: World) {
    if (initialWorld) {
      this.world = initialWorld
    } else {
      this.world = this.createDefaultWorld()
    }
  }

  /**
   * Create default empty world with sun and ground plane
   */
  private createDefaultWorld(): World {
    return {
      id: uuidv4(),
      name: 'Untitled World',
      sdfVersion: '1.9',
      physics: {
        engine: 'dart',
        gravity: [0, 0, -9.81],
        maxStepSize: 0.001,
        realTimeUpdateRate: 1000,
        defaultPhysics: { type: 'ode' },
      },
      scene: {
        ambient: [0.5, 0.5, 0.5, 1],
        background: [0.2, 0.2, 0.2, 1],
        shadows: true,
        grid: true,
      },
      models: this.createDefaultModels(),
      lights: this.createDefaultLights(),
      includes: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  }

  /**
   * Create default models (ground plane)
   */
  private createDefaultModels(): ModelEntity[] {
    return [
      {
        id: uuidv4(),
        name: 'ground_plane',
        type: 'model',
        pose: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
        },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        locked: false,
        links: [
          {
            id: uuidv4(),
            name: 'link',
            type: 'link',
            pose: { position: [0, 0, 0], rotation: [0, 0, 0] },
            scale: { x: 1, y: 1, z: 1 },
            visible: true,
            locked: false,
            visuals: [
              {
                id: uuidv4(),
                name: 'visual',
                type: 'visual',
                pose: { position: [0, 0, 0], rotation: [0, 0, 0] },
                scale: { x: 1, y: 1, z: 1 },
                visible: true,
                locked: false,
                geometry: {
                  type: 'plane',
                  normal: [0, 0, 1],
                  size: [500, 500, 0.1],
                },
                material: {
                  albedo: [0.8, 0.8, 0.8, 1],
                  roughness: 0.6,
                  metalness: 0,
                },
                castShadow: false,
                receiveShadow: true,
              },
            ],
            collisions: [
              {
                id: uuidv4(),
                name: 'collision',
                type: 'collision',
                pose: { position: [0, 0, 0], rotation: [0, 0, 0] },
                scale: { x: 1, y: 1, z: 1 },
                visible: true,
                locked: false,
                geometry: {
                  type: 'plane',
                  normal: [0, 0, 1],
                  size: [500, 500, 0.1],
                },
              },
            ],
            sensors: [],
          },
        ],
        joints: [],
        plugins: [],
        isStatic: true,
      },
    ]
  }

  /**
   * Create default lights
   */
  private createDefaultLights(): LightEntity[] {
    return [
      {
        id: uuidv4(),
        name: 'sun',
        type: 'directional_light',
        pose: {
          position: [0, 0, 10],
          rotation: [0.5, 0.5, 0],
        },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        locked: false,
        diffuse: [1, 1, 1, 1],
        specular: [0.5, 0.5, 0.5, 1],
        direction: [0, 0, -1],
        castShadows: true,
      },
    ]
  }

  // ============================================================================
  // ENTITY OPERATIONS
  // ============================================================================

  /**
   * Add model to scene
   */
  addModel(model: ModelEntity): void {
    this.world.models.push(model)
    this.world.updatedAt = Date.now()
  }

  /**
   * Add light to scene
   */
  addLight(light: LightEntity): void {
    this.world.lights.push(light)
    this.world.updatedAt = Date.now()
  }

  /**
   * Remove model from scene
   */
  removeModel(modelId: string): void {
    this.world.models = this.world.models.filter((m) => m.id !== modelId)
    if (this.selectedEntityId === modelId) {
      this.selectedEntityId = undefined
      this.selectedEntities.delete(modelId)
    }
    this.world.updatedAt = Date.now()
  }

  /**
   * Remove light from scene
   */
  removeLight(lightId: string): void {
    this.world.lights = this.world.lights.filter((l) => l.id !== lightId)
    if (this.selectedEntityId === lightId) {
      this.selectedEntityId = undefined
      this.selectedEntities.delete(lightId)
    }
    this.world.updatedAt = Date.now()
  }

  /**
   * Get entity by ID (searches all types)
   */
  getEntity(id: string): any {
    // Search models
    for (const model of this.world.models) {
      if (model.id === id) return model
      for (const link of model.links) {
        if (link.id === id) return link
        for (const visual of link.visuals) {
          if (visual.id === id) return visual
        }
        for (const collision of link.collisions) {
          if (collision.id === id) return collision
        }
      }
    }
    // Search lights
    for (const light of this.world.lights) {
      if (light.id === id) return light
    }
    return undefined
  }

  /**
   * Move entity to new position
   */
  moveEntity(entityId: string, position: [number, number, number]): void {
    const entity = this.getEntity(entityId)
    if (entity && entity.pose) {
      entity.pose.position = position
      this.world.updatedAt = Date.now()
    }
  }

  /**
   * Rotate entity
   */
  rotateEntity(entityId: string, rotation: [number, number, number]): void {
    const entity = this.getEntity(entityId)
    if (entity && entity.pose) {
      entity.pose.rotation = rotation
      this.world.updatedAt = Date.now()
    }
  }

  /**
   * Scale entity
   */
  scaleEntity(entityId: string, scale: { x: number; y: number; z: number }): void {
    const entity = this.getEntity(entityId)
    if (entity) {
      entity.scale = scale
      this.world.updatedAt = Date.now()
    }
  }

  /**
   * Duplicate entity
   */
  duplicateEntity(entityId: string): string {
    const entity = this.getEntity(entityId)
    if (!entity) return ''

    const deepClone = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') return obj
      if (Array.isArray(obj)) return obj.map(deepClone)
      if (obj instanceof Date) return new Date(obj)
      
      const cloned: any = {}
      for (const key in obj) {
        cloned[key] = deepClone(obj[key])
      }
      return cloned
    }

    const cloned = deepClone(entity)
    cloned.id = uuidv4()
    cloned.name = `${cloned.name}_copy`

    // Add to appropriate collection
    if (entity.type === 'model') {
      this.addModel(cloned)
    } else if (entity.type === 'directional_light' || entity.type === 'point_light' || entity.type === 'spot_light') {
      this.addLight(cloned)
    }

    return cloned.id
  }

  // ============================================================================
  // SELECTION
  // ============================================================================

  /**
   * Select single entity
   */
  selectEntity(entityId: string | undefined): void {
    this.selectedEntityId = entityId
    this.selectedEntities.clear()
    if (entityId) {
      this.selectedEntities.add(entityId)
    }
  }

  /**
   * Multi-select entities
   */
  selectEntities(entityIds: string[]): void {
    this.selectedEntities = new Set(entityIds)
    this.selectedEntityId = entityIds[0]
  }

  /**
   * Add to selection
   */
  addToSelection(entityId: string): void {
    this.selectedEntities.add(entityId)
    this.selectedEntityId = entityId
  }

  /**
   * Remove from selection
   */
  removeFromSelection(entityId: string): void {
    this.selectedEntities.delete(entityId)
    if (this.selectedEntityId === entityId) {
      this.selectedEntityId = Array.from(this.selectedEntities)[0]
    }
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedEntities.clear()
    this.selectedEntityId = undefined
  }

  /**
   * Get currently selected entity
   */
  getSelectedEntity(): string | undefined {
    return this.selectedEntityId
  }

  /**
   * Get all selected entities
   */
  getSelectedEntities(): string[] {
    return Array.from(this.selectedEntities)
  }

  // ============================================================================
  // SCENE OPERATIONS
  // ============================================================================

  /**
   * Get current world state
   */
  getWorld(): World {
    return this.world
  }

  /**
   * Replace entire world
   */
  setWorld(world: World): void {
    this.world = world
    this.selectedEntityId = undefined
    this.selectedEntities.clear()
  }

  /**
   * Get all models
   */
  getModels(): ModelEntity[] {
    return this.world.models
  }

  /**
   * Get all lights
   */
  getLights(): LightEntity[] {
    return this.world.lights
  }

  /**
   * Get scene hierarchy for tree display
   */
  getHierarchy() {
    return {
      world: {
        name: this.world.name,
        id: this.world.id,
        type: 'world',
      },
      models: this.world.models.map((model) => ({
        id: model.id,
        name: model.name,
        type: 'model',
        children: model.links.map((link) => ({
          id: link.id,
          name: link.name,
          type: 'link',
          children: [
            ...link.visuals.map((v) => ({ id: v.id, name: v.name, type: 'visual' })),
            ...link.collisions.map((c) => ({ id: c.id, name: c.name, type: 'collision' })),
          ],
        })),
      })),
      lights: this.world.lights.map((light) => ({
        id: light.id,
        name: light.name,
        type: light.type,
      })),
    }
  }

  /**
   * Export current world (for saving)
   */
  export(): World {
    return {
      ...this.world,
      updatedAt: Date.now(),
    }
  }

  /**
   * Import world
   */
  import(world: World): void {
    this.world = world
    this.selectedEntityId = undefined
    this.selectedEntities.clear()
  }
}

/**
 * Create singleton manager
 */
export const createSceneGraphManager = (initialWorld?: World) => {
  return new SceneGraphManager(initialWorld)
}
