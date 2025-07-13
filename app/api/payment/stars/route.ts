import { type NextRequest, NextResponse } from "next/server"

interface StarsPurchaseRequest {
  userId: number
  amount: number
  title: string
  description: string
}

export async function POST(request: NextRequest) {
  try {
    const body: StarsPurchaseRequest = await request.json()
    const { userId, amount, title, description } = body

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    // Create Telegram Stars invoice
    const invoiceData = {
      chat_id: userId,
      title: title || "Telegram Stars Purchase",
      description: description || `Purchase ${amount} Telegram Stars for GiftsBoss`,
      payload: `stars_${userId}_${amount}_${Date.now()}`,
      currency: "XTR", // Telegram Stars currency code
      prices: [
        {
          label: "Telegram Stars",
          amount: amount, // Amount in stars
        },
      ],
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendInvoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Telegram invoice creation failed:", errorText)
      return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
    }

    const result = await response.json()

    if (result.ok) {
      return NextResponse.json({
        success: true,
        message_id: result.result.message_id,
        invoice_url: result.result.invoice_url,
      })
    } else {
      return NextResponse.json({ error: result.description || "Unknown error" }, { status: 500 })
    }
  } catch (error) {
    console.error("Stars purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}