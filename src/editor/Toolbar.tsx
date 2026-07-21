'use client'

import { useWorldStore } from '@/engine/worldStore'
import { downloadWorld } from '@/sdf/serializer'

export default function Toolbar() {
  const { world, setMode, mode, undo, redo, canUndo, canRedo, newWorld } =
    useWorldStore()

  return (
    <div className="h-full bg-[#050505] border-b border-[#232323] flex items-center px-4 gap-4">
      {/* File operations */}
      <div className="flex gap-2 border-r border-[#232323] pr-4">
        <button
          onClick={() => newWorld()}
          className="px-3 py-1 text-xs uppercase tracking-wide bg-[#eaeaea] hover:bg-white text-[#050505] font-medium transition-colors"
          title="New World"
        >
          New
        </button>
        <button
          className="px-3 py-1 text-xs uppercase tracking-wide border border-[#2a2a2a] bg-[#141414] hover:bg-[#202020] text-[#f2f2f2] transition-colors"
          title="Import World"
        >
          Import
        </button>
        <button
          onClick={() => downloadWorld(world, world.name, 'world')}
          className="px-3 py-1 text-xs uppercase tracking-wide border border-[#2a2a2a] bg-[#141414] hover:bg-[#202020] text-[#f2f2f2] transition-colors"
          title="Export as .world"
        >
          Export
        </button>
      </div>

      {/* Add primitives */}
      <div className="flex gap-2 border-r border-[#232323] pr-4">
        <button className="px-3 py-1 text-xs border border-[#2a2a2a] bg-[#141414] hover:bg-[#202020] text-[#f2f2f2] transition-colors">
          + Box
        </button>
        <button className="px-3 py-1 text-xs border border-[#2a2a2a] bg-[#141414] hover:bg-[#202020] text-[#f2f2f2] transition-colors">
          + Sphere
        </button>
        <button className="px-3 py-1 text-xs border border-[#2a2a2a] bg-[#141414] hover:bg-[#202020] text-[#f2f2f2] transition-colors">
          + Cylinder
        </button>
        <button className="px-3 py-1 text-xs border border-[#2a2a2a] bg-[#141414] hover:bg-[#202020] text-[#f2f2f2] transition-colors">
          + Light
        </button>
      </div>

      {/* Transform mode */}
      <div className="flex gap-1 border-r border-[#232323] pr-4 font-mono">
        <button
          onClick={() => setMode('translate')}
          className={`w-8 py-1 text-xs border transition-colors ${
            mode === 'translate'
              ? 'bg-[#eaeaea] text-[#050505] border-[#eaeaea]'
              : 'bg-[#141414] hover:bg-[#202020] text-[#8a8a8a] border-[#2a2a2a]'
          }`}
          title="Translate (T)"
        >
          T
        </button>
        <button
          onClick={() => setMode('rotate')}
          className={`w-8 py-1 text-xs border transition-colors ${
            mode === 'rotate'
              ? 'bg-[#eaeaea] text-[#050505] border-[#eaeaea]'
              : 'bg-[#141414] hover:bg-[#202020] text-[#8a8a8a] border-[#2a2a2a]'
          }`}
          title="Rotate (R)"
        >
          R
        </button>
        <button
          onClick={() => setMode('scale')}
          className={`w-8 py-1 text-xs border transition-colors ${
            mode === 'scale'
              ? 'bg-[#eaeaea] text-[#050505] border-[#eaeaea]'
              : 'bg-[#141414] hover:bg-[#202020] text-[#8a8a8a] border-[#2a2a2a]'
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
          className={`px-3 py-1 text-xs border border-[#2a2a2a] transition-colors ${
            canUndo()
              ? 'bg-[#141414] hover:bg-[#202020] text-[#f2f2f2]'
              : 'bg-[#141414] text-[#525252] opacity-50 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className={`px-3 py-1 text-xs border border-[#2a2a2a] transition-colors ${
            canRedo()
              ? 'bg-[#141414] hover:bg-[#202020] text-[#f2f2f2]'
              : 'bg-[#141414] text-[#525252] opacity-50 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* World info */}
      <div className="text-xs font-mono text-[#8a8a8a] border-l border-[#232323] pl-4">
        <span className="text-[#f2f2f2]">{world.name}</span>
        <span className="text-[#525252]"> · </span>
        <span>{world.models.length} models</span>
        <span className="text-[#525252]"> · </span>
        <span>{world.lights.length} lights</span>
      </div>
    </div>
  )
}
