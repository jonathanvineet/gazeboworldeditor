'use client'

import { create } from 'zustand'
import { World, EditorState, Command } from '@/types/sdf'
import { v4 as uuidv4 } from 'uuid'

// Default empty world
const createDefaultWorld = (): World => ({
  id: uuidv4(),
  name: 'Untitled World',
  sdfVersion: '1.9',
  physics: {
    engine: 'dart',
    gravity: [0, 0, -9.81],
    maxStepSize: 0.001,
    realTimeUpdateRate: 1000,
    defaultPhysics: { type: 'ode' },
  },
  scene: {
    ambient: [0.5, 0.5, 0.5, 1],
    background: [0.2, 0.2, 0.2, 1],
    shadows: true,
    grid: true,
  },
  models: [
    // Ground plane - required for realistic simulation
    {
      id: uuidv4(),
      name: 'ground_plane',
      type: 'model',
      pose: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      locked: false,
      links: [
        {
          id: uuidv4(),
          name: 'link',
          type: 'link',
          pose: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
          },
          scale: { x: 1, y: 1, z: 1 },
          visible: true,
          locked: false,
          visuals: [
            {
              id: uuidv4(),
              name: 'visual',
              type: 'visual',
              pose: {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
              },
              scale: { x: 1, y: 1, z: 1 },
              visible: true,
              locked: false,
              geometry: {
                type: 'plane',
                normal: [0, 0, 1],
                size: [500, 500, 0.1],
              },
              material: {
                albedo: [0.8, 0.8, 0.8, 1],
                roughness: 0.6,
                metalness: 0,
              },
              castShadow: false,
              receiveShadow: true,
            },
          ],
          collisions: [
            {
              id: uuidv4(),
              name: 'collision',
              type: 'collision',
              pose: {
                position: [0, 0, 0],
                rotation: [0, 0, 0],
              },
              scale: { x: 1, y: 1, z: 1 },
              visible: true,
              locked: false,
              geometry: {
                type: 'plane',
                normal: [0, 0, 1],
                size: [500, 500, 0.1],
              },
            },
          ],
          sensors: [],
        },
      ],
      joints: [],
      plugins: [],
      isStatic: true,
    },
  ],
  lights: [
    {
      id: uuidv4(),
      name: 'sun',
      type: 'directional_light',
      pose: {
        position: [0, 0, 10],
        rotation: [0.5, 0.5, 0],
      },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      locked: false,
      diffuse: [1, 1, 1, 1],
      specular: [0.5, 0.5, 0.5, 1],
      direction: [0, 0, -1],
      castShadows: true,
    },
  ],
  includes: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

interface WorldStore extends EditorState {
  // World management
  loadWorld: (world: World) => void
  updateWorld: (updates: Partial<World>) => void
  newWorld: () => void

  // Selection
  selectEntity: (id: string | undefined) => void
  selectMultiple: (ids: string[]) => void
  addToSelection: (id: string) => void
  removeFromSelection: (id: string) => void
  clearSelection: () => void

  // History
  executeCommand: (command: Command) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Mode
  setMode: (mode: 'translate' | 'rotate' | 'scale' | 'none') => void
  setSpace: (space: 'world' | 'local') => void

  // View
  setShowGrid: (show: boolean) => void
  setShowGizmo: (show: boolean) => void
  setWireframe: (wireframe: boolean) => void
}

const MAX_HISTORY = 50

export const useWorldStore = create<WorldStore>((set, get) => ({
  world: createDefaultWorld(),
  selectedEntity: undefined,
  selectedEntities: [],
  history: [],
  historyIndex: -1,
  mode: 'translate',
  space: 'world',
  showGrid: true,
  showGizmo: true,
  wireframe: false,

  // World management
  loadWorld: (world: World) =>
    set({
      world,
      selectedEntity: undefined,
      selectedEntities: [],
      history: [],
      historyIndex: -1,
    }),

  updateWorld: (updates: Partial<World>) =>
    set((state) => ({
      world: {
        ...state.world,
        ...updates,
        updatedAt: Date.now(),
      },
    })),

  newWorld: () =>
    set({
      world: createDefaultWorld(),
      selectedEntity: undefined,
      selectedEntities: [],
      history: [],
      historyIndex: -1,
    }),

  // Selection
  selectEntity: (id: string | undefined) =>
    set({
      selectedEntity: id,
      selectedEntities: id ? [id] : [],
    }),

  selectMultiple: (ids: string[]) =>
    set({
      selectedEntity: ids[0],
      selectedEntities: ids,
    }),

  addToSelection: (id: string) =>
    set((state) => ({
      selectedEntities: [...new Set([...state.selectedEntities, id])],
    })),

  removeFromSelection: (id: string) =>
    set((state) => ({
      selectedEntities: state.selectedEntities.filter((eid) => eid !== id),
    })),

  clearSelection: () =>
    set({
      selectedEntity: undefined,
      selectedEntities: [],
    }),

  // History
  executeCommand: (command: Command) => {
    set((state) => {
      command.execute()

      // Remove any commands after current index
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(command)

      // Limit history to MAX_HISTORY
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift()
      }

      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      }
    })
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex < 0) return state

      const command = state.history[state.historyIndex]
      if (command) {
        command.undo()
      }

      return {
        historyIndex: state.historyIndex - 1,
      }
    })
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state

      const command = state.history[state.historyIndex + 1]
      if (command) {
        command.redo?.()
      }

      return {
        historyIndex: state.historyIndex + 1,
      }
    })
  },

  canUndo: () => {
    const state = get()
    return state.historyIndex >= 0
  },

  canRedo: () => {
    const state = get()
    return state.historyIndex < state.history.length - 1
  },

  // Mode
  setMode: (mode: 'translate' | 'rotate' | 'scale' | 'none') =>
    set({ mode }),

  setSpace: (space: 'world' | 'local') =>
    set({ space }),

  // View
  setShowGrid: (show: boolean) =>
    set({ showGrid: show }),

  setShowGizmo: (show: boolean) =>
    set({ showGizmo: show }),

  setWireframe: (wireframe: boolean) =>
    set({ wireframe }),
}))

