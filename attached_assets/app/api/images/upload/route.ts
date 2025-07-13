import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")
    const imageUrl = searchParams.get("url")

    if (!filename || !imageUrl) {
      return NextResponse.json({ error: "Missing filename or URL" }, { status: 400 })
    }

    // Fetch the image from the external URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image")
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"

    // Upload to Vercel Blob
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
  }

  try {
    // Check if image is already cached in blob storage
    const filename = `cached-${Buffer.from(imageUrl).toString("base64").slice(0, 32)}.jpg`

    // Try to fetch from our blob storage first
    try {
      const cachedResponse = await fetch(`${process.env.BLOB_READ_WRITE_TOKEN}/${filename}`)
      if (cachedResponse.ok) {
        return NextResponse.json({ url: cachedResponse.url })
      }
    } catch {
      // Image not cached, continue to cache it
    }

    // Cache the image
    const uploadResponse = await fetch(
      `${request.nextUrl.origin}/api/images/upload?filename=${filename}&url=${encodeURIComponent(imageUrl)}`,
      {
        method: "POST",
      },
    )

    if (uploadResponse.ok) {
      const result = await uploadResponse.json()
      return NextResponse.json({ url: result.url })
    }

    // Fallback to original URL if caching fails
    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Image caching error:", error)
    return NextResponse.json({ url: imageUrl })
  }
}
