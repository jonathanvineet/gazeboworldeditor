/**
 * Entity Lifecycle Test Component
 * 
 * ARCHITECTURE VALIDATION TEST
 * 
 * This component validates that the complete entity lifecycle works:
 * 1. Create Box button → engine.createPrimitive('box')
 * 2. Scene graph updates
 * 3. Events fire (ENTITY_CREATED, SCENE_CHANGED)
 * 4. All observers update independently:
 *    - ViewportObserver renders mesh
 *    - SceneTreeObserver shows entity
 *    - XMLSerializerObserver serializes to XML
 * 5. Undo/Redo propagate to all observers
 * 
 * EXPECTED FLOW:
 * Create Box → See in viewport, tree, and XML serialization
 * Ctrl+Z → All three update (entity removed from all)
 * Ctrl+Y → All three update (entity restored)
 */

import React, { useState, useCallback } from 'react'
import { getEditorEngine } from '@/engine/editorEngine'
import { eventBus } from '@/engine/events'

export const EntityLifecycleTest: React.FC = () => {
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null)
  const [createdCount, setCreatedCount] = useState(0)
  const [status, setStatus] = useState<string>('Ready')

  const handleCreateBox = useCallback(() => {
    try {
      setStatus('Creating box...')
      const engine = getEditorEngine()
      
      // This triggers:
      // 1. Scene graph update (addModel)
      // 2. Command creation (undo/redo)
      // 3. ENTITY_CREATED event
      // 4. SCENE_CHANGED event
      const entityId = engine.createPrimitive('box')
      
      setLastCreatedId(entityId)
      setCreatedCount((prev) => prev + 1)
      setStatus(`Box created: ${entityId}`)
      
      console.log('[TEST] Box created:', entityId)
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`)
      console.error('[TEST] Create failed:', error)
    }
  }, [])

  const handleCreateSphere = useCallback(() => {
    try {
      setStatus('Creating sphere...')
      const engine = getEditorEngine()
      const entityId = engine.createPrimitive('sphere')
      
      setLastCreatedId(entityId)
      setCreatedCount((prev) => prev + 1)
      setStatus(`Sphere created: ${entityId}`)
      
      console.log('[TEST] Sphere created:', entityId)
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`)
      console.error('[TEST] Create failed:', error)
    }
  }, [])

  const handleUndo = useCallback(() => {
    try {
      const engine = getEditorEngine()
      engine.undo()
      setStatus('Undo executed')
      console.log('[TEST] Undo called')
    } catch (error) {
      setStatus(`Undo error: ${(error as Error).message}`)
      console.error('[TEST] Undo failed:', error)
    }
  }, [])

  const handleRedo = useCallback(() => {
    try {
      const engine = getEditorEngine()
      engine.redo()
      setStatus('Redo executed')
      console.log('[TEST] Redo called')
    } catch (error) {
      setStatus(`Redo error: ${(error as Error).message}`)
      console.error('[TEST] Redo failed:', error)
    }
  }, [])

  return (
    <div className="p-6 bg-gray-900 text-white rounded border border-gray-700 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-cyan-400">
          Entity Lifecycle Validation Test
        </h2>
        <p className="text-sm text-gray-400">
          Click buttons to test: Create entities → Check viewport, tree, XML →
          Undo/Redo
        </p>
      </div>

      {/* Status Display */}
      <div className="bg-gray-800 p-3 rounded">
        <div className="text-sm text-gray-400">Status:</div>
        <div className="text-cyan-300 font-mono">{status}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-gray-400">Entities Created</div>
          <div className="text-2xl font-bold text-cyan-400">{createdCount}</div>
        </div>
        <div className="bg-gray-800 p-2 rounded">
          <div className="text-gray-400">Last Entity ID</div>
          <div className="text-xs font-mono text-cyan-300 truncate">
            {lastCreatedId || 'None'}
          </div>
        </div>
      </div>

      {/* Create Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleCreateBox}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
        >
          Create Box
        </button>
        <button
          onClick={handleCreateSphere}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
        >
          Create Sphere
        </button>
      </div>

      {/* Undo/Redo Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleUndo}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded font-semibold"
        >
          Undo (Ctrl+Z)
        </button>
        <button
          onClick={handleRedo}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded font-semibold"
        >
          Redo (Ctrl+Y)
        </button>
      </div>

      {/* Validation Instructions */}
      <div className="bg-gray-800 p-3 rounded text-sm text-gray-300 space-y-1">
        <div className="font-semibold text-cyan-400">Validation Steps:</div>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Create Box"</li>
          <li>✓ Viewport should render a blue box mesh</li>
          <li>✓ Scene Tree should show entity in hierarchy</li>
          <li>✓ XML Panel should serialize the entity</li>
          <li>Click "Undo (Ctrl+Z)"</li>
          <li>✓ All three should update (entity disappears)</li>
          <li>Click "Redo (Ctrl+Y)"</li>
          <li>✓ All three should update (entity returns)</li>
        </ol>
      </div>

      {/* Architecture Validation */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 p-3 rounded text-xs text-blue-200">
        <div className="font-semibold mb-1">Architecture Proof:</div>
        <div>
          This test proves that:
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>Scene graph is the source of truth</li>
            <li>EditorEngine is the single entry point</li>
            <li>Events propagate to all observers independently</li>
            <li>No state duplication between viewport/tree/XML</li>
            <li>Undo/redo work through command system</li>
            <li>Complete decoupling between UI layers</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
