import { query as q } from "faunadb"

import NextAuth from "next-auth"
import Providers from "next-auth/providers"

import { fauna } from '../../../services/faunadb'

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
    // ...add more providers here
  ],
  callbacks: {    
    async session(session) {

      try {
        const userActiveSubscription = await fauna.query(
          //obtem os dados da subscription do usuário que corresponde com a sessão
          q.Get(
            //obter a subscription que atende aos dois critérios de busca,
            //subscription do usuário logado e subscription ativa
            q.Intersection([
              //buscar subscription pelo user ref do usuario logado
              q.Match(
                q.Index('subscription_by_user_ref'),
                //retorna apenas o user ref do usuário que corresponde com o email
                q.Select(
                  'ref',
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)//obtem o email da sessão do usuario logado
                    )
                  )
                )
              ),
              // verifica subscription ativa
              q.Match(
                q.Index('subscription_by_status'),
                'active'
              )
            ])
          )
        )

        return {
          ...session,
          activeSubscription: userActiveSubscription
        }
      } catch {
        return {
          ...session,
          activeSubscription: null
        }
      }
    },
    async signIn( user, account, profile ) {
      const { email } = user  
      
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create(
              q.Collection('users'),
              { data: { email }}
            ),
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )
        )
        
        return true
      } catch (err) {
        console.error('Error: %s', err)
        return false
      }
    },
}
})