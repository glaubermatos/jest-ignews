import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import Posts, { getStaticProps } from '../../pages/posts'
import { getPrismicClient } from '../../services/prismic'

jest.mock('next-auth/client', () => {
    return {
        useSession() {
            return [null, false]
        }
    }
})
jest.mock('../../services/prismic')

const posts = [
    { slug: 'my-new-post', title: 'My New Post', excerpt: 'Post excerpt', updatedAt: '30 de janeiro'}
]

describe('Posts page', () => {
    it('renders correctly', () => {
        render(<Posts posts={posts} />)

        expect(screen.getByText("My New Post")).toBeInTheDocument()
    })

    it('loads initial data', async () => {
        const getPrismicClientMocked = mocked(getPrismicClient)

        getPrismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
                results: [
                    {
                        uid: 'my-new-post',
                        data: {
                            title: [
                                { type: 'headind', text: 'My new post'}
                            ],
                            content: [
                                { type: 'paragraph', text: 'Post excerpt'}
                            ]
                        },
                        last_publication_date: '01-30-2023',
                    }
                ]
            })
        } as any)

        const response = await getStaticProps({})

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    posts: [{
                        slug: 'my-new-post',
                        title: 'My new post',
                        excerpt: 'Post excerpt',
                        updatedAt: '30 de janeiro de 2023'
                    }]
                }
            })
        )
    })
})