// =============================================================================
// Server-only Postgres connection pool (Render "shadowforge" DB).
// -----------------------------------------------------------------------------
// `import 'server-only'` guarantees this module can never be pulled into a
// client bundle — the DATABASE_URL credentials stay on the server.
//
// In dev, Next.js hot-reloads modules, which would otherwise leak a new Pool on
// every edit; we cache the pool on globalThis to keep a single connection set.
// =============================================================================
import 'server-only';
import { Pool, type QueryResultRow } from 'pg';

const globalForPg = globalThis as unknown as { __sfPool?: Pool };

function makePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set — add it to .env.local');
  }
  return new Pool({
    connectionString,
    // Render requires TLS; their cert chain is not in Node's default store.
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
}

export const pool: Pool = globalForPg.__sfPool ?? makePool();
if (process.env.NODE_ENV !== 'production') globalForPg.__sfPool = pool;

/** Run a parameterized query and return typed rows. */
export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query<T>(text, params as never[]);
  return res.rows;
}

/** Run a query and return the first row (or null). */
export async function queryOne<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
