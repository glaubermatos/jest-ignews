import { signIn, useSession } from 'next-auth/client'
import getStripeJS from '../../services/stripe-js'
import { api } from '../../services/api'
import styles from './styles.module.scss'
import { useRouter } from 'next/router'

export function SubscribeButton() {
    const router = useRouter()

    //tem acesso a sessão do usuário
    const [session] = useSession()
    
    async function handleSubscribe() {
        if(!session) {
            signIn('github')
            return;
        }

        // console.log(session)

        if (session.activeSubscription) {
            router.push('/posts')
            return
        }

        try {
            //se tem um usuário logado na aplicação
            //criar um checkout sessionID usando a api-route do nextjs
            const response = await api.post('/subscribe')
            
            const { sessionId } = response.data
            
            const stripeJS = await getStripeJS()
            
            //redirect para o checkout session do stripe usando o sdk 
            //para uso do lado front-end, stripe-js para cliente js
            await stripeJS.redirectToCheckout({sessionId})
        } catch (err) {
            alert(err.message)
        }
    }

    return(
        <button 
            type="button" 
            className={styles.subscribeButton}
            onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    )
}