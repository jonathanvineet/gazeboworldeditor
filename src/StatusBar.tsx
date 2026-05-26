'use client';

import React from 'react';
import { useWorldStore } from '@/store/worldStore';

export default function StatusBar() {
  const world = useWorldStore(s => s.world);
  const selectedItem = useWorldStore(s => s.selectedItem);
  const past = useWorldStore(s => s.past);

  let selectionInfo = 'Nothing selected';
  let poseInfo = '';

  if (selectedItem) {
    if (selectedItem.kind === 'model') {
      const m = world.models.find(m => m.id === selectedItem.id);
      if (m) {
        selectionInfo = `Model: ${m.name}`;
        poseInfo = `x:${m.pose.x.toFixed(2)} y:${m.pose.y.toFixed(2)} z:${m.pose.z.toFixed(2)} | roll:${m.pose.roll.toFixed(2)} pitch:${m.pose.pitch.toFixed(2)} yaw:${m.pose.yaw.toFixed(2)}`;
      }
    } else if (selectedItem.kind === 'light') {
      const l = world.lights.find(l => l.id === selectedItem.id);
      if (l) {
        selectionInfo = `Light: ${l.name} (${l.type})`;
        poseInfo = `x:${l.pose.x.toFixed(2)} y:${l.pose.y.toFixed(2)} z:${l.pose.z.toFixed(2)}`;
      }
    } else if (selectedItem.kind === 'include') {
      const i = world.includes.find(i => i.id === selectedItem.id);
      if (i) {
        selectionInfo = `Include: ${i.name}`;
        poseInfo = i.uri;
      }
    } else if (selectedItem.kind === 'scene') {
      selectionInfo = 'Scene Settings';
    } else if (selectedItem.kind === 'physics') {
      selectionInfo = 'Physics Settings';
    }
  }

  return (
    <div className="flex items-center gap-4 px-3 py-1 bg-zinc-950 border-t border-zinc-700 text-xs text-zinc-400">
      <span className="text-zinc-300">{selectionInfo}</span>
      {poseInfo && <span className="text-zinc-500">|</span>}
      {poseInfo && <span className="text-blue-400 font-mono">{poseInfo}</span>}
      <span className="ml-auto text-zinc-600">
        History: {past.length} |{' '}
        {world.models.length} model{world.models.length !== 1 ? 's' : ''},{' '}
        {world.lights.length} light{world.lights.length !== 1 ? 's' : ''},{' '}
        {world.includes.length} include{world.includes.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
