import { z } from 'zod'
import { knex } from '../database'
import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { checkSessionIdRequest } from '../middleware/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdRequest],
    },
    async (request) => {
      const { sessionId } = request.cookies
      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions }
    },
  )

  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transactions = await knex('transactions')
      .select('*')
      .where('id', id)
      .first()

    return { transactions }
  })

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    // validando os dados com o objeto zod definido
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 100 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/summary', { preHandler: [checkSessionIdRequest] }, async (request) => {
    const { sessionId } = request.cookies
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .where('session_id', sessionId)
      .first()

    return { summary }
  })
}
