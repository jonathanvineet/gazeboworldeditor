/**
 * Immutable helpers for locating and patching top-level world entities
 * (models / lights / includes) by id.
 */

import { World, ModelEntity, LightEntity, IncludeEntity, Pose } from "@/types/sdf"

export type SelectableEntity = ModelEntity | LightEntity | IncludeEntity

export function findEntity(world: World, id: string): SelectableEntity | undefined {
  return (
    world.models.find((m) => m.id === id) ||
    world.lights.find((l) => l.id === id) ||
    world.includes.find((i) => i.id === id)
  )
}

export function withEntityPose(world: World, id: string, pose: Pose): Partial<World> {
  if (world.models.some((m) => m.id === id)) {
    return {
      models: world.models.map((m) => (m.id === id ? { ...m, pose } : m)),
    }
  }
  if (world.lights.some((l) => l.id === id)) {
    return {
      lights: world.lights.map((l) => (l.id === id ? { ...l, pose } : l)) as LightEntity[],
    }
  }
  if (world.includes.some((i) => i.id === id)) {
    return {
      includes: world.includes.map((i) => (i.id === id ? { ...i, pose } : i)),
    }
  }
  return {}
}

export function withModelPatch(
  world: World,
  id: string,
  patch: Partial<ModelEntity>
): Partial<World> {
  return {
    models: world.models.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  }
}

export function withLightPatch(
  world: World,
  id: string,
  patch: Partial<LightEntity>
): Partial<World> {
  return {
    lights: world.lights.map((l) =>
      l.id === id ? ({ ...l, ...patch } as LightEntity) : l
    ),
  }
}

export function deleteEntity(world: World, id: string): Partial<World> {
  return {
    models: world.models.filter((m) => m.id !== id),
    lights: world.lights.filter((l) => l.id !== id),
    includes: world.includes.filter((i) => i.id !== id),
  }
}
