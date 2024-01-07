import fastify from 'fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'
import cookie from '@fastify/cookie'

const app = fastify()

// global preHandler
app.addHook('preHandler', async (request) => { console.log(`[${request.method}] ${request.url}`) })


app.register(cookie)
app.register(transactionsRoutes, {
  prefix: 'transactions',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => console.log('HTTP Server Running!'))
