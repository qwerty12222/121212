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

// Mock database - replace with real database
const users = new Map<number, UserData>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 })
  }

  let user = users.get(Number(userId))

  if (!user) {
    // Create new user with default values
    user = {
      id: Number(userId),
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
    users.set(Number(userId), user)
  }

  return NextResponse.json(user)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, amount, currency } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const user = users.get(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    switch (action) {
      case "deposit":
        if (currency === "TON") {
          user.tonBalance += amount
          user.starsBalance += amount * 200 // 1 TON = 200 Stars
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
    }

    users.set(userId, user)
    return NextResponse.json(user)
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
