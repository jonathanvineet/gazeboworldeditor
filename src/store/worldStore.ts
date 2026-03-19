'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  WorldState, SDFModel, SDFLight, SDFInclude, SelectableItem, Pose6D,
  SDFGeometry, SDFLink, SDFVisual
} from '@/types/sdf.types';
import {
  defaultWorldState, defaultModel, defaultLight, defaultBoxGeometry,
  defaultSphereGeometry, defaultCylinderGeometry, defaultPlaneGeometry,
} from '@/lib/sdfDefaults';

const MAX_HISTORY = 50;

interface HistoryEntry {
  world: WorldState;
}

export interface WorldStore {
  // Current world state
  world: WorldState;

  // Selection
  selectedItem: SelectableItem | null;

  // History for undo/redo
  past: HistoryEntry[];
  future: HistoryEntry[];

  // Import modal state
  pendingImport: WorldState | null;
  showMergeModal: boolean;

  // Settings modal
  showSettingsModal: boolean;

  // Add Include modal
  showAddIncludeModal: boolean;

  // Transform mode
  transformMode: 'translate' | 'rotate' | 'scale';

  // Actions
  setWorld: (world: WorldState) => void;
  setSelectedItem: (item: SelectableItem | null) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;

  // World mutations (with history)
  updateWorldName: (name: string) => void;
  updateSdfVersion: (version: '1.6' | '1.7') => void;
  updatePhysics: (physics: Partial<WorldState['physics']>) => void;
  updateScene: (scene: Partial<WorldState['scene']>) => void;

  addModel: (type: 'box' | 'sphere' | 'cylinder' | 'plane', name?: string) => void;
  removeModel: (id: string) => void;
  updateModel: (id: string, changes: Partial<SDFModel>) => void;
  updateModelPose: (id: string, pose: Pose6D) => void;
  toggleModelVisibility: (id: string) => void;

  addLight: (type: SDFLight['type'], name?: string) => void;
  removeLight: (id: string) => void;
  updateLight: (id: string, changes: Partial<SDFLight>) => void;
  toggleLightVisibility: (id: string) => void;

  addInclude: (uri: string, name?: string) => void;
  removeInclude: (id: string) => void;
  updateInclude: (id: string, changes: Partial<SDFInclude>) => void;

  updateLink: (modelId: string, linkId: string, changes: Partial<SDFLink>) => void;
  updateVisual: (modelId: string, linkId: string, visualId: string, changes: Partial<SDFVisual>) => void;
  updateVisualGeometry: (modelId: string, linkId: string, visualId: string, geom: SDFGeometry) => void;

  // Import
  importWorld: (world: WorldState) => void;
  confirmReplace: () => void;
  confirmMerge: () => void;
  cancelImport: () => void;

  // History
  undo: () => void;
  redo: () => void;

  // Modals
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openAddIncludeModal: () => void;
  closeAddIncludeModal: () => void;
}

function snapshot(world: WorldState): HistoryEntry {
  return { world: JSON.parse(JSON.stringify(world)) };
}

function pushHistory(
  past: HistoryEntry[],
  current: WorldState
): HistoryEntry[] {
  const newPast = [...past, snapshot(current)];
  if (newPast.length > MAX_HISTORY) newPast.shift();
  return newPast;
}

