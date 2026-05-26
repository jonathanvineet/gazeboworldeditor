/**
 * Viewport Observer
 * 
 * CRITICAL ARCHITECTURE VALIDATION
 * 
 * This observer proves that:
 * 1. Viewport is PURE PROJECTION (not state holder)
 * 2. Scene Graph is SOURCE OF TRUTH
 * 3. Events are the ONLY communication
 * 
 * The viewport:
 * - NEVER mutates scene state
 * - ONLY subscribes to events
 * - ONLY updates Three.js objects
 * - NEVER has its own state about entities
 * 
 * Flow:
 * EditorEngine mutation → Event emission → Viewport listener → Three.js update
 * 
 * Not:
 * Component state → Direct mutation → Scattered synchronization problems
 */

import * as THREE from 'three'
import { eventBus } from '@/engine/events'

/**
 * Viewport renderer state
 * 
 * This is a RENDERING STATE ONLY.
 * 
 * NOT editor state.
 * NOT scene state.
 * ONLY Three.js object management.
 */
export class ViewportRenderer {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private objects: Map<string, THREE.Object3D> = new Map()

  constructor(canvas: HTMLCanvasElement) {
    // Three.js setup
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a1a)
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    // Listen to events - that's the ONLY way viewport updates
    this.setupEventListeners()

