import { drizzle as drizzleWs } from 'drizzle-orm/neon-serverless'
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http'
import { Pool, neon, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import logger from '../services/logger'
const log = logger('database')

// This is required for the WebSocket connection to work in Node.js
// See: https://github.com/neondatabase/serverless#example-nodejs-with-poolconnect
neonConfig.webSocketConstructor = ws

const { PRIVATE_DATABASE_URL } = import.meta.env

log.info('Iniciating DB...')
export const pool = new Pool({ connectionString: PRIVATE_DATABASE_URL })
export const http = neon(PRIVATE_DATABASE_URL)

// Same as above but with Drizzle
export const dbPool = drizzleWs(pool)
export const dbHttp = drizzleHttp(http)
