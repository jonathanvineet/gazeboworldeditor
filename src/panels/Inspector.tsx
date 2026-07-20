'use client'

import { useWorldStore } from '@/engine/worldStore'
import { createPatchCommand } from '@/engine/commands'
import { withEntityPose, withModelPatch, withLightPatch } from '@/engine/entityOps'
import { Pose } from '@/types/sdf'

function NumberField({
  label,
  value,
  onCommit,
  step = 0.1,
}: {
  label: string
  value: number
  onCommit: (value: number) => void
  step?: number
}) {
  return (
    <label className="flex items-center gap-1 text-xs">
      <span className="w-4 text-[#858585]">{label}</span>
      <input
        type="number"
        step={step}
        defaultValue={value}
        key={value}
        onBlur={(e) => {
          const next = parseFloat(e.target.value)
          if (!Number.isNaN(next) && next !== value) onCommit(next)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-1.5 py-1 text-[#cccccc] focus:outline-none focus:border-[#0e639c]"
      />
    </label>
  )
}

function PoseEditor({ pose, onChange }: { pose: Pose; onChange: (pose: Pose) => void }) {
  return (
    <div className="space-y-2">
      <div>
        <div className="text-[10px] uppercase text-[#6a6a6a] mb-1">Position</div>
        <div className="grid grid-cols-3 gap-1">
          {(['x', 'y', 'z'] as const).map((axis, i) => (
            <NumberField
              key={axis}
              label={axis.toUpperCase()}
              value={pose.position[i]}
              onCommit={(v) => {
                const position = [...pose.position] as [number, number, number]
                position[i] = v
                onChange({ ...pose, position })
              }}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase text-[#6a6a6a] mb-1">Rotation (rad)</div>
        <div className="grid grid-cols-3 gap-1">
          {(['r', 'p', 'y'] as const).map((axis, i) => (
            <NumberField
              key={axis}
              label={axis.toUpperCase()}
              value={pose.rotation[i]}
              step={0.05}
              onCommit={(v) => {
                const rotation = [...pose.rotation] as [number, number, number]
                rotation[i] = v
                onChange({ ...pose, rotation })
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Inspector() {
  const { selectedEntity, world, executeCommand } = useWorldStore()

  if (!selectedEntity) {
    return (
      <div className="w-full h-full bg-[#252526] text-[#858585] flex items-center justify-center">
        <div className="text-sm">Select an entity to inspect</div>
      </div>
    )
  }

  const model = world.models.find((m) => m.id === selectedEntity)
  const light = world.lights.find((l) => l.id === selectedEntity)
  const include = world.includes.find((i) => i.id === selectedEntity)

  const commitPose = (pose: Pose) => {
    const currentWorld = useWorldStore.getState().world
    const before = withEntityPose(currentWorld, selectedEntity, findPose())
    const after = withEntityPose(currentWorld, selectedEntity, pose)
    executeCommand(createPatchCommand('edit-pose', before, after))
  }

  const findPose = (): Pose => (model ?? light ?? include)!.pose

  return (
    <div className="w-full h-full bg-[#252526] text-[#cccccc] overflow-auto p-3 space-y-4">
      {model && (
        <>
          <div className="text-sm font-bold">📦 {model.name}</div>

          <PoseEditor pose={model.pose} onChange={commitPose} />

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={model.isStatic}
              onChange={(e) => {
                const currentWorld = useWorldStore.getState().world
                executeCommand(
                  createPatchCommand(
                    'toggle-static',
                    withModelPatch(currentWorld, model.id, { isStatic: model.isStatic }),
                    withModelPatch(currentWorld, model.id, { isStatic: e.target.checked })
                  )
                )
              }}
            />
            Static
          </label>

          <div className="text-xs space-y-1 text-[#858585]">
            <div>Links: {model.links.length}</div>
            <div>Joints: {model.joints.length}</div>
          </div>

          {model.links[0]?.visuals[0] && (
            <div>
              <div className="text-[10px] uppercase text-[#6a6a6a] mb-1">Color</div>
              <input
                type="color"
                defaultValue={rgbToHex(
                  model.links[0].visuals[0].material?.albedo ??
                    model.links[0].visuals[0].material?.diffuse ?? [0.6, 0.6, 0.6, 1]
                )}
                onChange={(e) => {
                  const currentWorld = useWorldStore.getState().world
                  const albedo = hexToRgb(e.target.value)
                  const links = model.links.map((l, li) =>
                    li === 0
                      ? {
                          ...l,
                          visuals: l.visuals.map((v, vi) =>
                            vi === 0 ? { ...v, material: { ...v.material, albedo } } : v
                          ),
                        }
                      : l
                  )
                  executeCommand(
                    createPatchCommand(
                      'edit-color',
                      withModelPatch(currentWorld, model.id, { links: model.links }),
                      withModelPatch(currentWorld, model.id, { links })
                    )
                  )
                }}
                className="w-full h-7 bg-[#1e1e1e] border border-[#3e3e42] rounded"
              />
            </div>
          )}
        </>
      )}

      {light && (
        <>
          <div className="text-sm font-bold">💡 {light.name}</div>
          <div className="text-xs text-[#858585]">Type: {light.type}</div>

          <PoseEditor pose={light.pose} onChange={commitPose} />

          <div>
            <div className="text-[10px] uppercase text-[#6a6a6a] mb-1">Color</div>
            <input
              type="color"
              defaultValue={rgbToHex(light.diffuse)}
              onChange={(e) => {
                const currentWorld = useWorldStore.getState().world
                const diffuse = hexToRgb(e.target.value)
                executeCommand(
                  createPatchCommand(
                    'edit-light-color',
                    withLightPatch(currentWorld, light.id, { diffuse: light.diffuse }),
                    withLightPatch(currentWorld, light.id, { diffuse })
                  )
                )
              }}
              className="w-full h-7 bg-[#1e1e1e] border border-[#3e3e42] rounded"
            />
          </div>
        </>
      )}

      {include && (
        <>
          <div className="text-sm font-bold">📍 {include.name}</div>
          <div className="text-xs text-[#858585] break-all">URI: {include.uri}</div>
          <PoseEditor pose={include.pose} onChange={commitPose} />
        </>
      )}
    </div>
  )
}

function rgbToHex([r, g, b]: [number, number, number, number]): string {
  const toHex = (c: number) =>
    Math.round(Math.min(Math.max(c, 0), 1) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToRgb(hex: string): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return [r, g, b, 1]
}
