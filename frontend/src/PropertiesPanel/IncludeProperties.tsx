'use client';

import React from 'react';
import { useWorldStore } from '@/store/worldStore';
import { TextField, CheckboxField, PoseFields, PropSection } from './FormFields';

interface Props { includeId: string; }

export default function IncludeProperties({ includeId }: Props) {
  const world = useWorldStore(s => s.world);
  const updateInclude = useWorldStore(s => s.updateInclude);

  const inc = world.includes.find(i => i.id === includeId);
  if (!inc) return <div className="text-zinc-600 text-xs">Include not found</div>;

  return (
    <div>
      <PropSection title="Include">
        <TextField label="Name" value={inc.name} onChange={v => updateInclude(includeId, { name: v })} />
        <div className="flex items-center gap-1 mb-1">
          <label className="text-zinc-400 text-xs w-8">URI</label>
          <input
            type="text"
            value={inc.uri}
            onChange={e => updateInclude(includeId, { uri: e.target.value })}
            className="flex-1 bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5"
            placeholder="model://..."
          />
        </div>
        <CheckboxField
          label="Static"
          value={inc.isStatic ?? false}
          onChange={v => updateInclude(includeId, { isStatic: v })}
        />
      </PropSection>
      <PropSection title="Pose">
        <PoseFields pose={inc.pose} onChange={p => updateInclude(includeId, { pose: p })} />
      </PropSection>
    </div>
  );
}
