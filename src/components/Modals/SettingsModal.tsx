'use client';

import React from 'react';
import { useWorldStore } from '@/store/worldStore';
import Modal from './Modal';

export default function SettingsModal() {
  const world = useWorldStore(s => s.world);
  const showSettingsModal = useWorldStore(s => s.showSettingsModal);
  const closeSettingsModal = useWorldStore(s => s.closeSettingsModal);
  const updateWorldName = useWorldStore(s => s.updateWorldName);
  const updateSdfVersion = useWorldStore(s => s.updateSdfVersion);
  const updatePhysics = useWorldStore(s => s.updatePhysics);
  const updateScene = useWorldStore(s => s.updateScene);

  if (!showSettingsModal) return null;

  const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
  const colorToHex = (color: [number, number, number, number]) =>
    `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`;
  const hexToColor = (hex: string, alpha: number): [number, number, number, number] => [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
    alpha,
  ];

  return (
    <Modal title="World Settings" onClose={closeSettingsModal} width="w-[480px]">
      <div className="space-y-4">
        {/* World name */}
        <div>
          <label className="text-zinc-400 text-xs block mb-1">World Name</label>
          <input
            type="text"
            value={world.worldName}
            onChange={e => updateWorldName(e.target.value)}
            className="w-full bg-zinc-700 border border-zinc-600 text-white text-sm rounded px-2 py-1"
          />
        </div>

        {/* SDF Version */}
        <div>
          <label className="text-zinc-400 text-xs block mb-1">SDF Version</label>
          <select
            value={world.sdfVersion}
            onChange={e => updateSdfVersion(e.target.value as '1.6' | '1.7')}
            className="w-full bg-zinc-700 border border-zinc-600 text-white text-sm rounded px-2 py-1"
          >
            <option value="1.6">1.6</option>
            <option value="1.7">1.7</option>
          </select>
        </div>

        {/* Gravity */}
        <div>
          <label className="text-zinc-400 text-xs block mb-1">Gravity (x, y, z) m/s²</label>
          <div className="flex gap-2">
            {(['x', 'y', 'z'] as const).map((axis, i) => (
              <div key={axis} className="flex-1">
                <label className="text-zinc-500 text-xs block text-center">{axis.toUpperCase()}</label>
                <input
                  type="number"
                  step={0.1}
                  value={world.physics.gravity[i]}
                  onChange={e => {
                    const g = [...world.physics.gravity] as [number, number, number];
                    g[i] = parseFloat(e.target.value) || 0;
                    updatePhysics({ gravity: g });
                  }}
                  className="w-full bg-zinc-700 border border-zinc-600 text-white text-sm rounded px-2 py-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Scene colors */}
        <div>
          <label className="text-zinc-400 text-xs block mb-1">Scene Colors</label>
          <div className="flex gap-4">
            <div>
              <label className="text-zinc-500 text-xs block">Ambient</label>
              <input
                type="color"
                value={colorToHex(world.scene.ambient)}
                onChange={e => updateScene({ ambient: hexToColor(e.target.value, world.scene.ambient[3]) })}
                className="w-12 h-8 rounded border-0 cursor-pointer bg-zinc-700"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-xs block">Background</label>
              <input
                type="color"
                value={colorToHex(world.scene.background)}
                onChange={e => updateScene({ background: hexToColor(e.target.value, world.scene.background[3]) })}
                className="w-12 h-8 rounded border-0 cursor-pointer bg-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* Shadows */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="settings-shadows"
            checked={world.scene.shadows}
            onChange={e => updateScene({ shadows: e.target.checked })}
            className="accent-blue-500"
          />
          <label htmlFor="settings-shadows" className="text-zinc-300 text-sm cursor-pointer">Enable Shadows</label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
            onClick={closeSettingsModal}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
