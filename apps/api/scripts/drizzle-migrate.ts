import { migrate } from 'drizzle-orm/neon-serverless/migrator'
import { dbPool, pool } from '@/connector/database'
// This will run migrations on the database, skipping the ones already applied
await migrate(dbPool, { migrationsFolder: './migrations' })
// Don't forget to close the connection, otherwise the script will hang
await pool.end()
