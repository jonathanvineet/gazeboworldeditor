/**
 * Render Modes System
 * Toggle between different visualization modes for the scene
 *
 * Modes:
 * - Visual: Show only visual meshes with materials
 * - Collision: Show collision geometry as green wireframes  
 * - Wireframe: Show all geometry as wireframe
 * - Physics: Show physics bodies with bounds
 * - Sensors: Highlight sensor positions and FOV
 * - Lighting: Show light sources and shadows
 */

import { create } from 'zustand'

export type RenderMode =
  | 'visual'
  | 'collision'
  | 'wireframe'
  | 'physics'
  | 'sensors'
  | 'lighting'

export interface RenderModeState {
  mode: RenderMode
  showCollisions: boolean
  showSensors: boolean
  showPhysicsBodies: boolean
  showLighting: boolean
  
  setMode: (mode: RenderMode) => void
  toggleCollisions: () => void
  toggleSensors: () => void
  togglePhysicsBodies: () => void
  toggleLighting: () => void
}

export const useRenderMode = create<RenderModeState>((set) => ({
  mode: 'visual',
  showCollisions: false,
  showSensors: false,
  showPhysicsBodies: false,
  showLighting: true,

  setMode: (mode: RenderMode) => set({ mode }),

  toggleCollisions: () =>
    set((state) => ({ showCollisions: !state.showCollisions })),

  toggleSensors: () =>
    set((state) => ({ showSensors: !state.showSensors })),

  togglePhysicsBodies: () =>
    set((state) => ({ showPhysicsBodies: !state.showPhysicsBodies })),

  toggleLighting: () =>
    set((state) => ({ showLighting: !state.showLighting })),
}))

/**
 * Render mode metadata for UI display
 */
export const RENDER_MODES = [
  {
    id: 'visual',
    label: 'Visual',
    icon: '👁️',
    description: 'Show visual meshes with materials',
  },
  {
    id: 'collision',
    label: 'Collision',
    icon: '🟢',
    description: 'Show collision geometry (green wireframe)',
  },
  {
    id: 'wireframe',
    label: 'Wireframe',
    icon: '🔲',
    description: 'Show all geometry as wireframe',
  },
  {
    id: 'physics',
    label: 'Physics',
    icon: '📦',
    description: 'Show physics bodies and bounds',
  },
  {
    id: 'sensors',
    label: 'Sensors',
    icon: '📡',
    description: 'Highlight sensor positions and FOV',
  },
  {
    id: 'lighting',
    label: 'Lighting',
    icon: '💡',
    description: 'Show light sources and shadows',
  },
] as const
