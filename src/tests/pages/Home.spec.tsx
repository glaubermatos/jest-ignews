import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router'

import Home from '../../pages'

jest.mock('next/router')

//usando o mock quando não precisa mudar o valor do mock em cada teste
jest.mock('next-auth/client', () => {
    return {
        useSession() {
            return [null, false]
        }
    }
})

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
})