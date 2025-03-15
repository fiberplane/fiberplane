export function createMessages(content: string) {
	return [
		{
			role: "system" as const,
			content: `You are an expert on the Hono framework: a Fast, lightweight, built on Web Standards. Support for any JavaScript runtime. 
As the first steps into answering you will make a list_dependencies call to figure out what dependencies are being used. You should then use the provided tools whenever relevant to answer user queries. Do not attempt to use your general knowledge for questions that can be answered with tools. Always check if a tool is available before responding directly.`,
			// As the first steps into answering you will make a list_dependencies call to figure out what dependencies are being used and then call find_database to figure out which database is being used. You should then use the provided tools whenever relevant to answer user queries. Do not attempt to use your general knowledge for questions that can be answered with tools. Always check if a tool is available before responding directly.`,
		},
		{
			role: "assistant" as const,
			content: `# Hono Framework API Reference

## Core Concepts and Usage

Hono is a lightweight, ultrafast web framework for edge runtimes like Cloudflare Workers, Deno, and Bun. It also works in Node.js environments. Its name means "flame" in Japanese.

### Key Characteristics
- Small bundle size (~13KB) with zero dependencies
- Type-safe request/response handling with TypeScript
- Middleware architecture
- Compatible with Web Standard APIs
- Multi-runtime support (Cloudflare Workers, Fastly, Deno, Bun, Node.js, etc.)

## Basic Usage

### Creating an Application

\`\`\`typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))

export default app
\`\`\`

### Context Object

The context object (\`c\`) provides access to:
- Request/response handling
- Utilities for extracting parameters, query string values, etc.
- State management within the request lifecycle

## Routing

### Basic Routes

\`\`\`typescript
// GET request
app.get('/users', (c) => c.json({ users: [] }))

// POST request
app.post('/users', (c) => c.text('Created!', 201))

// PUT request
app.put('/users/:id', (c) => c.text('Updated!'))

// DELETE request
app.delete('/users/:id', (c) => c.text('Deleted!'))

// Multiple methods
app.on(['GET', 'POST'], '/users', (c) => {
if (c.req.method === 'GET') {
return c.text('GET /users')
} else {
return c.text('POST /users')
}
})

// All methods
app.all('/all', (c) => c.text('All methods'))
\`\`\`

### Route Parameters

\`\`\`typescript
// Named parameters
app.get('/users/:id', (c) => {
const id = c.req.param('id')
return c.text(\`User ID: $\{ id \}\`)
})

// Optional parameters
app.get('/posts/:id?', (c) => {
const id = c.req.param('id')
return c.text(\`Post ID: $\{ id || 'all'\} \`)
})

// Wildcard/catch-all routes
app.get('/wild/*', (c) => c.text('Wildcard'))
\`\`\`

### Route Groups

\`\`\`typescript
// Route grouping
app.route('/api', api)

// Or:
const api = new Hono()
api.get('/users', (c) => c.text('API users'))
app.route('/api', api)

// Nested routes
app.route('/api', api)
api.route('/v1', apiV1)
\`\`\`

## Request Handling

### Query Parameters

\`\`\`typescript
app.get('/search', (c) => {
const query = c.req.query('q')
return c.text(\`Search query: $\{ query \} \`)
})

// URL search params
app.get('/search', (c) => {
const params = c.req.queries() // Returns key-value pairs
return c.json(params)
})
\`\`\`

### Request Body

\`\`\`typescript
// JSON body
app.post('/users', async (c) => {
const body = await c.req.json()
return c.json(body)
})

// Form data
app.post('/form', async (c) => {
const body = await c.req.parseBody()
return c.json(body)
})

// Request validation with built-in validator
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const schema = z.object({
name: z.string(),
age: z.number()
})

app.post('/validate', zValidator('json', schema), (c) => {
const data = c.req.valid('json')
return c.json(data)
})
\`\`\`

### Headers

\`\`\`typescript
app.get('/headers', (c) => {
const userAgent = c.req.header('User-Agent')
return c.text(\`User Agent: $\{ userAgent \} \`)
})
\`\`\`

### Cookies

\`\`\`typescript
app.get('/cookies', (c) => {
const cookie = c.req.cookie('session')
return c.text(\`Cookie: $\{ cookie \}\`)
})
\`\`\`

## Response Handling

### Response Types

\`\`\`typescript
// Text response
app.get('/text', (c) => c.text('Hello World'))

// JSON response
app.get('/json', (c) => c.json({ message: 'Hello World' }))

// HTML response
app.get('/html', (c) => c.html('<h1>Hello World</h1>'))

// With status code
app.get('/created', (c) => c.text('Created!', 201))

// Setting headers
app.get('/headers', (c) => {
return c.text('With headers', {
headers: {
'X-Custom-Header': 'Custom Value'
}
})
})

// Redirects
app.get('/redirect', (c) => c.redirect('/destination'))

// Setting cookies
app.get('/set-cookie', (c) => {
c.cookie('session', 'value', { httpOnly: true })
return c.text('Cookie set')
})
\`\`\`

## Middleware

\`\`\`typescript
// Basic middleware
app.use(async (c, next) => {
console.log('Before request')
await next()
console.log('After request')
})

// Path-specific middleware
app.use('/admin/*', async (c, next) => {
// Auth check
if (!isAuthenticated(c)) {
return c.text('Unauthorized', 401)
}
await next()
})

// Common middleware examples
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

app.use('*', logger())
app.use('*', cors())
\`\`\`

## Error Handling

\`\`\`typescript
// Global error handler
app.onError((err, c) => {
console.error(\`$\{ err \} \`)
return c.text('Server Error', 500)
})

// Not found handler
app.notFound((c) => {
return c.text('Not found', 404)
})

// Throwing errors in handlers
app.get('/error', (c) => {
throw new Error('Something went wrong')
})
\`\`\`

## Advanced Features

### JSX/TSX Support

\`\`\`typescript
// First add JSX to your project (see Hono docs)
import { html } from 'hono/html'

app.get('/', (c) => {
return c.html(
html\`< html >
<body>
<h1>Hello Hono! </h1>
  </body>
  </html>\`
)
})

// Or with JSX
/** @jsx jsx */
import { jsx } from 'hono/jsx'

app.get('/', (c) => {
return c.html(<h1>Hello Hono! </h1>)
})
\`\`\`

### File Handling

\`\`\`typescript
// Serve a static file (needs middleware)
import { serveStatic } from 'hono/serve-static'

app.use('/static/*', serveStatic({ root: './' }))

// File uploads
app.post('/upload', async (c) => {
const body = await c.req.parseBody()
const file = body.file // Uploaded file
// Process file...
return c.text('Uploaded')
})
\`\`\`

### WebSockets

\`\`\`typescript
// For environments that support WebSockets
app.get('/ws', (c) => {
// Implementation depends on the runtime
const { upgrade } = c.req.raw
if (upgrade) {
// Handle WebSocket upgrade
}
})
\`\`\`

## Testing

\`\`\`typescript
import { describe, it, expect } from 'vitest'

describe('Hono App', () => {
it('should return 200 response', async () => {
const res = await app.request('/')
expect(res.status).toBe(200)
})
})
\`\`\`

## Deployment

Hono works seamlessly in various environments:

\`\`\`typescript
// Cloudflare Workers
export default app

// Node.js
import { serve } from '@hono/node-server'
serve(app)

// Deno
Deno.serve(app.fetch)

// Bun
export default {
port: 3000,
fetch: app.fetch
}
\`\`\`

Remember, Hono's API focuses on simplicity and adherence to Web Standard APIs, making it portable across multiple runtime environments.

It's safe to assume that typically endpoints return JSON data and will use typescript, follow a restful API schema and the hono library (unless otherwise specified).

In order to best help the user, you may want find out what dependencies they are using (using the list_dependencies tool)
`,
		},
		{
			role: "user" as const,
			content,
		},
	];
}
