'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Loader2, Download, ExternalLink } from 'lucide-react';
import { industrialClasses } from '@/ui/industrialTheme';
import { importCatalogModel } from '@/engine/importCatalogModel';
import type { CatalogEntry } from '@/app/api/models/catalog/route';

const SOURCE_FILTERS: { id: CatalogEntry['source'] | null; label: string }[] = [
  { id: null, label: 'All' },
  { id: 'gazebo_models', label: 'Gazebo Models' },
  { id: 'px4', label: 'PX4' },
];

export function AssetBrowser() {
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [catalogState, setCatalogState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<CatalogEntry['source'] | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/models/catalog')
      .then((res) => {
        if (!res.ok) throw new Error('catalog fetch failed');
        return res.json();
      })
      .then((data) => {
        setCatalog(data.entries ?? []);
        setCatalogState('ready');
      })
      .catch(() => setCatalogState('error'));
  }, []);

  const filtered = useMemo(() => {
    let results = catalog;
    if (selectedSource) {
      results = results.filter((entry) => entry.source === selectedSource);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      results = results.filter((entry) => entry.name.toLowerCase().includes(q));
    }
    return results.slice(0, 120);
  }, [catalog, selectedSource, searchQuery]);

  const handleImport = async (entry: CatalogEntry) => {
    setImportingId(entry.id);
    setImportError(null);
    try {
      await importCatalogModel(entry, catalog);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : `Could not import ${entry.name}`);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      {/* Header */}
      <div className={industrialClasses.panelHeader}>Model Library</div>

      {/* Search Bar */}
      <div className="p-2 border-b border-[#232323] bg-[#0b0b0b]">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-[#525252]" />
          <input
            type="text"
            placeholder="Search real Gazebo / PX4 models…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#0a0a0a] border border-[#2a2a2a] text-[#f2f2f2] placeholder-[#525252] focus:outline-none focus:border-[#eaeaea]"
          />
        </div>
      </div>

      {/* Source Tabs */}
      <div className="px-2 py-2 border-b border-[#232323] bg-[#0b0b0b] overflow-x-auto">
        <div className="flex gap-1 min-w-min">
          {SOURCE_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setSelectedSource(f.id)}
              className={`px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedSource === f.id
                  ? 'bg-[#eaeaea] text-[#050505]'
                  : 'bg-[#141414] text-[#8a8a8a] hover:bg-[#202020] hover:text-[#f2f2f2]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {catalogState === 'loading' && (
          <div className="flex items-center justify-center h-32 text-[#525252] text-xs gap-2">
            <Loader2 size={14} className="animate-spin" />
            Loading catalog from GitHub…
          </div>
        )}

        {catalogState === 'error' && (
          <div className="flex items-center justify-center h-32 text-[#ff5c5c] text-xs text-center px-4">
            Could not load the model catalog. Check your connection and reload.
          </div>
        )}

        {catalogState === 'ready' && (
          <>
            <div className="text-[11px] text-[#525252] mb-2 font-mono">
              {filtered.length} of {catalog.length} models
            </div>
            <div className="grid grid-cols-2 gap-2 auto-rows-max">
              {filtered.map((entry) => (
                <div
                  key={entry.id}
                  className="group relative bg-[#0b0b0b] border border-[#232323] hover:border-[#eaeaea] transition-colors p-3"
                >
                  <div className="text-xs font-semibold text-[#f2f2f2] truncate">{entry.name}</div>
                  <div className="text-[11px] font-mono text-[#525252] mt-0.5">{entry.sourceLabel}</div>

                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => handleImport(entry)}
                      disabled={importingId === entry.id}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] bg-[#141414] border border-[#2a2a2a] hover:bg-[#eaeaea] hover:text-[#050505] hover:border-[#eaeaea] transition-colors disabled:opacity-50"
                      title={`Import ${entry.name} into the scene`}
                    >
                      {importingId === entry.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Download size={11} />
                      )}
                      Import
                    </button>
                    <a
                      href={entry.sdfUrl.replace('raw.githubusercontent.com', 'github.com').replace(/\/(master|main)\//, '/blob/$1/')}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-[#525252] hover:text-[#f2f2f2] transition-colors"
                      title="View source on GitHub"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="flex items-center justify-center h-32 text-[#525252] text-xs">
                No models match &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </>
        )}

        {importError && (
          <div className="mt-3 text-xs text-[#ff5c5c] border-t border-[#232323] pt-2">{importError}</div>
        )}
      </div>

      {/* Footer */}
      <div className={`${industrialClasses.panelHeader} border-t border-[#232323] flex justify-between normal-case tracking-normal`}>
        <span>osrf/gazebo_models + PX4/PX4-gazebo-models</span>
      </div>
    </div>
  );
}
