import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSucceeded(intent)
      break
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailed(intent)
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: intent.id },
    include: { reservation: { include: { spectator: { include: { loyaltyAccount: true } } } } },
  })
  if (!payment) return

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID', paidAt: new Date() },
    })

    await tx.reservation.update({
      where: { id: payment.reservationId },
      data: { status: 'CONFIRMED' },
    })

    // Award loyalty points (1 point per euro spent)
    const spectator = payment.reservation.spectator
    if (spectator?.loyaltyAccount) {
      const points = Math.floor(payment.amount / 100)
      await tx.loyaltyAccount.update({
        where: { id: spectator.loyaltyAccount.id },
        data: {
          points:     { increment: points },
          totalSpent: { increment: payment.amount },
        },
      })
      await tx.loyaltyTransaction.create({
        data: {
          accountId:   spectator.loyaltyAccount.id,
          type:        'EARN',
          points,
          description: `Réservation #${payment.reservation.reference}`,
        },
      })
    }
  })
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: intent.id },
    data: { status: 'FAILED' },
  })
}
