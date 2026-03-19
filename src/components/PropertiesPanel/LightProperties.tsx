'use client';

import React from 'react';
import { useWorldStore } from '@/store/worldStore';
import { NumberField, TextField, CheckboxField, ColorField, PoseFields, PropSection } from './FormFields';

interface Props { lightId: string; }

export default function LightProperties({ lightId }: Props) {
  const world = useWorldStore(s => s.world);
  const updateLight = useWorldStore(s => s.updateLight);

  const light = world.lights.find(l => l.id === lightId);
  if (!light) return <div className="text-zinc-600 text-xs">Light not found</div>;

  return (
    <div>
      <PropSection title="Light">
        <TextField label="Name" value={light.name} onChange={v => updateLight(lightId, { name: v })} />
        <div className="flex items-center gap-1 mb-1">
          <label className="text-zinc-400 text-xs w-12">Type</label>
          <select
            value={light.type}
            onChange={e => updateLight(lightId, { type: e.target.value as 'point' | 'directional' | 'spot' })}
            className="flex-1 bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5"
          >
            <option value="point">Point</option>
            <option value="directional">Directional</option>
            <option value="spot">Spot</option>
          </select>
        </div>
        <CheckboxField label="Cast Shadows" value={light.castShadows} onChange={v => updateLight(lightId, { castShadows: v })} />
      </PropSection>

      <PropSection title="Pose">
        <PoseFields pose={light.pose} onChange={p => updateLight(lightId, { pose: p })} />
      </PropSection>

      <PropSection title="Colors">
        <ColorField label="Diffuse" value={light.diffuse} onChange={v => updateLight(lightId, { diffuse: v })} />
        <ColorField label="Specular" value={light.specular} onChange={v => updateLight(lightId, { specular: v })} />
      </PropSection>

      <PropSection title="Attenuation">
        <NumberField label="Range" value={light.attenuationRange} onChange={v => updateLight(lightId, { attenuationRange: v })} />
        <NumberField label="Const" value={light.attenuationConstant} step={0.01} onChange={v => updateLight(lightId, { attenuationConstant: v })} />
        <NumberField label="Linear" value={light.attenuationLinear} step={0.001} onChange={v => updateLight(lightId, { attenuationLinear: v })} />
        <NumberField label="Quad" value={light.attenuationQuadratic} step={0.0001} onChange={v => updateLight(lightId, { attenuationQuadratic: v })} />
      </PropSection>

      {light.type === 'spot' && (
        <PropSection title="Spot">
          <NumberField label="Inner" value={light.innerAngle ?? 0.1} step={0.01} onChange={v => updateLight(lightId, { innerAngle: v })} />
          <NumberField label="Outer" value={light.outerAngle ?? 0.5} step={0.01} onChange={v => updateLight(lightId, { outerAngle: v })} />
          <NumberField label="Falloff" value={light.falloff ?? 0.8} step={0.01} onChange={v => updateLight(lightId, { falloff: v })} />
        </PropSection>
      )}
    </div>
  );
}
