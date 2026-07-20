/**
 * Keyboard Shortcuts Handler
 * Implements Gazebo-like keybindings for professional workflow
 *
 * | Key    | Action        |
 * | ------ | ------------- |
 * | W      | Translate     |
 * | E      | Rotate        |
 * | R      | Scale         |
 * | F      | Focus         |
 * | Delete | Delete entity |
 * | Ctrl+D | Duplicate     |
 * | Ctrl+Z | Undo          |
 * | Ctrl+Y | Redo          |
 */

import { useEffect } from 'react';
import { useWorldStore } from '@/engine/worldStore';

export function useKeyboardShortcuts() {
  const store = useWorldStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // W - Translate mode
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        store.setMode('translate');
      }

      // E - Rotate mode
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        store.setMode('rotate');
      }

      // R - Scale mode
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        store.setMode('scale');
      }

      // F - Focus on selected (camera focus)
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (store.selectedEntity) {
          console.log('Focusing on entity:', store.selectedEntity);
          // TODO: Implement camera focus animation
          window.dispatchEvent(
            new CustomEvent('camera-focus', {
              detail: { entityId: store.selectedEntity },
            })
          );
        }
      }

      // Delete - Delete selected entity
      if (e.key === 'Delete') {
        e.preventDefault();
        if (store.selectedEntity) {
          store.deleteEntityById(store.selectedEntity);
        }
      }

      // Ctrl+D - Duplicate selected
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (store.selectedEntity) {
          console.log('Duplicating entity:', store.selectedEntity);
          // TODO: Implement duplicate with new unique ID
          window.dispatchEvent(
            new CustomEvent('entity-duplicate', {
              detail: { entityId: store.selectedEntity },
            })
          );
        }
      }

      // Ctrl+Z - Undo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (e.shiftKey) {
          // Ctrl+Shift+Z - Redo
          e.preventDefault();
          store.redo();
        } else {
          // Ctrl+Z - Undo
          e.preventDefault();
          store.undo();
        }
      }

      // Ctrl+Y - Redo (alternative)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        store.redo();
      }

      // Space - Toggle transform mode cycle
      if (e.key === ' ') {
        e.preventDefault();
        const modes = ['translate', 'rotate', 'scale'];
        const currentIndex = modes.indexOf(store.mode);
        const nextIndex = (currentIndex + 1) % modes.length;
        store.setMode(modes[nextIndex] as any);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);
}

/**
 * Display keyboard shortcuts hint in footer
 */
export const KEYBOARD_SHORTCUTS = [
  { key: 'W', action: 'Translate' },
  { key: 'E', action: 'Rotate' },
  { key: 'R', action: 'Scale' },
  { key: 'F', action: 'Focus' },
  { key: 'Delete', action: 'Delete' },
  { key: 'Ctrl+D', action: 'Duplicate' },
  { key: 'Ctrl+Z', action: 'Undo' },
  { key: 'Ctrl+Y', action: 'Redo' },
] as const;
