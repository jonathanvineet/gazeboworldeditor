'use client'

export default function Console() {
  const logs = [
    '[INFO] Editor initialized',
    '[INFO] World loaded: Untitled World',
    '[DEBUG] 3D viewport ready',
  ]

  return (
    <div className="w-full h-full bg-[#1e1e1e] font-mono text-xs overflow-auto p-2">
      {logs.map((log, idx) => (
        <div
          key={idx}
          className={`py-1 ${
            log.includes('ERROR')
              ? 'text-[#f48771]'
              : log.includes('DEBUG')
                ? 'text-[#858585]'
                : 'text-[#6a9955]'
          }`}
        >
          {log}
        </div>
      ))}
    </div>
  )
}
