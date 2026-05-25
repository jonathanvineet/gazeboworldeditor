'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useWorldStore } from '@/store/worldStore';
import SceneTree from '@/components/SceneTree';
import PropertiesPanel from '@/components/PropertiesPanel';
import Toolbar from '@/components/Toolbar';
import StatusBar from '@/components/StatusBar';
import MergeModal from '@/components/Modals/MergeModal';
import SettingsModal from '@/components/Modals/SettingsModal';
import AddIncludeModal from '@/components/Modals/AddIncludeModal';
import ModelsLibrary from '@/components/ModelsLibrary';


// Dynamically import Viewport to avoid SSR issues with Three.js
const Viewport = dynamic(() => import('@/components/Viewport'), { ssr: false });

export default function Home() {
  const undo = useWorldStore(s => s.undo);
  const redo = useWorldStore(s => s.redo);
  const [leftTab, setLeftTab] = useState<'scene' | 'library'>('scene');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo, redo]);

  return (
    <div className="flex flex-col h-screen bg-zinc-900 overflow-hidden">
      {/* Toolbar */}
      <Toolbar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Tabs */}
        <div className="w-56 flex-shrink-0 flex flex-col overflow-hidden border-r border-zinc-700 bg-zinc-900">
          <div className="flex bg-zinc-800 border-b border-zinc-700">
            <button
              className={`flex-1 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${leftTab === 'scene' ? 'text-white border-b-2 border-blue-500 bg-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => setLeftTab('scene')}
            >
              Scene
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${leftTab === 'library' ? 'text-white border-b-2 border-blue-500 bg-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => setLeftTab('library')}
            >
              Library
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {leftTab === 'scene' ? <SceneTree /> : <ModelsLibrary />}
          </div>
        </div>

        {/* Center: 3D Viewport */}
        <div className="flex-1 overflow-hidden">
          <Viewport />
        </div>

        {/* Right: Properties Panel */}
        <div className="w-72 flex-shrink-0 overflow-hidden">
          <PropertiesPanel />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Modals */}
      <MergeModal />
      <SettingsModal />
      <AddIncludeModal />
    </div>
  );
}
