import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, description } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Telegram Stars invoice
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    const invoice = {
      title: 'GiftsBoss Stars Purchase',
      description: description || `Purchase ${amount} Stars`,
      payload: JSON.stringify({
        userId,
        amount,
        type: 'stars_purchase',
        timestamp: Date.now()
      }),
      currency: 'XTR', // Telegram Stars currency
      prices: [
        {
          label: 'Stars',
          amount: amount // Amount in stars
        }
      ]
    };

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/createInvoiceLink`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      console.error('Telegram API Error:', telegramData);
      return NextResponse.json(
        { error: 'Failed to create payment link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payment_url: telegramData.result,
      invoice_payload: invoice.payload
    });

  } catch (error) {
    console.error('Stars payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle successful payment webhook
export async function PUT(request: NextRequest) {
  try {
    const { pre_checkout_query, successful_payment } = await request.json();

    if (pre_checkout_query) {
      // Validate the payment before processing
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      await fetch(
        `https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pre_checkout_query_id: pre_checkout_query.id,
            ok: true
          }),
        }
      );

      return NextResponse.json({ success: true });
    }

    if (successful_payment) {
      // Process successful payment
      const payload = JSON.parse(successful_payment.invoice_payload);
      const { userId, amount } = payload;

      // Update user balance
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/game/user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            action: 'deposit',
            amount,
            currency: 'STARS'
          }),
        }
      );

      if (!userResponse.ok) {
        console.error('Failed to update user balance');
        return NextResponse.json(
          { error: 'Failed to update balance' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Payment processed successfully' 
      });
    }

    return NextResponse.json(
      { error: 'Invalid payment data' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}