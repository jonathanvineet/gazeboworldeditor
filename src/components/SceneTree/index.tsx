'use client';

import React, { useState } from 'react';
import { useWorldStore } from '@/store/worldStore';
import { SelectableItem } from '@/types/sdf.types';

interface TreeItemProps {
  label: string;
  icon: string;
  isSelected: boolean;
  isVisible?: boolean;
  onSelect: () => void;
  onToggleVisibility?: () => void;
  onDelete?: () => void;
  indent?: number;
}

function TreeItem({
  label, icon, isSelected, isVisible, onSelect, onToggleVisibility, onDelete, indent = 0
}: TreeItemProps) {
  return (
    <div
      className={`flex items-center group px-2 py-1 cursor-pointer rounded text-xs ${
        isSelected ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'
      }`}
      style={{ paddingLeft: `${8 + indent * 12}px` }}
      onClick={onSelect}
    >
      <span className="mr-1 flex-shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100">
        {onToggleVisibility && (
          <button
            className="text-zinc-400 hover:text-white p-0.5 rounded"
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
            title={isVisible ? 'Hide' : 'Show'}
          >
            {isVisible ? '👁' : '🙈'}
          </button>
        )}
        {onDelete && (
          <button
            className="text-red-400 hover:text-red-200 p-0.5 rounded"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        className="w-full flex items-center px-2 py-1 text-xs font-semibold text-zinc-400 hover:text-zinc-200 uppercase tracking-wider"
        onClick={() => setOpen(o => !o)}
      >
        <span className="mr-1">{open ? '▾' : '▸'}</span>
        {title}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export default function SceneTree() {
  const world = useWorldStore(s => s.world);
  const selectedItem = useWorldStore(s => s.selectedItem);
  const setSelectedItem = useWorldStore(s => s.setSelectedItem);
  const removeModel = useWorldStore(s => s.removeModel);
  const removeLight = useWorldStore(s => s.removeLight);
  const removeInclude = useWorldStore(s => s.removeInclude);
  const toggleModelVisibility = useWorldStore(s => s.toggleModelVisibility);
  const toggleLightVisibility = useWorldStore(s => s.toggleLightVisibility);

  const isSelected = (item: SelectableItem): boolean => {
    if (!selectedItem) return false;
    if (item.kind !== selectedItem.kind) return false;
    if (item.kind === 'scene' || item.kind === 'physics') return item.kind === selectedItem.kind;
    return (item as { id: string }).id === (selectedItem as { id: string }).id;
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-700 overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-700">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Scene Tree</h2>
      </div>
      <div className="flex-1 overflow-y-auto py-1 space-y-0.5">
        {/* Scene */}
        <Section title="Scene">
          <TreeItem
            label="Scene Settings"
            icon="🌅"
            isSelected={isSelected({ kind: 'scene' })}
            onSelect={() => setSelectedItem({ kind: 'scene' })}
          />
          <TreeItem
            label="Physics Settings"
            icon="⚙️"
            isSelected={isSelected({ kind: 'physics' })}
            onSelect={() => setSelectedItem({ kind: 'physics' })}
          />
        </Section>

        {/* Models */}
        <Section title={`Models (${world.models.length})`}>
          {world.models.length === 0 && (
            <div className="px-3 py-1 text-xs text-zinc-600 italic">No models</div>
          )}
          {world.models.map((model) => (
            <TreeItem
              key={model.id}
              label={model.name}
              icon={model.isStatic ? '🧱' : '📦'}
              isSelected={isSelected({ kind: 'model', id: model.id })}
              isVisible={model.visible}
              onSelect={() => setSelectedItem({ kind: 'model', id: model.id })}
              onToggleVisibility={() => toggleModelVisibility(model.id)}
              onDelete={() => removeModel(model.id)}
            />
          ))}
        </Section>

        {/* Lights */}
        <Section title={`Lights (${world.lights.length})`}>
          {world.lights.length === 0 && (
            <div className="px-3 py-1 text-xs text-zinc-600 italic">No lights</div>
          )}
          {world.lights.map((light) => (
            <TreeItem
              key={light.id}
              label={light.name}
              icon={light.type === 'directional' ? '☀️' : light.type === 'spot' ? '🔦' : '💡'}
              isSelected={isSelected({ kind: 'light', id: light.id })}
              isVisible={light.visible}
              onSelect={() => setSelectedItem({ kind: 'light', id: light.id })}
              onToggleVisibility={() => toggleLightVisibility(light.id)}
              onDelete={() => removeLight(light.id)}
            />
          ))}
        </Section>

        {/* Includes */}
        <Section title={`Includes (${world.includes.length})`}>
          {world.includes.length === 0 && (
            <div className="px-3 py-1 text-xs text-zinc-600 italic">No includes</div>
          )}
          {world.includes.map((inc) => (
            <TreeItem
              key={inc.id}
              label={inc.name}
              icon="🔗"
              isSelected={isSelected({ kind: 'include', id: inc.id })}
              onSelect={() => setSelectedItem({ kind: 'include', id: inc.id })}
              onDelete={() => removeInclude(inc.id)}
            />
          ))}
        </Section>
      </div>
    </div>
  );
}
