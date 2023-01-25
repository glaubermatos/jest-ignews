import { loadStripe } from '@stripe/stripe-js'

export default function getStripeJS() {
    const stripe_js = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
    )

    return stripe_js
}