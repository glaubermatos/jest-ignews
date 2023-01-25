import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";

import { Readable } from "stream";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
    const chunks = [];

    for await (const chunk of readable) {
        chunks.push(
        typeof chunk === "string" ? Buffer.from(chunk) : chunk
        );
    }

    return Buffer.concat(chunks);
}
  
export const config = {
    api: {
        bodyParser: false,
    }
}

const relevantEvents = new Set([
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
])

export default async (request: NextApiRequest, response: NextApiResponse) => {
    if (request.method === 'POST') {
        const buf = await buffer(request)
        //assinatura secreta enviada pelo stripe
        const signature = request.headers['stripe-signature']
        //stripe-cli webhook signing secret 
        const secret = process.env.STRIPE_WEBHOOK_SECRET
        
        let event: Stripe.Event

        try {
            event = stripe.webhooks.constructEvent(
                buf,
                signature,
                secret
            )
        } catch (err) {
            console.log('webhook signature veification failed.', err.message)
            return response.status(400).send(`Webhook Error: ${err.message}`)
        }

        const { type } = event

        if (relevantEvents.has(type)) {
            // Handle the event
            try {
                switch(type) {
                    case 'customer.subscription.created':
                    case 'customer.subscription.updated':
                    case 'customer.subscription.deleted':
                        const subscription = event.data.object as Stripe.Subscription

                        await saveSubscription(
                            subscription.id.toString(),
                            subscription.customer.toString(),
                            type === 'customer.subscription.created'
                        )

                        break;
                    case 'checkout.session.completed':
                        const checkoutSessionEvent = event.data.object as Stripe.Checkout.Session
                        
                        await saveSubscription(
                            checkoutSessionEvent.subscription.toString(),
                            checkoutSessionEvent.customer.toString(),
                            true
                        )
            
                        break;
                    default:
                        throw new Error('Unhandled event.')
                }
            } catch (err) {
                console.log(`Unhandled event type ${event.type}`);
                return response.json({error: 'Webhook handler failed.'})
            }
        }

        response.json({ received: true})
    } else {
        response.setHeader('Allow', 'POST')
        response.status(405).end('Method not allowed')
    }
}