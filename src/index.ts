import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { routeTree } from './routes/routeTree'
import { NotFound } from './views/NotFound'

const app = new Hono()

app.route('/', routeTree)
app.notFound((c) => {
  return c.html(NotFound())
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
