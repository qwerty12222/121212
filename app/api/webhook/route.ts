import { type NextRequest, NextResponse } from "next/server"

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    date: number
    text?: string
  }
  callback_query?: {
    id: string
    from: {
      id: number
      first_name: string
      username?: string
    }
    data: string
    message?: {
      chat: {
        id: number
      }
    }
  }
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || "https://giftboss.vercel.app"

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup,
      parse_mode: "HTML",
    }),
  })

  return response.json()
}

async function sendPhoto(chatId: number, photo: string, caption: string, replyMarkup?: any) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      photo,
      caption,
      reply_markup: replyMarkup,
      parse_mode: "HTML",
    }),
  })

  return response.json()
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    }),
  })

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()

    // Handle callback queries (button presses)
    if (update.callback_query) {
      const { callback_query } = update
      const chatId = callback_query.message?.chat.id
      const userId = callback_query.from.id
      const data = callback_query.data
      const firstName = callback_query.from.first_name
      const username = callback_query.from.username

      await answerCallbackQuery(callback_query.id)

      if (!chatId) return NextResponse.json({ ok: true })

      switch (data) {
        case "profile":
          await sendMessage(
            chatId,
            `👤 <b>Your Profile</b>\n\n` +
              `🆔 ID: ${userId}\n` +
              `👤 Name: ${firstName}\n` +
              `📱 Username: @${username || "not_set"}\n` +
              `⭐ Stars: 10 (Welcome Bonus!)\n` +
              `💎 TON: 0.0\n` +
              `🏆 Level: 1\n` +
              `👑 Status: New Player\n` +
              `📅 Joined: Today\n\n` +
              `🎁 Cases Opened: 0\n` +
              `🏅 Items Won: 0\n` +
              `💰 Total Spent: 0 TON`,
            {
              inline_keyboard: [
                [
                  {
                    text: "🎮 Open Game",
                    web_app: { url: WEBAPP_URL },
                  },
                ],
              ],
            },
          )
          break

        case "balance":
          await sendMessage(
            chatId,
            `💰 <b>Your Balance</b>\n\n` +
              `⭐ Stars: 10 (Welcome Bonus!)\n` +
              `💎 TON: 0.0\n\n` +
              `<b>Welcome to Gifts Boss!</b>\n` +
              `• You received 10 ⭐ as welcome bonus\n` +
              `• Open cases to win amazing prizes\n` +
              `• Invite friends for more bonuses\n\n` +
              `💡 <i>1 TON = 50 Stars</i>`,
            {
              inline_keyboard: [
                [
                  {
                    text: "💰 Deposit TON",
                    web_app: { url: `${WEBAPP_URL}?action=deposit` },
                  },
                  {
                    text: "⭐ Buy Stars",
                    web_app: { url: `${WEBAPP_URL}?action=stars` },
                  },
                ],
              ],
            },
          )
          break

        case "referral":
          const referralLink = `https://t.me/GiftsBossBot?start=ref_${userId}`
          await sendMessage(
            chatId,
            `🎯 <b>Your Referral Link</b>\n\n` +
              `Share this link with friends:\n` +
              `<code>${referralLink}</code>\n\n` +
              `<b>Referral Rewards:</b>\n` +
              `• You get: +20 ⭐ for each friend\n` +
              `• Friend gets: +10 ⭐ welcome bonus\n` +
              `• Both get: Special referral case access\n\n` +
              `👥 Friends invited: 0\n` +
              `🎁 Bonus earned: 0 ⭐`,
            {
              inline_keyboard: [
                [
                  {
                    text: "📤 Share Link",
                    url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("🎮 Join me in Gifts Boss! Open amazing cases and win real prizes! 🎁")}`,
                  },
                ],
              ],
            },
          )
          break
      }

      return NextResponse.json({ ok: true })
    }

    // Handle regular messages
    if (!update.message) {
      return NextResponse.json({ ok: true })
    }

    const { message } = update
    const chatId = message.chat.id
    const userId = message.from.id
    const text = message.text || ""
    const firstName = message.from.first_name
    const username = message.from.username

    // Handle different commands
    switch (text) {
      case "/start":
        await sendPhoto(
          chatId,
          `${WEBAPP_URL}/gifts-boss-logo.jpg`,
          `🎮 <b>Welcome to Gifts Boss, ${firstName}!</b>\n\n` +
            `🎁 Open amazing gift cases and win real rewards!\n` +
            `💎 Collect rare items and build your collection\n` +
            `⭐ Start with 10 Stars welcome bonus!\n` +
            `🏆 Battle with friends and become the ultimate Gifts Boss!\n\n` +
            `Click the button below to start playing!`,
          {
            inline_keyboard: [
              [
                {
                  text: "🎮 Play Gifts Boss",
                  web_app: { url: WEBAPP_URL },
                },
              ],
              [
                {
                  text: "📊 My Profile",
                  callback_data: "profile",
                },
                {
                  text: "💰 Balance",
                  callback_data: "balance",
                },
              ],
              [
                {
                  text: "🎯 Referral Link",
                  callback_data: "referral",
                },
              ],
            ],
          },
        )
        break

      case "/help":
        await sendMessage(
          chatId,
          `🆘 <b>Gifts Boss Help</b>\n\n` +
            `<b>Commands:</b>\n` +
            `/start - Start the game\n` +
            `/profile - View your profile\n` +
            `/balance - Check your balance\n` +
            `/help - Show this help message\n\n` +
            `<b>How to Play:</b>\n` +
            `1. 🎮 Open the game using the button\n` +
            `2. 💰 You start with 10 ⭐ welcome bonus\n` +
            `3. 🎁 Open cases to win items\n` +
            `4. 🏆 Collect rare items and climb leaderboard\n` +
            `5. 👥 Invite friends for bonuses!\n\n` +
            `<b>Exchange Rate:</b> 1 TON = 50 ⭐`,
        )
        break

      case "/profile":
        await sendMessage(
          chatId,
          `👤 <b>Your Profile</b>\n\n` +
            `🆔 ID: ${userId}\n` +
            `👤 Name: ${firstName}\n` +
            `📱 Username: @${username || "not_set"}\n` +
            `⭐ Stars: 10 (Welcome Bonus!)\n` +
            `💎 TON: 0.0\n` +
            `🏆 Level: 1\n` +
            `👑 Status: New Player\n` +
            `📅 Joined: Today\n\n` +
            `🎁 Cases Opened: 0\n` +
            `🏅 Items Won: 0\n` +
            `💰 Total Spent: 0 TON`,
          {
            inline_keyboard: [
              [
                {
                  text: "🎮 Open Game",
                  web_app: { url: WEBAPP_URL },
                },
              ],
            ],
          },
        )
        break

      case "/balance":
        await sendMessage(
          chatId,
          `💰 <b>Your Balance</b>\n\n` +
            `⭐ Stars: 10 (Welcome Bonus!)\n` +
            `💎 TON: 0.0\n\n` +
            `<b>Welcome to Gifts Boss!</b>\n` +
            `• You received 10 ⭐ as welcome bonus\n` +
            `• Open cases to win amazing prizes\n` +
            `• Invite friends for more bonuses\n\n` +
            `💡 <i>1 TON = 50 Stars</i>`,
          {
            inline_keyboard: [
              [
                {
                  text: "💰 Deposit TON",
                  web_app: { url: `${WEBAPP_URL}?action=deposit` },
                },
                {
                  text: "⭐ Buy Stars",
                  web_app: { url: `${WEBAPP_URL}?action=stars` },
                },
              ],
            ],
          },
        )
        break

      default:
        if (text.startsWith("/")) {
          await sendMessage(chatId, `❓ Unknown command. Use /help to see available commands.`, {
            inline_keyboard: [
              [
                {
                  text: "🎮 Play Game",
                  web_app: { url: WEBAPP_URL },
                },
              ],
            ],
          })
        }
        break
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook is running", timestamp: new Date().toISOString() })
}
