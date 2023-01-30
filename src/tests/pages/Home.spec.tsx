import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { stripe } from '../../services/stripe'

import Home, { getStaticProps } from '../../pages'

jest.mock('next/router')

//usando o mock quando não precisa mudar o valor do mock em cada teste
jest.mock('next-auth/client', () => {
    return {
        useSession() {
            return [null, false]
        }
    }
})

jest.mock('../../services/stripe')

describe('Home page', () => {
    it('renders correctly', () => {
        // exemplo usando o mock em cada teste
        // // mock next/router
        // const useRouterMocked = mocked(useRouter)

        // const pushMocked = jest.fn()

        // useRouterMocked.mockReturnValueOnce({
        //     push: pushMocked
        // } as any)

        // // mock next-auth/client
        // const useSessionMocked = mocked(useSession)

        // useSessionMocked.mockReturnValueOnce([null, false])

        render(<Home product={{priceId: 'fake-price-id', amount: 'R$10,00'}} />)

        expect(screen.getByText('for R$10,00 month')).toBeInTheDocument()
    })

    it('loads initial data', async () => {
        const retrieveStripePricesMocked = mocked(stripe.prices.retrieve)

        retrieveStripePricesMocked.mockResolvedValueOnce({
            id: 'fake-price-id',
            unit_amount: 1000,
        } as any)

        const response = await getStaticProps({})

       expect(response).toEqual(
        expect.objectContaining({
            props: {
                product: {
                    priceId: 'fake-price-id',
                    amount: '$10.00'
                }
            }
        })
       )

    })
})