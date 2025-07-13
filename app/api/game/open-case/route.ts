import { type NextRequest, NextResponse } from "next/server"

interface CaseItem {
  id: string
  name: string
  image: string
  rarity: "common" | "rare" | "epic" | "legendary"
  value: number
  probability: number
}

const rarityWeights = {
  common: 50,
  rare: 30,
  epic: 15,
  legendary: 5,
}

function selectRandomItem(items: CaseItem[]): CaseItem {
  const totalWeight = items.reduce((sum, item) => sum + rarityWeights[item.rarity], 0)
  let random = Math.random() * totalWeight

  for (const item of items) {
    random -= rarityWeights[item.rarity]
    if (random <= 0) {
      return item
    }
  }

  return items[0] // fallback
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, caseId, casePrice, currency } = body

    if (!userId || !caseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Load case items from external API
    let caseItems: CaseItem[] = []
    try {
      const response = await fetch(`https://server.giftsbattle.com/cases/${caseId}/`)
      const data = await response.json()

      caseItems = data.map((item: any) => ({
        id: item.id || Math.random().toString(),
        name: item.name,
        image: item.image || "/placeholder.svg?height=100&width=100",
        rarity: item.rarity || "common",
        value: item.value || 50,
        probability: item.probability || 0.25,
      }))
    } catch (error) {
      // Fallback items if API fails
      caseItems = [
        {
          id: "1",
          name: "Bronze Gift",
          image: "/placeholder.svg?height=100&width=100",
          rarity: "common",
          value: 25,
          probability: 0.5,
        },
        {
          id: "2",
          name: "Silver Gift",
          image: "/placeholder.svg?height=100&width=100",
          rarity: "rare",
          value: 100,
          probability: 0.3,
        },
        {
          id: "3",
          name: "Gold Gift",
          image: "/placeholder.svg?height=100&width=100",
          rarity: "epic",
          value: 250,
          probability: 0.15,
        },
        {
          id: "4",
          name: "Diamond Gift",
          image: "/placeholder.svg?height=100&width=100",
          rarity: "legendary",
          value: 500,
          probability: 0.05,
        },
      ]
    }

    const wonItem = selectRandomItem(caseItems)

    // Update user balance and inventory
    const userUpdateResponse = await fetch(`${request.nextUrl.origin}/api/game/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        action: "spend",
        amount: casePrice,
        currency,
      }),
    })

    if (!userUpdateResponse.ok) {
      return NextResponse.json({ error: "Failed to update user balance" }, { status: 400 })
    }

    // Add item to inventory
    await fetch(`${request.nextUrl.origin}/api/game/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        action: "add_item",
        item: wonItem,
      }),
    })

    return NextResponse.json({
      success: true,
      item: wonItem,
      xpGained: 50,
    })
  } catch (error) {
    console.error("Case opening error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
