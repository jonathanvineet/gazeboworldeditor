import { NextRequest, NextResponse } from "next/server"

const FUEL_API_URL = "https://fuel.gazebosim.org/1.0"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")
  const page = searchParams.get("page") || "1"

  if (!q) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${FUEL_API_URL}/models?q=${encodeURIComponent(q)}&page=${page}&per_page=12`,
      { headers: { Accept: "application/json" } }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error connecting to Gazebo Fuel" },
        { status: 502 }
      )
    }

    const results = await response.json()

    return NextResponse.json({
      results,
      pageSize: 12,
      page: Number(page),
    })
  } catch {
    return NextResponse.json({ error: "Error connecting to Gazebo Fuel" }, { status: 502 })
  }
}
