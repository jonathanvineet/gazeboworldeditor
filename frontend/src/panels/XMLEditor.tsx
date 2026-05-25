'use client'

import { useWorldStore } from '@/engine/worldStore'
import { exportWorld } from '@/sdf/serializer'

export default function XMLEditor() {
  const { world } = useWorldStore()

  return (
    <div className="w-full h-full bg-[#1e1e1e] flex flex-col">
      <div className="text-xs text-[#858585] p-2 border-b border-[#464647]">
        <button className="px-2 py-1 bg-[#464647] hover:bg-[#565656] rounded mr-2">
          Format
        </button>
        <button className="px-2 py-1 bg-[#464647] hover:bg-[#565656] rounded">
          Copy to Clipboard
        </button>
      </div>
      <pre className="flex-1 overflow-auto p-4 font-mono text-xs text-[#ce9178]">
        {exportWorld(world, 'world')}
      </pre>
    </div>
  )
}
