'use client'

export default function AssetBrowser() {
  return (
    <div className="w-full h-full bg-[#252526] p-2">
      <input
        type="text"
        placeholder="Search models..."
        className="w-full px-2 py-1 text-sm bg-[#3e3e42] text-[#cccccc] rounded border border-[#464647] mb-2"
      />
      <div className="text-xs text-[#858585] p-2">
        Search Gazebo Fuel for models, lights, and prefabs
      </div>
    </div>
  )
}
