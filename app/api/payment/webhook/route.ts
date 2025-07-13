import { type NextRequest, NextResponse } from "next/server"

interface TelegramPreCheckoutQuery {
  id: string
  from: {
    id: number
    is_bot: boolean
    first_name: string
    last_name?: string
    username?: string
  }
  currency: string
  total_amount: number
  invoice_payload: string
}

interface TelegramSuccessfulPayment {
  currency: string
  total_amount: number
  invoice_payload: string
  telegram_payment_charge_id: string
  provider_payment_charge_id: string
}

interface TelegramPaymentUpdate {
  update_id: number
  pre_checkout_query?: TelegramPreCheckoutQuery
  message?: {
    message_id: number
    from: {
      id: number
      first_name: string
      username?: string
    }
    chat: {
      id: number
    }
    date: number
    successful_payment?: TelegramSuccessfulPayment
  }
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

async function answerPreCheckoutQuery(preCheckoutQueryId: string, ok: boolean, errorMessage?: string) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pre_checkout_query_id: preCheckoutQueryId,
      ok,
      error_message: errorMessage,
    }),
  })

  return response.json()
}

async function updateUserBalance(userId: number, starsAmount: number) {
  // Update user's stars balance in your database
  // This is a placeholder - replace with actual database update
  console.log(`Updating user ${userId} balance with ${starsAmount} stars`)
  
  // For now, we'll just log the transaction
  // In a real app, you would update the database here
  return true
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramPaymentUpdate = await request.json()

    // Handle pre-checkout query
    if (update.pre_checkout_query) {
      const preCheckoutQuery = update.pre_checkout_query
      const { id, from, currency, total_amount, invoice_payload } = preCheckoutQuery

      // Parse the payload to extract purchase info
      const payloadParts = invoice_payload.split("_")
      if (payloadParts.length >= 4 && payloadParts[0] === "stars") {
        const userId = parseInt(payloadParts[1])
        const amount = parseInt(payloadParts[2])

        // Validate the payment
        if (currency === "XTR" && total_amount === amount && userId === from.id) {
          await answerPreCheckoutQuery(id, true)
        } else {
          await answerPreCheckoutQuery(id, false, "Invalid payment details")
        }
      } else {
        await answerPreCheckoutQuery(id, false, "Invalid payment payload")
      }

      return NextResponse.json({ ok: true })
    }

    // Handle successful payment
    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment
      const userId = update.message.from.id
      const { currency, total_amount, invoice_payload, telegram_payment_charge_id } = payment

      // Parse the payload to extract purchase info
      const payloadParts = invoice_payload.split("_")
      if (payloadParts.length >= 4 && payloadParts[0] === "stars") {
        const expectedAmount = parseInt(payloadParts[2])

        if (currency === "XTR" && total_amount === expectedAmount) {
          // Update user's balance
          await updateUserBalance(userId, total_amount)

          // Send confirmation message
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: userId,
              text: `🎉 Payment successful! +${total_amount} ⭐ Stars have been added to your balance.\n\nTransaction ID: ${telegram_payment_charge_id}`,
              parse_mode: "HTML",
            }),
          })

          console.log(`Successfully processed payment for user ${userId}: ${total_amount} stars`)
        } else {
          console.error("Payment amount mismatch:", { currency, total_amount, expectedAmount })
        }
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Payment webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "Payment webhook is running", 
    timestamp: new Date().toISOString() 
  })
}