import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from 'faunadb'
import { fauna } from "../../services/faunadb";
import { stripe } from "../../services/stripe";
import { getSession } from "next-auth/client";

type User = {
    ref: {
        id: string
    }
    data: {
        stripe_customer_id: string
    }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
    //Recupera a sessão do usuario dos cookies com o next-auth/client
    const session = await getSession({req})

    //recupera do faunadb o usuario pelo email da sessão
    const user = await fauna.query<User>(
        q.Get(
            q.Match(
                q.Index('user_by_email'),
                q.Casefold(session.user.email)
            )
        )
    )

    let customerId = user.data.stripe_customer_id

    //verifica se o usuario do fauna ainda não tem a propriedade stripe_customer_id
    if(!customerId) {
        // cria um customer no stripe
        const stripeCustomer = await stripe.customers.create({
            name: session.user.name,
            email: session.user.email,
        });

        // atualiza o usuario no fauna adicionando a propriedade stripe_customer_id
        await fauna.query(
            q.Update(
                q.Ref(q.Collection('users'), user.ref.id),
                { 
                    data: { 
                        stripe_customer_id: stripeCustomer.id
                    }
                }
            )
        )
        
        // reaatribui o valor para a variavel customerId
        customerId = stripeCustomer.id
    }

    // cria o checkput session do stripe
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
        //id do customer do stripe
        customer: customerId,
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        line_items: [
            { price: 'price_1Jx90wLT2oVJEFk6xOK7qsDV', quantity: 1, },
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: process.env.STRIPE_CHECKOUT_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CHECKOUT_CANCEL_URL,
    })
    
    //retorna o session id do checkout para posterior redirecionamento para a 
    //página de checkout hospedada pelo stripe
    return res.json({ sessionId: stripeCheckoutSession.id})
    } else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}