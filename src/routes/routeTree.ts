import { Hono } from 'hono'

import { authorizationRoute } from './authorization'
import { loginRoute } from './login'

const routeTree = new Hono()

routeTree.route('/', authorizationRoute)
routeTree.route('/', loginRoute)

export { routeTree }
