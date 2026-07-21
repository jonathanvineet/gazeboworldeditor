/**
 * Resolves `model://<name>/...` mesh URIs to a real fetchable URL for
 * in-browser preview, without touching the canonical SDF data (which keeps
 * writing `model://<name>` on export — the correct, portable form for a
 * real Gazebo install with GAZEBO_MODEL_PATH pointed at the source repo).
 */

const registry = new Map<string, string>()

export function registerModelSource(modelName: string, rawBaseUrl: string) {
  registry.set(`model://${modelName}`, rawBaseUrl.replace(/\/$/, ""))
}

export function resolveMeshUri(uri: string): string {
  if (!uri.startsWith("model://")) return uri

  for (const [prefix, base] of registry) {
    if (uri === prefix || uri.startsWith(`${prefix}/`)) {
      const rest = uri.slice(prefix.length)
      return `${base}${rest}`
    }
  }
  return uri
}
