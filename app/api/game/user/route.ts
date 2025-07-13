import { type NextRequest, NextResponse } from "next/server"

interface UserData {
  id: number
  firstName: string
  lastName?: string
  username?: string
  tonBalance: number
  starsBalance: number
  level: number
  xp: number
  isVip: boolean
  inventory: any[]
  joinDate: string
}

// Simple in-memory database with persistence simulation
const users = new Map<number, UserData>()

// Load from environment or use defaults
const loadUserData = async (userId: number): Promise<UserData> => {
  if (users.has(userId)) {
    return users.get(userId)!
  }
  
  // Try to load from external API or create new user
  const userData: UserData = {
    id: userId,
    firstName: "User",
    lastName: "",
    username: "",
    tonBalance: 0,
    starsBalance: 100, // Welcome bonus
    level: 1,
    xp: 0,
    isVip: false,
    inventory: [],
    joinDate: new Date().toISOString(),
  }
  
  users.set(userId, userData)
  return userData
}

// Save user data (in production, this would save to database)
const saveUserData = async (userData: UserData): Promise<void> => {
  users.set(userData.id, userData)
  // In production, save to database here
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  try {
    const user = await loadUserData(Number(userId))
    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to load user data:", error)
    return NextResponse.json({ error: "Failed to load user data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, amount, currency } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const user = await loadUserData(userId)

    switch (action) {
      case "deposit":
        if (currency === "TON") {
          user.tonBalance += amount
          user.starsBalance += amount * 50 // 1 TON = 50 Stars
        } else if (currency === "STARS") {
          user.starsBalance += amount
        }
        break

      case "spend":
        if (currency === "TON" && user.tonBalance >= amount) {
          user.tonBalance -= amount
        } else if (currency === "STARS" && user.starsBalance >= amount) {
          user.starsBalance -= amount
        } else {
          return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
        }
        break

      case "add_item":
        user.inventory.push(body.item)
        user.xp += 50
        if (user.xp >= user.level * 500) {
          user.level += 1
          user.xp = 0
        }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await saveUserData(user)
    return NextResponse.json(user)
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
