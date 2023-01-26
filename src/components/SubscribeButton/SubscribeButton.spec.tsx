import { render, screen, fireEvent } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { signIn, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { SubscribeButton } from '.'

jest.mock('next/router')

jest.mock('next-auth/client')

describe('SubscribeButton component', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    it('renders correctly', () => {
        render(<SubscribeButton />)

        expect(screen.getByText('Subscribe now')).toBeInTheDocument()
    })

    it('redirects user to sign in when not authenticated', () => {
        const signInMocked = mocked(signIn)

        const useSessionMocked = mocked(useSession)

        useSessionMocked.mockReturnValueOnce([null, false])

        render(<SubscribeButton />)

        const subscribeButton = screen.getByText('Subscribe now')

        fireEvent.click(subscribeButton)

        expect(signInMocked).toHaveBeenCalled()
    })

    it('redirects to posts when user already has a subscription', () => {
        const useRouterMocked = mocked(useRouter)
        const pushMock = jest.fn()

        const useSessionMocked = mocked(useSession)

        useSessionMocked.mockReturnValueOnce([{ 
                user: {
                    name: 'John Doe', 
                    email: 'john.doe@example.com'
                }, expires: 'fake-expires', 
                activeSubscription: 'fake-active-subscription' 
            },
            false
        ])

        useRouterMocked.mockReturnValueOnce({
            push: pushMock
        } as any)

        render(<SubscribeButton />)

        const subscribeButton = screen.getByText('Subscribe now')

        fireEvent.click(subscribeButton)

        expect(pushMock).toHaveBeenCalledWith('/posts')
    })
})