const nameCounters: Record<string, number> = {};
function uniqueName(base: string, existing: string[]): string {
  const count = nameCounters[base] ?? 0;
  let candidate = count === 0 ? base : `${base}_${count}`;
  let idx = count;
  while (existing.includes(candidate)) {
    idx++;
    candidate = `${base}_${idx}`;
  }
  nameCounters[base] = idx + 1;
  return candidate;
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  world: defaultWorldState(),
  selectedItem: null,
  past: [],
  future: [],
  pendingImport: null,
  showMergeModal: false,
  showSettingsModal: false,
  showAddIncludeModal: false,
  transformMode: 'translate',

  setWorld: (world) => set({ world }),

  setSelectedItem: (item) => set({ selectedItem: item }),

  setTransformMode: (mode) => set({ transformMode: mode }),

  updateWorldName: (name) => {
    const { world, past } = get();
    set({ world: { ...world, worldName: name }, past: pushHistory(past, world), future: [] });
  },

  updateSdfVersion: (version) => {
    const { world, past } = get();
    set({ world: { ...world, sdfVersion: version }, past: pushHistory(past, world), future: [] });
  },

  updatePhysics: (physics) => {
    const { world, past } = get();
    set({ world: { ...world, physics: { ...world.physics, ...physics } }, past: pushHistory(past, world), future: [] });
  },

  updateScene: (scene) => {
    const { world, past } = get();
    set({ world: { ...world, scene: { ...world.scene, ...scene } }, past: pushHistory(past, world), future: [] });
  },

  addModel: (type, name) => {
    const { world, past } = get();
    const geomMap: Record<string, () => SDFGeometry> = {
      box: defaultBoxGeometry,
      sphere: defaultSphereGeometry,
      cylinder: defaultCylinderGeometry,
      plane: defaultPlaneGeometry,
    };
    const existingNames = world.models.map(m => m.name);
    const baseName = name ?? type;
    const modelName = uniqueName(baseName, existingNames);
    const model = defaultModel(geomMap[type](), modelName);
    const newWorld = { ...world, models: [...world.models, model] };
    set({ world: newWorld, past: pushHistory(past, world), future: [], selectedItem: { kind: 'model', id: model.id } });
  },

  removeModel: (id) => {
    const { world, past, selectedItem } = get();
    const newWorld = { ...world, models: world.models.filter(m => m.id !== id) };
    const newSelected = selectedItem?.kind === 'model' && selectedItem.id === id ? null : selectedItem;
    set({ world: newWorld, past: pushHistory(past, world), future: [], selectedItem: newSelected });
  },

  updateModel: (id, changes) => {
    const { world, past } = get();
    const newWorld = {
      ...world,
      models: world.models.map(m => m.id === id ? { ...m, ...changes } : m),
    };
    set({ world: newWorld, past: pushHistory(past, world), future: [] });
  },

  updateModelPose: (id, pose) => {
    const { world, past } = get();
    const newWorld = {
      ...world,
      models: world.models.map(m => m.id === id ? { ...m, pose } : m),
    };
    set({ world: newWorld, past: pushHistory(past, world), future: [] });
  },

  toggleModelVisibility: (id) => {
    const { world } = get();
    const model = world.models.find(m => m.id === id);
    if (model) get().updateModel(id, { visible: !model.visible });
  },

  addLight: (type, name) => {
    const { world, past } = get();
    const existingNames = world.lights.map(l => l.name);
    const baseName = name ?? `${type}_light`;
    const lightName = uniqueName(baseName, existingNames);
    const light = defaultLight(type, lightName);
    const newWorld = { ...world, lights: [...world.lights, light] };
    set({ world: newWorld, past: pushHistory(past, world), future: [], selectedItem: { kind: 'light', id: light.id } });
  },

  removeLight: (id) => {
    const { world, past, selectedItem } = get();
    const newWorld = { ...world, lights: world.lights.filter(l => l.id !== id) };
    const newSelected = selectedItem?.kind === 'light' && selectedItem.id === id ? null : selectedItem;
    set({ world: newWorld, past: pushHistory(past, world), future: [], selectedItem: newSelected });
  },

  updateLight: (id, changes) => {
    const { world, past } = get();
    const newWorld = {
      ...world,
      lights: world.lights.map(l => l.id === id ? { ...l, ...changes } : l),
    };
    set({ world: newWorld, past: pushHistory(past, world), future: [] });
  },

  toggleLightVisibility: (id) => {
    const { world } = get();
    const light = world.lights.find(l => l.id === id);
    if (light) get().updateLight(id, { visible: !light.visible });
  },

  addInclude: (uri, name) => {
    const { world, past } = get();
    const inferredName = name ?? uri.split('/').pop() ?? 'include';
    const existingNames = world.includes.map(i => i.name);
    const incName = uniqueName(inferredName, existingNames);
    const inc: SDFInclude = {
      id: uuidv4(),
      name: incName,
      uri,
      pose: { x: 0, y: 0, z: 0, roll: 0, pitch: 0, yaw: 0 },
    };
    const newWorld = { ...world, includes: [...world.includes, inc] };
    set({ world: newWorld, past: pushHistory(past, world), future: [], selectedItem: { kind: 'include', id: inc.id } });
  },

  removeInclude: (id) => {
    const { world, past, selectedItem } = get();
    const newWorld = { ...world, includes: world.includes.filter(i => i.id !== id) };
    const newSelected = selectedItem?.kind === 'include' && selectedItem.id === id ? null : selectedItem;
    set({ world: newWorld, past: pushHistory(past, world), future: [], selectedItem: newSelected });
  },

  updateInclude: (id, changes) => {
    const { world, past } = get();
    const newWorld = {
      ...world,
      includes: world.includes.map(i => i.id === id ? { ...i, ...changes } : i),
    };
    set({ world: newWorld, past: pushHistory(past, world), future: [] });
  },

  updateLink: (modelId, linkId, changes) => {
    const { world, past } = get();
    const newWorld = {
      ...world,
      models: world.models.map(m => m.id !== modelId ? m : {
        ...m,
        links: m.links.map(l => l.id === linkId ? { ...l, ...changes } : l),
      }),
    };
    set({ world: newWorld, past: pushHistory(past, world), future: [] });
  },

  updateVisual: (modelId, linkId, visualId, changes) => {
    const { world, past } = get();
    const newWorld = {
      ...world,
      models: world.models.map(m => m.id !== modelId ? m : {
        ...m,
        links: m.links.map(l => l.id !== linkId ? l : {
          ...l,
          visuals: l.visuals.map(v => v.id === visualId ? { ...v, ...changes } : v),
        }),
      }),
    };
    set({ world: newWorld, past: pushHistory(past, world), future: [] });
  },

  updateVisualGeometry: (modelId, linkId, visualId, geom) => {
    get().updateVisual(modelId, linkId, visualId, { geometry: geom });
  },

  importWorld: (newWorld) => {
    const { world } = get();
    const hasContent = world.models.length > 0 || world.lights.length > 1 || world.includes.length > 0;
    if (hasContent) {
      set({ pendingImport: newWorld, showMergeModal: true });
    } else {
      const { past } = get();
      set({ world: newWorld, past: pushHistory(past, world), future: [], pendingImport: null });
    }
  },

  confirmReplace: () => {
    const { pendingImport, world, past } = get();
    if (pendingImport) {
      set({ world: pendingImport, past: pushHistory(past, world), future: [], pendingImport: null, showMergeModal: false });
    }
  },

  confirmMerge: () => {
    const { pendingImport, world, past } = get();
    if (!pendingImport) return;

    const existingModelNames = world.models.map(m => m.name);
    const existingLightNames = world.lights.map(l => l.name);
    const existingIncludeNames = world.includes.map(i => i.name);

    const mergedModels = [...world.models];
    for (const m of pendingImport.models) {
      const newName = uniqueName(m.name, [...existingModelNames, ...mergedModels.map(x => x.name)]);
      mergedModels.push({ ...m, id: uuidv4(), name: newName });
    }

    const mergedLights = [...world.lights];
    for (const l of pendingImport.lights) {
      const newName = uniqueName(l.name, [...existingLightNames, ...mergedLights.map(x => x.name)]);
      mergedLights.push({ ...l, id: uuidv4(), name: newName });
    }

    const mergedIncludes = [...world.includes];
    for (const i of pendingImport.includes) {
      const newName = uniqueName(i.name, [...existingIncludeNames, ...mergedIncludes.map(x => x.name)]);
      mergedIncludes.push({ ...i, id: uuidv4(), name: newName });
    }

    const mergedWorld: WorldState = {
      ...world,
      models: mergedModels,
      lights: mergedLights,
      includes: mergedIncludes,
    };

    set({ world: mergedWorld, past: pushHistory(past, world), future: [], pendingImport: null, showMergeModal: false });
  },

  cancelImport: () => {
    set({ pendingImport: null, showMergeModal: false });
  },

  undo: () => {
    const { past, world, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    const newPast = past.slice(0, -1);
    const newFuture = [snapshot(world), ...future];
    if (newFuture.length > MAX_HISTORY) newFuture.pop();
    set({ world: prev.world, past: newPast, future: newFuture });
  },

  redo: () => {
    const { past, world, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, snapshot(world)];
    if (newPast.length > MAX_HISTORY) newPast.shift();
    set({ world: next.world, past: newPast, future: newFuture });
  },

  openSettingsModal: () => set({ showSettingsModal: true }),
  closeSettingsModal: () => set({ showSettingsModal: false }),
  openAddIncludeModal: () => set({ showAddIncludeModal: true }),
  closeAddIncludeModal: () => set({ showAddIncludeModal: false }),
}));
