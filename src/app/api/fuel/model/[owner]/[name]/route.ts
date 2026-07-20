import { NextRequest, NextResponse } from "next/server"

const FUEL_API_URL = "https://fuel.gazebosim.org/1.0"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  const { owner, name } = await params

  try {
    const response = await fetch(`${FUEL_API_URL}/models/${owner}/${name}`, {
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error fetching model metadata" },
        { status: 502 }
      )
    }

    return NextResponse.json(await response.json())
  } catch {
    return NextResponse.json({ error: "Error fetching model metadata" }, { status: 502 })
  }
}
