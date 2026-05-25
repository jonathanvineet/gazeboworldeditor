'use client'

import { useWorldStore } from '@/engine/worldStore'
import { downloadWorld } from '@/sdf/serializer'

export default function Toolbar() {
  const { world, setMode, mode, undo, redo, canUndo, canRedo, newWorld } =
    useWorldStore()

  return (
    <div className="h-full bg-[#1e1e1e] border-b border-[#464647] flex items-center px-4 gap-4">
      {/* File operations */}
      <div className="flex gap-2 border-r border-[#464647] pr-4">
        <button
          onClick={() => newWorld()}
          className="px-3 py-1 text-sm bg-[#0e639c] hover:bg-[#1177bb] rounded text-[#cccccc]"
          title="New World"
        >
          New
        </button>
        <button
          className="px-3 py-1 text-sm bg-[#0e639c] hover:bg-[#1177bb] rounded text-[#cccccc]"
          title="Import World"
        >
          Import
        </button>
        <button
          onClick={() => downloadWorld(world, world.name, 'world')}
          className="px-3 py-1 text-sm bg-[#0e639c] hover:bg-[#1177bb] rounded text-[#cccccc]"
          title="Export as .world"
        >
          Export
        </button>
      </div>

      {/* Add primitives */}
      <div className="flex gap-2 border-r border-[#464647] pr-4">
        <button className="px-3 py-1 text-sm bg-[#464647] hover:bg-[#565656] rounded text-[#cccccc]">
          + Box
        </button>
        <button className="px-3 py-1 text-sm bg-[#464647] hover:bg-[#565656] rounded text-[#cccccc]">
          + Sphere
        </button>
        <button className="px-3 py-1 text-sm bg-[#464647] hover:bg-[#565656] rounded text-[#cccccc]">
          + Cylinder
        </button>
        <button className="px-3 py-1 text-sm bg-[#464647] hover:bg-[#565656] rounded text-[#cccccc]">
          + Light
        </button>
      </div>

      {/* Transform mode */}
      <div className="flex gap-2 border-r border-[#464647] pr-4">
        <button
          onClick={() => setMode('translate')}
          className={`px-3 py-1 text-sm rounded ${
            mode === 'translate'
              ? 'bg-[#0e639c] text-[#cccccc]'
              : 'bg-[#464647] hover:bg-[#565656] text-[#858585]'
          }`}
          title="Translate (T)"
        >
          T
        </button>
        <button
          onClick={() => setMode('rotate')}
          className={`px-3 py-1 text-sm rounded ${
            mode === 'rotate'
              ? 'bg-[#0e639c] text-[#cccccc]'
              : 'bg-[#464647] hover:bg-[#565656] text-[#858585]'
          }`}
          title="Rotate (R)"
        >
          R
        </button>
        <button
          onClick={() => setMode('scale')}
          className={`px-3 py-1 text-sm rounded ${
            mode === 'scale'
              ? 'bg-[#0e639c] text-[#cccccc]'
              : 'bg-[#464647] hover:bg-[#565656] text-[#858585]'
          }`}
          title="Scale (S)"
        >
          S
        </button>
      </div>

      {/* History */}
      <div className="flex gap-2">
        <button
          onClick={undo}
          disabled={!canUndo()}
          className={`px-3 py-1 text-sm rounded ${
            canUndo()
              ? 'bg-[#464647] hover:bg-[#565656] text-[#cccccc]'
              : 'bg-[#464647] text-[#858585] opacity-50 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className={`px-3 py-1 text-sm rounded ${
            canRedo()
              ? 'bg-[#464647] hover:bg-[#565656] text-[#cccccc]'
              : 'bg-[#464647] text-[#858585] opacity-50 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* World info */}
      <div className="text-xs text-[#858585] border-l border-[#464647] pl-4">
        <span>{world.name}</span> • <span>{world.models.length} models</span> •{' '}
        <span>{world.lights.length} lights</span>
      </div>
    </div>
  )
}
