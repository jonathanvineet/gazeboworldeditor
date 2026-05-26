'use client';

import React from 'react';
import { useWorldStore } from '@/store/worldStore';
import { SDFGeometry } from '@/types/sdf.types';
import { NumberField, TextField, CheckboxField, ColorField, PoseFields, PropSection } from './FormFields';

interface Props { modelId: string; }

const GEOM_TYPES = ['box', 'sphere', 'cylinder', 'plane', 'mesh'] as const;

function GeometryEditor({ geom, onChange }: { geom: SDFGeometry; onChange: (g: SDFGeometry) => void }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className="text-zinc-400 text-xs w-12">Type</label>
        <select
          value={geom.type}
          onChange={e => {
            const t = e.target.value as SDFGeometry['type'];
            if (t === 'box') onChange({ type: 'box', size: [1, 1, 1] });
            else if (t === 'sphere') onChange({ type: 'sphere', radius: 0.5 });
            else if (t === 'cylinder') onChange({ type: 'cylinder', radius: 0.5, length: 1 });
            else if (t === 'plane') onChange({ type: 'plane', normal: [0, 0, 1], size: [10, 10] });
            else onChange({ type: 'mesh', uri: '' });
          }}
          className="flex-1 bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5"
        >
          {GEOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {geom.type === 'box' && (
        <div className="flex gap-1">
          {(['x', 'y', 'z'] as const).map((axis, i) => (
            <div key={axis} className="flex-1">
              <label className="text-zinc-500 text-xs block text-center">{axis.toUpperCase()}</label>
              <input
                type="number"
                value={geom.size[i]}
                step={0.01}
                min={0.001}
                onChange={e => {
                  const s = [...geom.size] as [number, number, number];
                  s[i] = parseFloat(e.target.value) || 0.001;
                  onChange({ ...geom, size: s });
                }}
                className="w-full bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5"
              />
            </div>
          ))}
        </div>
      )}

      {geom.type === 'sphere' && (
        <NumberField label="Radius" value={geom.radius} min={0.001}
          onChange={v => onChange({ ...geom, radius: v })} />
      )}

      {geom.type === 'cylinder' && (
        <>
          <NumberField label="Radius" value={geom.radius} min={0.001}
            onChange={v => onChange({ ...geom, radius: v })} />
          <NumberField label="Length" value={geom.length} min={0.001}
            onChange={v => onChange({ ...geom, length: v })} />
        </>
      )}

      {geom.type === 'plane' && (
        <>
          <div className="flex gap-1">
            {(['x', 'y'] as const).map((axis, i) => (
              <div key={axis} className="flex-1">
                <label className="text-zinc-500 text-xs block text-center">Size {axis.toUpperCase()}</label>
                <input
                  type="number"
                  value={geom.size[i]}
                  step={0.1}
                  min={0.001}
                  onChange={e => {
                    const s = [...geom.size] as [number, number];
                    s[i] = parseFloat(e.target.value) || 0.001;
                    onChange({ ...geom, size: s });
                  }}
                  className="w-full bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5"
                />
              </div>
            ))}
          </div>
        </>
      )}

      {geom.type === 'mesh' && (
        <div className="flex items-center gap-1 mb-1">
          <label className="text-zinc-400 text-xs w-8">URI</label>
          <input
            type="text"
            value={geom.uri}
            onChange={e => onChange({ ...geom, uri: e.target.value })}
            className="flex-1 bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5"
            placeholder="model://..."
          />
        </div>
      )}
    </div>
  );
}

export default function ModelProperties({ modelId }: Props) {
  const world = useWorldStore(s => s.world);
  const updateModel = useWorldStore(s => s.updateModel);
  const updateModelPose = useWorldStore(s => s.updateModelPose);
  const updateVisual = useWorldStore(s => s.updateVisual);
  const updateVisualGeometry = useWorldStore(s => s.updateVisualGeometry);

  const model = world.models.find(m => m.id === modelId);
  if (!model) return <div className="text-zinc-600 text-xs">Model not found</div>;

  return (
    <div>
      <PropSection title="Model">
        <TextField label="Name" value={model.name} onChange={v => updateModel(modelId, { name: v })} />
        <CheckboxField label="Static" value={model.isStatic} onChange={v => updateModel(modelId, { isStatic: v })} />
      </PropSection>

      <PropSection title="Pose">
        <PoseFields pose={model.pose} onChange={p => updateModelPose(modelId, p)} />
      </PropSection>

      {model.links.map(link => (
        <PropSection key={link.id} title={`Link: ${link.name}`}>
          {link.visuals.map(visual => (
            <div key={visual.id} className="mb-2">
              <div className="text-zinc-500 text-xs mb-1">Visual: {visual.name}</div>
              <GeometryEditor
                geom={visual.geometry}
                onChange={g => updateVisualGeometry(modelId, link.id, visual.id, g)}
              />
              <div className="mt-1">
                <ColorField
                  label="Color"
                  value={visual.material.diffuse}
                  onChange={c => updateVisual(modelId, link.id, visual.id, {
                    material: { ...visual.material, diffuse: c }
                  })}
                />
                <CheckboxField
                  label="Shadows"
                  value={visual.castShadows}
                  onChange={v => updateVisual(modelId, link.id, visual.id, { castShadows: v })}
                />
              </div>
            </div>
          ))}
        </PropSection>
      ))}
    </div>
  );
}
