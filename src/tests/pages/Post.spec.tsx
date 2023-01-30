import { render, screen } from '@testing-library/react'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { getSession } from "next-auth/client"
import { mocked } from 'jest-mock'
import { getPrismicClient } from '../../services/prismic'

jest.mock('next-auth/client')
jest.mock('../../services/prismic')

const post = {
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post excerpt</p>',
    updatedAt: '30 de janeiro'
}

describe('Post page', () => {
    it('renders correctly', () => {
        render(<Post post={post} />)

        expect(screen.getByText('My New Post')).toBeInTheDocument()
        expect(screen.getByText('Post excerpt')).toBeInTheDocument()
    })

    it('redirects user if no subscription is found', async () => {
        const getSessionMocked = mocked(getSession)

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: null
        } as any)

        //ou poderia retornar a session inteira como nula que irá funcionar também
        //getSessionMocked.mockResolvedValueOnce(null)

        const response = await getServerSideProps({
            params: 'my-new-post',
        } as any)

        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                    destination: '/',
                })
            })
        )

        // expect(response).toEqual(
        //     expect.objectContaining({
        //         redirect: {
        //             destination: '/',
        //             permanent: false, // nem precisa, precisamos  validar ao meno uma propriedade
        //         }
        //     })
        // )
    })

    it('loads initial data', async () => {
        const getSessionMocked = mocked(getSession)
        const getPrismicClientMocked = mocked(getPrismicClient)

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        { type: 'headind', text: 'My new post'}
                    ],
                    content: [
                        { type: 'paragraph', text: 'Post excerpt'}
                    ]
                },
                last_publication_date: '04-01-2021'
            })
        } as any)

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        } as any)

        const response = await getServerSideProps({
            params: { slug: 'my-new-post'}
        } as any)

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My new post',
                        content: '<p>Post excerpt</p>',
                        updatedAt: '01 de abril de 2021'
                    }
                }
            })
        )
    })
})