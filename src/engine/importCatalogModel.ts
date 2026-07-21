import { v4 as uuidv4 } from "uuid"
import { SDFParser } from "@/sdf/parser"
import { ModelEntity } from "@/types/sdf"
import { registerModelSource } from "@/engine/resourceResolver"
import { useWorldStore } from "@/engine/worldStore"
import type { CatalogEntry } from "@/app/api/models/catalog/route"

/**
 * Fetch a catalog model's real SDF, resolve one level of nested
 * `<include>` (covers composite vehicles like PX4's x500 -> x500_base),
 * register mesh URI resolution for preview, and insert it into the world.
 */
export async function importCatalogModel(entry: CatalogEntry, catalog: CatalogEntry[]) {
  const model = await fetchAndParseModel(entry)

  const currentWorld = useWorldStore.getState().world
  const placed: ModelEntity = {
    ...model,
    id: uuidv4(),
    name: dedupeName(model.name || entry.name, currentWorld.models.map((m) => m.name)),
  }

  useWorldStore.getState().executeCommand({
    id: uuidv4(),
    type: "import-catalog-model",
    timestamp: Date.now(),
    execute: () =>
      useWorldStore.getState().updateWorld({ models: [...useWorldStore.getState().world.models, placed] }),
    undo: () =>
      useWorldStore
        .getState()
        .updateWorld({ models: useWorldStore.getState().world.models.filter((m) => m.id !== placed.id) }),
    redo: () =>
      useWorldStore.getState().updateWorld({ models: [...useWorldStore.getState().world.models, placed] }),
  })

  useWorldStore.getState().selectEntity(placed.id)

  async function fetchAndParseModel(target: CatalogEntry, depth = 0): Promise<ModelEntity> {
    const res = await fetch(target.sdfUrl)
    if (!res.ok) throw new Error(`Could not fetch ${target.name} (${res.status})`)
    const xml = await res.text()

    const { model: parsed, nestedIncludeUris } = SDFParser.parseStandaloneModel(xml)
    registerModelSource(target.slug, target.rawBase)

    if (nestedIncludeUris.length === 0 || depth >= 1) {
      return parsed
    }

    let merged = parsed
    for (const uri of nestedIncludeUris) {
      const slug = uri.replace("model://", "").split("/")[0]
      const nestedEntry = catalog.find((c) => c.source === target.source && c.slug === slug)
      if (!nestedEntry) continue

      const nestedModel = await fetchAndParseModel(nestedEntry, depth + 1)
      merged = SDFParser.mergeModel(merged, nestedModel)
    }
    return merged
  }
}

function dedupeName(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base
  let n = 2
  while (existing.includes(`${base}_${n}`)) n++
  return `${base}_${n}`
}
