'use client'

import { useWorldStore } from '@/engine/worldStore'

export default function Viewport() {
  const { world } = useWorldStore()

  return (
    <div className="w-full h-full bg-[#3e3e42] flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold text-[#cccccc] mb-2">3D Viewport</div>
        <div className="text-sm text-[#858585]">
          Three.js Canvas will render here
        </div>
        <div className="mt-4 text-xs text-[#858585]">
          World: {world.name} • Models: {world.models.length}
        </div>
      </div>
    </div>
  )
}
