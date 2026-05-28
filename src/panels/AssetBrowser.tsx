'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import {
  ASSET_DATABASE,
  ASSET_CATEGORIES,
  searchAssets,
  getAssetsByCategory,
} from '@/lib/assetDatabase';
import { AssetCard } from './AssetCard';
import { industrialClasses } from '@/ui/industrialTheme';

export function AssetBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter assets based on search and category
  const filteredAssets = useMemo(() => {
    let results = searchQuery ? searchAssets(searchQuery) : ASSET_DATABASE;

    if (selectedCategory) {
      results = results.filter((asset) => asset.category === selectedCategory);
    }

    return results;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
        {/* Header */}
        <div className={`${industrialClasses.panelHeader} border-b border-[#3e3e42]`}>
          <span className="text-xs font-semibold uppercase tracking-wide">
            Asset Library
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-2 border-b border-[#3e3e42] bg-[#252526]">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-2.5 text-[#808080]"
            />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full
                pl-7
                pr-3
                py-1.5
                text-xs
                bg-[#1e1e1e]
                border border-[#3e3e42]
                text-[#cccccc]
                placeholder-[#808080]
                focus:outline-none
                focus:border-[#0e639c]
                focus:ring-1
                focus:ring-[#0e639c]
                rounded
              `}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-2 py-2 border-b border-[#3e3e42] bg-[#252526] overflow-x-auto">
          <div className="flex gap-1 min-w-min">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`
                px-2.5
                py-1
                text-xs
                font-medium
                rounded
                whitespace-nowrap
                transition-colors
                ${
                  selectedCategory === null
                    ? 'bg-[#0e639c] text-white'
                    : 'bg-[#3e3e42] text-[#cccccc] hover:bg-[#464647]'
                }
              `}
            >
              All
            </button>

            {ASSET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  px-2.5
                  py-1
                  text-xs
                  font-medium
                  rounded
                  whitespace-nowrap
                  transition-colors
                  flex
                  items-center
                  gap-1.5
                  ${
                    selectedCategory === cat.id
                      ? 'bg-[#0e639c] text-white'
                      : 'bg-[#3e3e42] text-[#cccccc] hover:bg-[#464647]'
                  }
                `}
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
            <div className="flex items-center justify-center h-32 text-[#808080] text-xs">
              <div className="text-center">
                <div className="text-2xl mb-2">📭</div>
                <div>No assets found</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div
          className={`
            ${industrialClasses.panelHeader}
            border-t border-[#3e3e42]
            flex
            justify-between
            text-xs
            text-[#808080]
          `}
        >
          <span>{filteredAssets.length} models</span>
          <span>Drag to viewport</span>
        </div>
    </div>
  );
}
