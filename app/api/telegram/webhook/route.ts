import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle Telegram webhook updates
    if (body.message) {
      const chatId = body.message.chat.id
      const text = body.message.text

      if (text === "/start") {
        // Send welcome message with game link
        const gameUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}`

        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: "🎮 Welcome to GiftsBattle! Click the button below to start playing!",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🎁 Play GiftsBattle",
                    web_app: { url: gameUrl },
                  },
                ],
              ],
            },
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
