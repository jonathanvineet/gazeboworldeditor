'use client'

import { useWorldStore } from '@/engine/worldStore'

export default function SceneTree() {
  const { world, selectEntity, selectedEntity } = useWorldStore()

  return (
    <div className="w-full h-full bg-[#252526] text-[#cccccc] overflow-auto p-2">
      <div className="text-sm font-bold mb-2 px-2">{world.name}</div>

      {/* Models */}
      {world.models.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-[#858585] px-2 mb-1">Models</div>
          {world.models.map((model) => (
            <div
              key={model.id}
              onClick={() => selectEntity(model.id)}
              className={`px-4 py-1 text-sm cursor-pointer rounded ${
                selectedEntity === model.id
                  ? 'bg-[#0e639c] text-[#cccccc]'
                  : 'hover:bg-[#2d2d30] text-[#cccccc]'
              }`}
            >
              📦 {model.name}
            </div>
          ))}
        </div>
      )}

      {/* Lights */}
      {world.lights.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-[#858585] px-2 mb-1">Lights</div>
          {world.lights.map((light) => (
            <div
              key={light.id}
              onClick={() => selectEntity(light.id)}
              className={`px-4 py-1 text-sm cursor-pointer rounded ${
                selectedEntity === light.id
                  ? 'bg-[#0e639c] text-[#cccccc]'
                  : 'hover:bg-[#2d2d30] text-[#cccccc]'
              }`}
            >
              💡 {light.name}
            </div>
          ))}
        </div>
      )}

      {/* Includes */}
      {world.includes.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-[#858585] px-2 mb-1">Includes</div>
          {world.includes.map((inc) => (
            <div
              key={inc.id}
              onClick={() => selectEntity(inc.id)}
              className={`px-4 py-1 text-sm cursor-pointer rounded ${
                selectedEntity === inc.id
                  ? 'bg-[#0e639c] text-[#cccccc]'
                  : 'hover:bg-[#2d2d30] text-[#cccccc]'
              }`}
            >
              📍 {inc.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
