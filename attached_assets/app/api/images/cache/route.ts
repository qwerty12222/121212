import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
  }

  try {
    // For now, return the original URL
    // In the future, we can implement proper caching logic here
    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Image caching error:", error)
    return NextResponse.json({ url: imageUrl })
  }
}
