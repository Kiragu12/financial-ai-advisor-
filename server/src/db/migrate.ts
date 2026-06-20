/**
 * Migration runner — run with: npx tsx src/db/migrate.ts
 *
 * Reads every .sql file in migrations/ (sorted by filename) and applies
 * ones that haven't been recorded in schema_migrations yet.
 * Safe to run multiple times — already-applied files are skipped.
 */

import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import '../config/env.js'; // load + validate env before anything else
import { env } from '../config/env.js';

const { Pool } = pg;

const MIGRATIONS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'migrations',
);

async function run() {
  const pool = new Pool({ connectionString: env.DATABASE_URL });

  try {
    // Enable pgcrypto so gen_random_uuid() works (first migration also does
    // this, but we need it before the schema_migrations table is created too).
    await pool.query(`create extension if not exists "pgcrypto"`);

    // Tracking table — created once, never touched by feature migrations.
    await pool.query(`
      create table if not exists schema_migrations (
        filename  text primary key,
        applied_at timestamptz not null default now()
      )
    `);

    // Read and sort migration files.
    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // Find which migrations are already applied.
    const { rows } = await pool.query<{ filename: string }>(
      'select filename from schema_migrations',
    );
    const applied = new Set(rows.map((r) => r.filename));

    let ran = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  skip  ${file}`);
        continue;
      }

      const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');

      // Run the migration and record it atomically.
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'insert into schema_migrations (filename) values ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`  apply ${file}`);
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration failed for ${file}: ${(err as Error).message}`);
      } finally {
        client.release();
      }
    }

    if (ran === 0) {
      console.log('All migrations already applied — nothing to do.');
    } else {
      console.log(`\nDone. Applied ${ran} migration(s).`);
    }
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error('\n[migrate] Error:', err.message);
  process.exit(1);
});
