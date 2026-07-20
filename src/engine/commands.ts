/**
 * Command factories for undoable world mutations.
 * Commands read/write through useWorldStore.getState() so they stay
 * valid even if invoked far from React (e.g. a transform gizmo callback).
 */

import { v4 as uuidv4 } from "uuid"
import { Command, World } from "@/types/sdf"
import { useWorldStore } from "@/engine/worldStore"

function applyPatch(patch: Partial<World>) {
  useWorldStore.getState().updateWorld(patch)
}

export function createPatchCommand(
  type: string,
  before: Partial<World>,
  after: Partial<World>
): Command {
  return {
    id: uuidv4(),
    type,
    timestamp: Date.now(),
    execute: () => applyPatch(after),
    undo: () => applyPatch(before),
    redo: () => applyPatch(after),
  }
}
