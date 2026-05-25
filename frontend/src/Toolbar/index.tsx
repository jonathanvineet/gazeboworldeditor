'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useWorldStore } from '@/store/worldStore';
import { parseSDF } from '@/lib/sdfParser';
import { serializeWorldState } from '@/lib/sdfSerializer';

export default function Toolbar() {
  const world = useWorldStore(s => s.world);
  const addModel = useWorldStore(s => s.addModel);
  const addLight = useWorldStore(s => s.addLight);
  const importWorld = useWorldStore(s => s.importWorld);
  const undo = useWorldStore(s => s.undo);
  const redo = useWorldStore(s => s.redo);
  const past = useWorldStore(s => s.past);
  const future = useWorldStore(s => s.future);
  const transformMode = useWorldStore(s => s.transformMode);
  const setTransformMode = useWorldStore(s => s.setTransformMode);
  const openSettingsModal = useWorldStore(s => s.openSettingsModal);
  const openAddIncludeModal = useWorldStore(s => s.openAddIncludeModal);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = parseSDF(text);
      importWorld(parsed);
    } catch (err) {
      alert(`Failed to parse SDF file: ${err instanceof Error ? err.message : String(err)}`);
    }
    e.target.value = '';
  }, [importWorld]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = parseSDF(evt.target?.result as string);
        importWorld(parsed);
      } catch (err) {
        alert(`Failed to parse SDF file: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    reader.readAsText(file);
  }, [importWorld]);

  const exportFile = useCallback((ext: 'world' | 'sdf') => {
    const xml = serializeWorldState(world);
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${world.worldName}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  }, [world]);

  const copyToClipboard = useCallback(() => {
    const xml = serializeWorldState(world);
    navigator.clipboard.writeText(xml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setExportMenuOpen(false);
  }, [world]);

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border-b border-zinc-700 flex-wrap"
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Add menu */}
      <div className="relative">
        <button
          className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded"
          onClick={() => setAddMenuOpen(o => !o)}
        >
          ➕ Add ▾
        </button>
        {addMenuOpen && (
          <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-600 rounded shadow-lg z-50 min-w-32">
            <div className="px-2 py-1 text-zinc-500 text-xs uppercase">Primitives</div>
            {(['box', 'sphere', 'cylinder', 'plane'] as const).map(t => (
              <button
                key={t}
                className="w-full text-left px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700 capitalize"
                onClick={() => { addModel(t); setAddMenuOpen(false); }}
              >
                {t === 'box' ? '📦' : t === 'sphere' ? '⚽' : t === 'cylinder' ? '🥫' : '⬜'} {t}
              </button>
            ))}
            <div className="border-t border-zinc-700 mt-1 px-2 py-1 text-zinc-500 text-xs uppercase">Lights</div>
            {(['point', 'directional', 'spot'] as const).map(t => (
              <button
                key={t}
                className="w-full text-left px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700 capitalize"
                onClick={() => { addLight(t); setAddMenuOpen(false); }}
              >
                {t === 'directional' ? '☀️' : t === 'spot' ? '🔦' : '💡'} {t}
              </button>
            ))}
            <div className="border-t border-zinc-700 mt-1">
              <button
                className="w-full text-left px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                onClick={() => { openAddIncludeModal(); setAddMenuOpen(false); }}
              >
                🔗 Include (model://)
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-zinc-700 mx-0.5" />

      {/* Import */}
      <button
        className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded"
        onClick={() => fileInputRef.current?.click()}
        title="Import .sdf/.world file"
      >
        📂 Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".sdf,.world,.xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Export menu */}
      <div className="relative">
        <button
          className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded"
          onClick={() => setExportMenuOpen(o => !o)}
        >
          💾 Export ▾
        </button>
        {exportMenuOpen && (
          <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-600 rounded shadow-lg z-50 min-w-36">
            <button
              className="w-full text-left px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
              onClick={() => exportFile('world')}
            >
              📄 Export .world
            </button>
            <button
              className="w-full text-left px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
              onClick={() => exportFile('sdf')}
            >
              📄 Export .sdf
            </button>
            <button
              className="w-full text-left px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
              onClick={copyToClipboard}
            >
              {copied ? '✅ Copied!' : '📋 Copy SDF'}
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-zinc-700 mx-0.5" />

      {/* Transform mode */}
      <div className="flex">
        {(['translate', 'rotate', 'scale'] as const).map(mode => (
          <button
            key={mode}
            title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} (${mode === 'translate' ? 'T' : mode === 'rotate' ? 'R' : 'S'})`}
            className={`px-2 py-1 text-xs border border-zinc-600 first:rounded-l last:rounded-r ${
              transformMode === mode ? 'bg-blue-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
            }`}
            onClick={() => setTransformMode(mode)}
          >
            {mode === 'translate' ? '↕ T' : mode === 'rotate' ? '↻ R' : '⤢ S'}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-zinc-700 mx-0.5" />

      {/* Undo/Redo */}
      <button
        className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={undo}
        disabled={past.length === 0}
        title="Undo (Ctrl+Z)"
      >
        ↩ Undo
      </button>
      <button
        className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={redo}
        disabled={future.length === 0}
        title="Redo (Ctrl+Y)"
      >
        ↪ Redo
      </button>

      <div className="w-px h-5 bg-zinc-700 mx-0.5" />

      {/* Settings */}
      <button
        className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded"
        onClick={openSettingsModal}
        title="World Settings"
      >
        ⚙️ Settings
      </button>

      {/* World name display */}
      <div className="ml-auto text-xs text-zinc-500">
        {world.worldName} <span className="text-zinc-600">(SDF {world.sdfVersion})</span>
      </div>
    </div>
  );
}