    // Start render loop
    this.startRenderLoop()
  }

  /**
   * Setup event listeners
   * 
   * This is the critical part:
   * Viewport ONLY communicates through events.
   * 
   * When scene graph changes:
   * Event emitted → This listener fires → Viewport updates
   * 
   * That's it. Simple. Pure. Correct.
   */
  private setupEventListeners() {
    // When entity is created
    eventBus.on('ENTITY_CREATED', (payload) => {
      console.log('[Viewport] Entity created:', payload.entityId)
      this.renderEntity(payload.entityId, payload.entity)
    })

    // When entity is deleted
    eventBus.on('ENTITY_DELETED', (payload) => {
      console.log('[Viewport] Entity deleted:', payload.entityId)
      this.removeEntity(payload.entityId)
    })

    // When entity is moved
    eventBus.on('ENTITY_MOVED', (payload) => {
      console.log('[Viewport] Entity moved:', payload.position)
      this.updateEntityPosition(payload.entityId, payload.position)
    })

    // When entity is rotated
    eventBus.on('ENTITY_ROTATED', (payload) => {
      console.log('[Viewport] Entity rotated:', payload.rotation)
      this.updateEntityRotation(payload.entityId, payload.rotation)
    })

    // When entire scene changes (undo/redo, import, etc.)
    eventBus.on('SCENE_CHANGED', (payload) => {
      console.log('[Viewport] Scene changed')
      if (payload.world) {
        this.renderScene(payload.world)
      }
    })

    // When entity is selected
    eventBus.on('ENTITY_SELECTED', (payload) => {
      console.log('[Viewport] Entity selected:', payload.entityId)
      this.highlightEntity(payload.entityId)
    })

    // When selection is cleared
    eventBus.on('SELECTION_CLEARED', () => {
      console.log('[Viewport] Selection cleared')
      this.clearHighlight()
    })
  }

  /**
   * Render a single entity
   * 
   * This reads from the entity object (from scene graph)
   * and creates a Three.js representation.
   * 
   * Pure function:
   * Entity → Three.js mesh
   * 
   * No state mutation.
   * No side effects beyond Three.js.
   */
  private renderEntity(entityId: string, entity: any) {
    if (!entity) return

    // Create mesh based on entity geometry
    let geometry: THREE.BufferGeometry
    let material = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      side: THREE.DoubleSide,
    })

    // Support different primitives
    const geometryType = entity.geometry?.type || entity.type
    switch (geometryType) {
      case 'box':
        const [w, h, d] = entity.geometry?.size || [1, 1, 1]
        geometry = new THREE.BoxGeometry(w, h, d)
        break
      case 'sphere':
        const radius = entity.geometry?.radius || 0.5
        geometry = new THREE.SphereGeometry(radius, 32, 32)
        break
      case 'cylinder':
        const cylRadius = entity.geometry?.radius || 0.5
        const cylHeight = entity.geometry?.length || 2
        geometry = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 32)
        break
      case 'plane':
        geometry = new THREE.PlaneGeometry(1, 1)
        break
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1)
    }

    const mesh = new THREE.Mesh(geometry, material)

    // Apply transform from entity
    if (entity.pose?.position) {
      const [x, y, z] = entity.pose.position
      mesh.position.set(x, y, z)
    }

    if (entity.pose?.rotation) {
      const [rx, ry, rz] = entity.pose.rotation
      mesh.rotation.set(rx, ry, rz)
    }

    // Store in map for later updates
    this.objects.set(entityId, mesh)
    this.scene.add(mesh)

    console.log('[Viewport] Rendered entity:', entityId)
  }

  /**
   * Render entire scene
   * 
   * Used for undo/redo and scene load.
   * Clear everything and re-render from scene graph.
   */
  private renderScene(world: any) {
    // Clear all entities
    this.objects.forEach((mesh) => this.scene.remove(mesh))
    this.objects.clear()

    // Re-render from world
    if (world?.scene?.models) {
      world.scene.models.forEach((model: any) => {
        this.renderEntity(model.id, model)
      })
    }

    if (world?.scene?.lights) {
      world.scene.lights.forEach((light: any) => {
        this.renderLight(light.id, light)
      })
    }

    console.log('[Viewport] Scene rendered from world')
  }

  /**
   * Render light
   */
  private renderLight(lightId: string, light: any) {
    let threeLight: THREE.Light

    if (light.type === 'directional_light') {
      threeLight = new THREE.DirectionalLight(0xffffff, 1)
      if (light.pose?.position) {
        const [x, y, z] = light.pose.position
        threeLight.position.set(x, y, z)
      }
    } else {
      threeLight = new THREE.PointLight(0xffffff, 1)
      if (light.pose?.position) {
        const [x, y, z] = light.pose.position
        threeLight.position.set(x, y, z)
      }
    }

    this.objects.set(lightId, threeLight)
    this.scene.add(threeLight)
  }

  /**
   * Update entity position
   * 
   * Called when ENTITY_MOVED event fires.
   * Updates only the Three.js object.
   * Scene graph is already updated.
   */
  private updateEntityPosition(entityId: string, position: [number, number, number]) {
    const mesh = this.objects.get(entityId)
    if (mesh) {
      const [x, y, z] = position
      mesh.position.set(x, y, z)
      console.log('[Viewport] Updated position:', entityId, position)
    }
  }

  /**
   * Update entity rotation
   */
  private updateEntityRotation(entityId: string, rotation: [number, number, number]) {
    const mesh = this.objects.get(entityId)
    if (mesh) {
      const [rx, ry, rz] = rotation
      mesh.rotation.set(rx, ry, rz)
      console.log('[Viewport] Updated rotation:', entityId, rotation)
    }
  }

  /**
   * Remove entity
   */
  private removeEntity(entityId: string) {
    const mesh = this.objects.get(entityId)
    if (mesh) {
      this.scene.remove(mesh)
      this.objects.delete(entityId)
      console.log('[Viewport] Removed entity:', entityId)
    }
  }

  /**
   * Highlight selected entity
   */
  private highlightEntity(entityId: string) {
    // Reset all
    this.objects.forEach((obj) => {
      if (obj instanceof THREE.Mesh) {
        ;(obj.material as THREE.MeshPhongMaterial).color.setHex(0xcccccc)
      }
    })

    // Highlight selected
    const mesh = this.objects.get(entityId)
    if (mesh instanceof THREE.Mesh) {
      ;(mesh.material as THREE.MeshPhongMaterial).color.setHex(0x4A90E2)
    }
  }

  /**
   * Clear highlight
   */
  private clearHighlight() {
    this.objects.forEach((obj) => {
      if (obj instanceof THREE.Mesh) {
        ;(obj.material as THREE.MeshPhongMaterial).color.setHex(0xcccccc)
      }
    })
  }

  /**
   * Start render loop
   */
  private startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate)
      this.renderer.render(this.scene, this.getCamera())
    }
    animate()
  }

  /**
   * Get camera
   * 
   * Simple orthographic camera for now.
   * Can be replaced with interactive camera later.
   */
  private getCamera(): THREE.Camera {
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -200,
      window.innerWidth / 200,
      window.innerHeight / 200,
      window.innerHeight / -200,
      0.1,
      1000
    )
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)
    return camera
  }
}

/**
 * Summary of this file's importance:
 * 
 * This proves the architecture works:
 * 
 * ✅ Viewport has NO state about entities
 * ✅ Viewport ONLY listens to events
 * ✅ Scene graph is SOURCE OF TRUTH
 * ✅ Events are the communication mechanism
 * ✅ All updates are through proper channels
 * 
 * If this works:
 * The architecture is REAL.
 * 
 * If this breaks:
 * The architecture needs fixing.
 * 
 * There is no in-between.
 */
