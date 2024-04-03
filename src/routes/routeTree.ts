import { Hono } from 'hono'

import { authorizationRoute } from './authorization'

const routeTree = new Hono()

routeTree.route('/', authorizationRoute)

export { routeTree }
