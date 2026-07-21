import { NextResponse } from "next/server"

export interface CatalogEntry {
  id: string
  slug: string
  name: string
  source: "gazebo_models" | "px4"
  sourceLabel: string
  sdfUrl: string
  configUrl: string
  rawBase: string
}

interface GithubContentItem {
  name: string
  type: "dir" | "file"
}

const SOURCES: {
  source: CatalogEntry["source"]
  sourceLabel: string
  listUrl: string
  rawBaseFor: (dirName: string) => string
}[] = [
  {
    source: "gazebo_models",
    sourceLabel: "Gazebo Models",
    listUrl: "https://api.github.com/repos/osrf/gazebo_models/contents/",
    rawBaseFor: (dirName) =>
      `https://raw.githubusercontent.com/osrf/gazebo_models/master/${dirName}`,
  },
  {
    source: "px4",
    sourceLabel: "PX4",
    listUrl: "https://api.github.com/repos/PX4/PX4-gazebo-models/contents/models",
    rawBaseFor: (dirName) =>
      `https://raw.githubusercontent.com/PX4/PX4-gazebo-models/main/models/${dirName}`,
  },
]

function toDisplayName(slug: string): string {
  return slug
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

export async function GET() {
  try {
    const entries = await Promise.all(
      SOURCES.map(async ({ source, sourceLabel, listUrl, rawBaseFor }) => {
        const res = await fetch(listUrl, {
          headers: { Accept: "application/vnd.github+json" },
          next: { revalidate: 86400 },
        })
        if (!res.ok) return []

        const items: GithubContentItem[] = await res.json()
        return items
          .filter((item) => item.type === "dir")
          .map((item): CatalogEntry => {
            const rawBase = rawBaseFor(item.name)
            return {
              id: `${source}/${item.name}`,
              slug: item.name,
              name: toDisplayName(item.name),
              source,
              sourceLabel,
              sdfUrl: `${rawBase}/model.sdf`,
              configUrl: `${rawBase}/model.config`,
              rawBase,
            }
          })
      })
    )

    return NextResponse.json({ entries: entries.flat() })
  } catch {
    return NextResponse.json({ error: "Could not load model catalog" }, { status: 502 })
  }
}
