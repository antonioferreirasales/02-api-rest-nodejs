import { it, expect, beforeAll, afterAll, describe, beforeEach } from "vitest"
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transaction routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
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

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 4000,
        type: 'credit'
      })
    const cookie = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookie)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getSpecificTransaction = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookie)

    expect(getSpecificTransaction.statusCode).toEqual(200)
    expect(getSpecificTransaction.body.transactions).toEqual(
      expect.objectContaining({
        id: transactionId
      })
    )
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 1000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(listTransactionsResponse.statusCode).toEqual(200)
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 1000
      })
    ])
  })

  it('should be able to return a summary of transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 1000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'New transaction',
        amount: 400,
        type: 'debit'
      })

    const getSummary = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    console.log(getSummary.body.summary)
    expect(getSummary.statusCode).toEqual(200)
    expect(getSummary.body.summary).toEqual(
      expect.objectContaining({ amount: 600 })
    )
  })
})

