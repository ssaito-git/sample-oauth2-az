import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { routeTree } from './routes/routeTree'
import { NotFoundView } from './views/NotFoundView'

const app = new Hono()

app.route('/', routeTree)
app.notFound((c) => {
  return c.html(NotFoundView())
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
