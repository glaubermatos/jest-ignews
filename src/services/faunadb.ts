import { Client } from 'faunadb'

export const fauna = new Client({
    secret: process.env.FAUNADB_KEY,
    // US Region group, for example
    domain: "db.us.fauna.com"
})