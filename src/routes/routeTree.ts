import { Hono } from 'hono'

import { authorizationRoute } from './authorization'
import { consentRoute } from './consent'
import { introspectionRoute } from './introspection'
import { loginRoute } from './login'
import { tokenRoute } from './token'
import { userSelectionRoute } from './userSelection'

const routeTree = new Hono()

routeTree.route('/', authorizationRoute)
routeTree.route('/', consentRoute)
routeTree.route('/', introspectionRoute)
routeTree.route('/', loginRoute)
routeTree.route('/', tokenRoute)
routeTree.route('/', userSelectionRoute)

export { routeTree }
