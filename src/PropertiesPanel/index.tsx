'use client';

import React from 'react';
import { useWorldStore } from '@/store/worldStore';
import ModelProperties from './ModelProperties';
import LightProperties from './LightProperties';
import SceneProperties from './SceneProperties';
import PhysicsProperties from './PhysicsProperties';
import IncludeProperties from './IncludeProperties';

export default function PropertiesPanel() {
  const selectedItem = useWorldStore(s => s.selectedItem);

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-l border-zinc-700 overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-700">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Properties</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {!selectedItem && (
          <div className="text-zinc-600 text-xs text-center mt-8">
            Select an object in the scene or tree to edit properties
          </div>
        )}
        {selectedItem?.kind === 'model' && (
          <ModelProperties modelId={selectedItem.id} />
        )}
        {selectedItem?.kind === 'light' && (
          <LightProperties lightId={selectedItem.id} />
        )}
        {selectedItem?.kind === 'scene' && (
          <SceneProperties />
        )}
        {selectedItem?.kind === 'physics' && (
          <PhysicsProperties />
        )}
        {selectedItem?.kind === 'include' && (
          <IncludeProperties includeId={selectedItem.id} />
        )}
      </div>
    </div>
  );
}
