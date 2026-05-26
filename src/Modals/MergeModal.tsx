'use client';

import React from 'react';
import { useWorldStore } from '@/store/worldStore';
import Modal from './Modal';

export default function MergeModal() {
  const { showMergeModal, pendingImport, confirmReplace, confirmMerge, cancelImport } = useWorldStore();

  if (!showMergeModal || !pendingImport) return null;

  return (
    <Modal title="Import World" onClose={cancelImport}>
      <p className="text-zinc-300 text-sm mb-4">
        You already have a scene. How would you like to import{' '}
        <strong className="text-white">{pendingImport.worldName}</strong>?
      </p>
      <p className="text-zinc-400 text-xs mb-6">
        Models: {pendingImport.models.length} &nbsp;|&nbsp;
        Lights: {pendingImport.lights.length} &nbsp;|&nbsp;
        Includes: {pendingImport.includes.length}
      </p>
      <div className="flex gap-3">
        <button
          className="flex-1 px-3 py-2 text-xs bg-red-600 hover:bg-red-500 text-white rounded"
          onClick={confirmReplace}
        >
          🔄 Replace current scene
        </button>
        <button
          className="flex-1 px-3 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded"
          onClick={confirmMerge}
        >
          🔀 Merge into current
        </button>
        <button
          className="px-3 py-2 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded"
          onClick={cancelImport}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
