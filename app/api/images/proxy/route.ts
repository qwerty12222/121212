import { type NextRequest, NextResponse } from "next/server"
import { getBestFallbackImage, isTelegramSticker, getImageTheme } from "@/utils/image-utils"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")
  const itemName = searchParams.get("name") || "Unknown Item"
  const itemId = searchParams.get("id") || ""
  const rarity = searchParams.get("rarity") || "common"

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
  }

  // Check if it's a .tgs file (Telegram sticker)
  if (isTelegramSticker(imageUrl)) {
    const fallbackUrl = getBestFallbackImage(itemName, itemId, rarity)
    return NextResponse.redirect(fallbackUrl)
  }

  try {
    // Try to fetch the original image with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GiftsBoss-Game/1.0',
        'Accept': 'image/*',
      },
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const contentType = response.headers.get('content-type') || 'image/jpeg'
      const imageBuffer = await response.arrayBuffer()
      
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          'X-Image-Source': 'original',
        },
      })
    }
  } catch (error) {
    console.error('Image proxy error:', error)
  }

  // If original image fails, return a themed fallback
  const fallbackUrl = getBestFallbackImage(itemName, itemId, rarity)
  return NextResponse.redirect(fallbackUrl)
}