/**
 * XML Serializer Observer
 * 
 * ARCHITECTURE VALIDATION PROOF #3
 * 
 * This proves:
 * 1. XML Editor is pure PROJECTION
 * 2. XML NEVER contains entity state
 * 3. XML ONLY reflects scene graph state
 * 4. XML updates automatically on mutations
 * 
 * Two-way binding through architecture:
 * 
 * Direction 1 (UI → Scene):
 * User edits XML → Parse → engine.importWorld() → Scene graph updates → Events fire
 * 
 * Direction 2 (Scene → UI):
 * engine.createEntity() → Scene graph updates → Event fires → XML Observer → Serializes
 * 
 * NO direct mutations. Everything through proper channels.
 */

import { eventBus } from '@/engine/events'
import { getEditorEngine } from '@/engine/editorEngine'
import { SDFSerializer } from '@/sdf/serializer'
import { SDFParser } from '@/sdf/parser'

/**
 * XML Serializer
 * 
 * Observes scene graph and serializes to SDF XML.
 * Parses XML edits and imports back to scene.
 */
export class XMLSerializerObserver {
  private currentXml: string = ''
  private listeners: Set<(xml: string) => void> = new Set()
  private isUpdatingFromSerialization: boolean = false

  constructor() {
    this.setupEventListeners()
  }

  /**
   * Setup event listeners
   * 
   * Listen to scene changes and auto-serialize.
   */
  private setupEventListeners() {
    // When entity created
    eventBus.on('ENTITY_CREATED', () => {
      console.log('[XML] Entity created, re-serializing')
      this.serializeScene()
    })

    // When entity deleted
    eventBus.on('ENTITY_DELETED', () => {
      console.log('[XML] Entity deleted, re-serializing')
      this.serializeScene()
    })

    // When entity moved
    eventBus.on('ENTITY_MOVED', () => {
      console.log('[XML] Entity moved, re-serializing')
      this.serializeScene()
    })

    // When entity rotated
    eventBus.on('ENTITY_ROTATED', () => {
      console.log('[XML] Entity rotated, re-serializing')
      this.serializeScene()
    })

    // When entire scene changed
    eventBus.on('SCENE_CHANGED', () => {
      if (!this.isUpdatingFromSerialization) {
        console.log('[XML] Scene changed, re-serializing')
        this.serializeScene()
      }
    })

    // When scene loaded
    eventBus.on('SCENE_LOADED', () => {
      console.log('[XML] Scene loaded, re-serializing')
      this.serializeScene()
    })
  }

  /**
   * Serialize scene to SDF XML
   * 
   * This is PURE:
   * Scene graph → SDF XML
   */
  private serializeScene() {
    const engine = getEditorEngine()
    const world = engine.getWorld()

    try {
      this.currentXml = SDFSerializer.serializeWorld(world)
      console.log('[XML] Serialized, length:', this.currentXml.length)
      this.notifyListeners()
    } catch (error) {
      console.error('[XML] Serialization error:', error)
    }
  }

  /**
   * Parse XML and import to scene
   * 
   * CRITICAL:
   * User edits XML and calls importFromXML()
   * We PARSE the XML
   * We VALIDATE it
   * We call engine.importWorld() - NOT mutate scene directly
   * EditorEngine handles the rest
   */
  importFromXML(xml: string) {
    console.log('[XML] Importing XML, length:', xml.length)

    try {
      // Parse XML to world
      const world = SDFParser.parseWorld(xml)

      // Import through EditorEngine (NOT directly)
      this.isUpdatingFromSerialization = true
      getEditorEngine().importWorld(world)
      this.isUpdatingFromSerialization = false

      // Engine will emit SCENE_LOADED
      // Our listener above will re-serialize
      console.log('[XML] Imported successfully')
    } catch (error) {
      console.error('[XML] Parse error:', error)
      // Don't import on error
      eventBus.emit('XML_PARSING_ERROR' as any, {
        error: (error as Error).message,
      })
    }
  }

  /**
   * Get current XML
   */
  getXML(): string {
    return this.currentXml
  }

  /**
   * Subscribe to XML changes
   */
  subscribe(callback: (xml: string) => void): () => void {
    this.listeners.add(callback)
    // Send current immediately
    callback(this.currentXml)
    return () => this.listeners.delete(callback)
  }

  /**
   * Notify listeners
   */
  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.currentXml))
  }
}

/**
 * Summary:
 * 
 * This proves:
 * 
 * ✅ XML has NO entity data stored
 * ✅ XML ONLY serializes scene graph
 * ✅ XML ONLY listens to events
 * ✅ XML ONLY emits imports through EditorEngine
 * ✅ All mutations go through EditorEngine
 * ✅ No direct mutations from XML
 * 
 * If this works:
 * Architecture is PROVEN to be correct.
 * 
 * XML stays synchronized WITHOUT manual sync code.
 * Why? Because everything goes through EditorEngine → Scene Graph → Events.
 */
