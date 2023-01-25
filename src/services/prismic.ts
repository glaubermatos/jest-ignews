import Prismic from '@prismicio/client'
import { DefaultClient } from '@prismicio/client/types/client'

var apiEndpoint = process.env.PRISMIC_ENTRY_POINT
var apiToken = process.env.PRISMIC_PERMANENT_ACCESS_TOKEN

export function getPrismicClient(req?: unknown): DefaultClient {
    const prismicClient = Prismic.client(
        apiEndpoint, 
        {
            accessToken: apiToken,
            req
        }
    )

    return prismicClient
}