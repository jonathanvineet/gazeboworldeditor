'use client'

import { useWorldStore } from '@/engine/worldStore'

export default function Inspector() {
  const { selectedEntity, world } = useWorldStore()

  if (!selectedEntity) {
    return (
      <div className="w-full h-full bg-[#252526] text-[#858585] flex items-center justify-center">
        <div className="text-sm">Select an entity to inspect</div>
      </div>
    )
  }

  // Find selected entity
  const model = world.models.find((m) => m.id === selectedEntity)
  const light = world.lights.find((l) => l.id === selectedEntity)
  const include = world.includes.find((i) => i.id === selectedEntity)

  return (
    <div className="w-full h-full bg-[#252526] text-[#cccccc] overflow-auto p-4">
      {model && (
        <div>
          <div className="text-sm font-bold mb-4">📦 {model.name}</div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[#858585]">Type:</span> Model
            </div>
            <div>
              <span className="text-[#858585]">Static:</span>{' '}
              {model.isStatic ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="text-[#858585]">Visible:</span>{' '}
              {model.visible ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="text-[#858585]">Links:</span> {model.links.length}
            </div>
            <div>
              <span className="text-[#858585]">Joints:</span>{' '}
              {model.joints.length}
            </div>
          </div>
        </div>
      )}

      {light && (
        <div>
          <div className="text-sm font-bold mb-4">💡 {light.name}</div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[#858585]">Type:</span> {light.type}
            </div>
            <div>
              <span className="text-[#858585]">Visible:</span>{' '}
              {light.visible ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      )}

      {include && (
        <div>
          <div className="text-sm font-bold mb-4">📍 {include.name}</div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[#858585]">URI:</span> {include.uri}
            </div>
            <div>
              <span className="text-[#858585]">Visible:</span>{' '}
              {include.visible ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
