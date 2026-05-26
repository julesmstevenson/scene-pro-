// Stripe disabled temporarily
export const stripe = null as any

export async function createPaymentIntent(...args: any[]) {
  throw new Error('Stripe not configured yet')
}

export async function createCheckoutSession(...args: any[]) {
  throw new Error('Stripe not configured yet')
}

export async function handleWebhook(...args: any[]) {
  throw new Error('Stripe not configured yet')
}
