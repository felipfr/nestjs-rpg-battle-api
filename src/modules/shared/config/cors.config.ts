import type { FastifyCorsOptions } from '@fastify/cors'

export function buildCorsOptions(): FastifyCorsOptions {
  const isDev = process.env.NODE_ENV !== 'production'

  return {
    origin: isDev ? '*' : (process.env.CORS_ORIGIN?.split(',') ?? []),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    optionsSuccessStatus: 204,
  }
}
