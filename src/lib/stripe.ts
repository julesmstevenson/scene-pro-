import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount)
}

export async function createPaymentIntent(
  amount: number,
  currency = 'eur',
  metadata: Record<string, string> = {}
) {
  return stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  })
}
