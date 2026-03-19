'use client';

import React, { useState } from 'react';
import { useWorldStore } from '@/store/worldStore';
import Modal from './Modal';

export default function AddIncludeModal() {
  const showAddIncludeModal = useWorldStore(s => s.showAddIncludeModal);
  const closeAddIncludeModal = useWorldStore(s => s.closeAddIncludeModal);
  const addInclude = useWorldStore(s => s.addInclude);

  const [uri, setUri] = useState('model://');
  const [name, setName] = useState('');

  if (!showAddIncludeModal) return null;

  const handleAdd = () => {
    if (!uri.trim()) return;
    addInclude(uri.trim(), name.trim() || undefined);
    setUri('model://');
    setName('');
    closeAddIncludeModal();
  };

  return (
    <Modal title="Add Include" onClose={closeAddIncludeModal}>
      <div className="space-y-3">
        <div>
          <label className="text-zinc-400 text-xs block mb-1">Model URI</label>
          <input
            type="text"
            value={uri}
            onChange={e => setUri(e.target.value)}
            placeholder="model://my_model"
            className="w-full bg-zinc-700 border border-zinc-600 text-white text-sm rounded px-2 py-1"
            autoFocus
          />
          <p className="text-zinc-500 text-xs mt-1">e.g. model://ground_plane, model://sun</p>
        </div>
        <div>
          <label className="text-zinc-400 text-xs block mb-1">Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Leave empty to auto-detect"
            className="w-full bg-zinc-700 border border-zinc-600 text-white text-sm rounded px-2 py-1"
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded"
            onClick={closeAddIncludeModal}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded"
            onClick={handleAdd}
          >
            Add Include
          </button>
        </div>
      </div>
    </Modal>
  );
}
