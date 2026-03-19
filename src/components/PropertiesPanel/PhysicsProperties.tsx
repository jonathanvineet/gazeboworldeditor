'use client';

import React from 'react';
import { useWorldStore } from '@/store/worldStore';
import { NumberField, PropSection } from './FormFields';

export default function PhysicsProperties() {
  const world = useWorldStore(s => s.world);
  const updatePhysics = useWorldStore(s => s.updatePhysics);

  return (
    <div>
      <PropSection title="Physics">
        <div className="flex items-center gap-1 mb-1">
          <label className="text-zinc-400 text-xs w-12">Engine</label>
          <select
            value={world.physics.type}
            onChange={e => updatePhysics({ type: e.target.value })}
            className="flex-1 bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5"
          >
            <option value="ode">ODE</option>
            <option value="bullet">Bullet</option>
            <option value="dart">DART</option>
            <option value="simbody">Simbody</option>
          </select>
        </div>
        <NumberField
          label="Step"
          value={world.physics.maxStepSize}
          step={0.0001}
          onChange={v => updatePhysics({ maxStepSize: v })}
        />
        <NumberField
          label="RT Rate"
          value={world.physics.realTimeUpdateRate}
          step={1}
          onChange={v => updatePhysics({ realTimeUpdateRate: v })}
        />
        <NumberField
          label="RT Factor"
          value={world.physics.realTimeFactor}
          step={0.1}
          onChange={v => updatePhysics({ realTimeFactor: v })}
        />
      </PropSection>
      <PropSection title="Gravity (m/s²)">
        <div className="flex gap-1">
          {(['x', 'y', 'z'] as const).map((axis, i) => (
            <div key={axis} className="flex-1">
              <label className="text-zinc-500 text-xs block text-center">{axis.toUpperCase()}</label>
              <input
                type="number"
                value={world.physics.gravity[i]}
                step={0.1}
                onChange={e => {
                  const g = [...world.physics.gravity] as [number, number, number];
                  g[i] = parseFloat(e.target.value) || 0;
                  updatePhysics({ gravity: g });
                }}
                className="w-full bg-zinc-800 border border-zinc-600 text-white text-xs rounded px-1 py-0.5"
              />
            </div>
          ))}
        </div>
      </PropSection>
    </div>
  );
}
