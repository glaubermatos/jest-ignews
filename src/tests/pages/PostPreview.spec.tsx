import { render, screen } from '@testing-library/react'
import PostPreview, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { useSession } from 'next-auth/client'
import { mocked } from 'jest-mock'
import { useRouter } from 'next/router'
import { getPrismicClient } from '../../services/prismic'
// import mockRouter from 'next-router-mock';

jest.mock('next-auth/client')
jest.mock('next/router')
jest.mock('../../services/prismic')

const post = {
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post excerpt</p>',
    updatedAt: '30 de janeiro'
}
// jest.mock('../../services/prismic')

describe('Post preview page', () => {
    it('renders correctly', () => {
        const useSessionMocked = mocked(useSession)

        useSessionMocked.mockReturnValueOnce([null, false])

        render(<PostPreview post={post} />)

        expect(screen.getByText('My New Post')).toBeInTheDocument()
        expect(screen.getByText('Post excerpt')).toBeInTheDocument()
        expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
    });

    it('redirects user to full post when user is subscribed', () => {
        const useRouterMocked = mocked(useRouter)
        const pushMock = jest.fn();
        
        const useSessionMocked = mocked(useSession)
        
        useRouterMocked.mockReturnValueOnce({
            push: pushMock
        } as any)

        useSessionMocked.mockReturnValueOnce([
            { activeSubscription: 'fake-active-subscription' },
            false
        ] as any)

        render(<PostPreview post={post} />)

        expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
    });

    it('loads inital data', async () => {
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

        const response = await getStaticProps({params: { slug: 'my-new-post'}})

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
    });
})