/**
 * Editor Keyboard Shortcuts Hook
 * 
 * Wires keyboard shortcuts to editor engine commands:
 * - Ctrl+Z (or Cmd+Z on Mac) → Undo
 * - Ctrl+Y (or Cmd+Y on Mac) → Redo
 * 
 * ARCHITECTURE: 
 * This hook doesn't mutate state directly.
 * It calls EditorEngine methods, which emit events,
 * which update all observers.
 */

import { useEffect } from 'react'
import { getEditorEngine } from '@/engine/editorEngine'

export const useEditorShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detect Ctrl (Windows/Linux) or Cmd (Mac)
      const isMeta = event.ctrlKey || event.metaKey

      // Undo: Ctrl+Z / Cmd+Z
      if (isMeta && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        try {
          getEditorEngine().undo()
          console.log('[Shortcuts] Undo executed')
        } catch (error) {
          console.error('[Shortcuts] Undo failed:', error)
        }
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y / Cmd+Shift+Z or Cmd+Y
      if (
        isMeta &&
        ((event.key === 'z' && event.shiftKey) || event.key === 'y') &&
        !event.altKey
      ) {
        event.preventDefault()
        try {
          getEditorEngine().redo()
          console.log('[Shortcuts] Redo executed')
        } catch (error) {
          console.error('[Shortcuts] Redo failed:', error)
        }
      }

      // Delete: Delete key to remove selected entity
      if (
        event.key === 'Delete' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey
      ) {
        try {
          const engine = getEditorEngine()
          const selectedId = engine.getSelectedEntity()
          if (selectedId) {
            event.preventDefault()
            engine.deleteEntity(selectedId)
            console.log('[Shortcuts] Delete executed for:', selectedId)
          }
        } catch (error) {
          console.error('[Shortcuts] Delete failed:', error)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
