import { Hono } from 'hono'

export const paymentsController = new Hono()
  .get('/create', async (c) => {
    console.log('dam233sddasds2')
    return c.json({ boom: 10203 })
  })
  .get('/handle', async (c) => {
    console.log('what the heck!')
    return c.redirect('https://carlo.vercel.app')
  })
