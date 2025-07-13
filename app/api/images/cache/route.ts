import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
  }

  try {
    // Check if the image URL is accessible
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    if (response.ok) {
      return NextResponse.json({ url: imageUrl, status: 'valid' })
    } else {
      // Return a themed fallback image
      const fallbackUrl = `https://picsum.photos/150/150?random=${Buffer.from(imageUrl).toString('base64').slice(0, 8)}`
      return NextResponse.json({ url: fallbackUrl, status: 'fallback' })
    }
  } catch (error) {
    console.error("Image caching error:", error)
    // Return a themed fallback image
    const fallbackUrl = `https://picsum.photos/150/150?random=${Buffer.from(imageUrl).toString('base64').slice(0, 8)}`
    return NextResponse.json({ url: fallbackUrl, status: 'fallback' })
  }
}
