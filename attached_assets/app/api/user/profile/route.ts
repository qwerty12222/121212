import { type NextRequest, NextResponse } from "next/server"

interface UserProfile {
  id: number
  first_name: string
  last_name?: string
  username?: string
  coins: number
  level: number
  xp: number
  inventory: any[]
}

// Mock database - in production, use a real database
const users = new Map<number, UserProfile>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  const user = users.get(Number.parseInt(userId))
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, first_name, last_name, username } = body

    if (!id || !first_name) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 })
    }

    // Create or update user profile
    const existingUser = users.get(id)
    const userProfile: UserProfile = {
      id,
      first_name,
      last_name,
      username,
      coins: existingUser?.coins || 1000,
      level: existingUser?.level || 1,
      xp: existingUser?.xp || 0,
      inventory: existingUser?.inventory || [],
    }

    users.set(id, userProfile)

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
