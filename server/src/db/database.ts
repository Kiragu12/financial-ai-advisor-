import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

// Return `date` columns (OID 1082) as plain 'YYYY-MM-DD' strings rather than
// JS Date objects. Default parsing constructs a Date at local midnight, which
// can shift a pure calendar date across a day boundary depending on timezone.
pg.types.setTypeParser(1082, (value) => value);

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

/**
 * Anything that can run a query: the pool itself, or a single PoolClient
 * checked out for a transaction. Repository functions accept a Queryable
 * (defaulting to the pool) so the same function works both standalone and
 * inside `withTransaction`.
 */
export interface Queryable {
  query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<pg.QueryResult<T>>;
}

/**
 * Run a single parameterised query.
 * Use $1, $2, … placeholders — never string-interpolate user input.
 */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  values?: unknown[],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, values as pg.QueryConfigValues<unknown[]>);
}

/**
 * Run a group of operations inside a single database transaction.
 * Any thrown error automatically triggers a ROLLBACK.
 */
export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
