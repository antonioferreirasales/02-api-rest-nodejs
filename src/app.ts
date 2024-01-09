import fastify from 'fastify'
import { transactionsRoutes } from './routes/transactions'
import cookie from '@fastify/cookie'

export const app = fastify()

// global preHandler
app.addHook('preHandler', async (request) => { console.log(`[${request.method}] ${request.url}`) })


app.register(cookie)
app.register(transactionsRoutes, {
  prefix: 'transactions',
})
