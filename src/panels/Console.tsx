'use client'

export default function Console() {
  const logs = [
    '[INFO] Editor initialized',
    '[INFO] World loaded: Untitled World',
    '[DEBUG] 3D viewport ready',
  ]

  return (
    <div className="w-full h-full bg-[#050505] font-mono text-xs overflow-auto p-2">
      {logs.map((log, idx) => (
        <div
          key={idx}
          className={`py-1 ${
            log.includes('ERROR')
              ? 'text-[#ff5c5c]'
              : log.includes('DEBUG')
                ? 'text-[#525252]'
                : 'text-[#8a8a8a]'
          }`}
        >
          {log}
        </div>
      ))}
    </div>
  )
}
