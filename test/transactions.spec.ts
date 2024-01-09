import { it, expect, beforeAll, afterAll, describe } from "vitest"
import request from 'supertest'
import { app } from '../src/app'

describe('Transaction routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should create a new transaction', async () => {
    const response = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transactions',
        amount: 5000,
        type: 'credit'
      })

    expect(response.statusCode).toEqual(201)
  })

  it('should be able to list all transactions', async () => {
    const server = app.server

    const createTransactionResponse = await request(server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 350,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('set-cookie')

    const listTransactionsResponse = await request(server)
      .get('/transactions')
      .set('Cookie', cookies)

    console.log(listTransactionsResponse.body)
    expect(listTransactionsResponse.statusCode).toEqual(200)
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 350
      })
    ])
  })
})

