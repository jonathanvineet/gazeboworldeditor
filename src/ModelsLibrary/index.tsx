'use client';

import React, { useEffect, useState } from 'react';
import { useWorldStore } from '@/store/worldStore';

export default function ModelsLibrary() {
  const [models, setModels] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const addInclude = useWorldStore(s => s.addInclude);

  useEffect(() => {
    fetch('/models/models.json')
      .then(res => res.json())
      .then(data => {
        setModels(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  }, []);

  const filtered = models.filter(m => m.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-700 overflow-hidden">
      <div className="p-2 border-b border-zinc-700">
        <input
          type="text"
          placeholder="Search models..."
          className="w-full bg-zinc-800 text-white text-xs px-2 py-1.5 rounded border border-zinc-600 focus:outline-none focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-zinc-500 text-xs text-center mt-4">Loading models...</div>
        ) : filtered.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center mt-4">No models found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filtered.map(model => (
              <div key={model} className="bg-zinc-800 border border-zinc-700 rounded p-2 flex flex-col gap-2 hover:border-zinc-500 transition-colors">
                <div className="text-xs text-zinc-300 font-medium truncate" title={model}>
                  {model}
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs py-1 px-2 rounded w-full transition-colors"
                  onClick={() => addInclude(`model://${model}`)}
                >
                  Add to Scene
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
