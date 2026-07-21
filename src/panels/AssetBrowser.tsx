'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import {
  ASSET_DATABASE,
  ASSET_CATEGORIES,
  searchAssets,
} from '@/lib/assetDatabase';
import { AssetCard } from './AssetCard';
import { industrialClasses } from '@/ui/industrialTheme';

interface FuelModel {
  name: string;
  owner: string;
  thumbnail_url?: string;
  description?: string;
}

export function AssetBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [fuelResults, setFuelResults] = useState<FuelModel[]>([]);
  const [fuelLoading, setFuelLoading] = useState(false);
  const [fuelError, setFuelError] = useState<string | null>(null);

  // Filter local primitive/mock assets based on search and category
  const filteredAssets = useMemo(() => {
    let results = searchQuery ? searchAssets(searchQuery) : ASSET_DATABASE;

    if (selectedCategory) {
      results = results.filter((asset) => asset.category === selectedCategory);
    }

    return results;
  }, [searchQuery, selectedCategory]);

  // Query Gazebo Fuel for real models matching the search text
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFuelResults([]);
      setFuelError(null);
      return;
    }

    const controller = new AbortController();
    setFuelLoading(true);
    setFuelError(null);

    const timeout = setTimeout(() => {
      fetch(`/api/fuel/search?q=${encodeURIComponent(searchQuery)}`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error('Fuel search failed');
          return res.json();
        })
        .then((data) => setFuelResults(data.results ?? []))
        .catch((err) => {
          if (err.name !== 'AbortError') setFuelError('Could not reach Gazebo Fuel');
        })
        .finally(() => setFuelLoading(false));
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#050505]">
        {/* Header */}
        <div className={industrialClasses.panelHeader}>
          Asset Library
        </div>

        {/* Search Bar */}
        <div className="p-2 border-b border-[#232323] bg-[#0b0b0b]">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-2.5 text-[#525252]"
            />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs bg-[#0a0a0a] border border-[#2a2a2a] text-[#f2f2f2] placeholder-[#525252] focus:outline-none focus:border-[#eaeaea]"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-2 py-2 border-b border-[#232323] bg-[#0b0b0b] overflow-x-auto">
          <div className="flex gap-1 min-w-min">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-[#eaeaea] text-[#050505]'
                  : 'bg-[#141414] text-[#8a8a8a] hover:bg-[#202020] hover:text-[#f2f2f2]'
              }`}
            >
              All
            </button>

            {ASSET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#eaeaea] text-[#050505]'
                    : 'bg-[#141414] text-[#8a8a8a] hover:bg-[#202020] hover:text-[#f2f2f2]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 auto-rows-max">
              {filteredAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-[#525252] text-xs">
              <div className="text-center">
                <div className="text-2xl mb-2 opacity-40">∅</div>
                <div>No assets found</div>
              </div>
            </div>
          )}

          {searchQuery.trim() && (
            <div className="mt-4 pt-3 border-t border-[#232323]">
              <div className="flex items-center gap-2 mb-2 text-[11px] font-medium uppercase tracking-wider text-[#8a8a8a]">
                <span>Gazebo Fuel</span>
                {fuelLoading && <Loader2 size={12} className="animate-spin" />}
              </div>

              {fuelError && (
                <div className="text-xs text-[#ff5c5c]">{fuelError}</div>
              )}

              {!fuelError && !fuelLoading && fuelResults.length === 0 && (
                <div className="text-xs text-[#525252]">No Fuel models found</div>
              )}

              {fuelResults.length > 0 && (
                <div className="grid grid-cols-2 gap-2 auto-rows-max">
                  {fuelResults.map((model) => (
                    <div
                      key={`${model.owner}/${model.name}`}
                      className="bg-[#0b0b0b] border border-[#232323] p-2 text-xs"
                      title={model.description}
                    >
                      <div className="font-medium text-[#f2f2f2] truncate">{model.name}</div>
                      <div className="text-[#525252] truncate font-mono">{model.owner}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div
          className={`${industrialClasses.panelHeader} border-t border-[#232323] flex justify-between normal-case tracking-normal`}
        >
          <span>{filteredAssets.length} models</span>
          <span>Drag to viewport</span>
        </div>
    </div>
  );
}
