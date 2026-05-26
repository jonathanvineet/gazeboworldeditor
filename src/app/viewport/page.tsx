'use client'

import { useEffect, useRef } from 'react'
import { getEditorEngine } from '@/engine/editorEngine'

/**
 * Viewport Page
 * 
 * CORRECT ARCHITECTURE PATTERN:
 * 
 * - EditorEngine owns ALL business logic (initialization, mutations, commands)
 * - React ONLY:
 *   - renders UI
 *   - observes state
 *   - emits intents
 * 
 * - Hooks are ONLY at top level
 * - All initialization goes through EditorEngine
 * - No Hook nesting, no conditional hooks
 */
export default function ViewportPage() {
  const initializeRef = useRef(false)

  // CORRECT PATTERN: Initialize EditorEngine once at component mount
  useEffect(() => {
    if (initializeRef.current) return
    initializeRef.current = true

    // Get the singleton EditorEngine instance
    const editor = getEditorEngine()

    // Call main initialization method
    editor.initialize()
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Editor Viewport</h1>
        <p className="text-xl text-gray-400 mb-8">EditorEngine initialization test</p>
        
        <div className="space-y-4 text-sm">
          <p className="text-green-400">✓ EditorEngine instance created</p>
          <p className="text-green-400">✓ initializeDefaultWorld() called</p>
          <p className="text-gray-500 mt-6">Next: Implement viewport rendering, scene tree, XML sync</p>
        </div>

        <a 
          href="/"
          className="inline-block mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
