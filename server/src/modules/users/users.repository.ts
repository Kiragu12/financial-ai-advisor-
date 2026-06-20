import { query } from '../../db/database.js';
import type { UserRecord } from './users.types.js';

/**
 * Users data access — the only module that runs SQL against the `users` table.
 * All queries use parameterised placeholders ($1, $2, …); user input is never
 * concatenated into SQL.
 */

export interface CreateUserInput {
  fullName: string;
  email: string;
  passwordHash: string;
  preferredCurrency: string;
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const { rows } = await query<UserRecord>(
    `insert into users (full_name, email, password_hash, preferred_currency)
     values ($1, $2, $3, $4)
     returning *`,
    [input.fullName, input.email, input.passwordHash, input.preferredCurrency],
  );
  // `returning *` on an insert always yields exactly one row.
  return rows[0]!;
}

export async function findByEmail(email: string): Promise<UserRecord | null> {
  const { rows } = await query<UserRecord>(
    `select * from users where email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<UserRecord | null> {
  const { rows } = await query<UserRecord>(
    `select * from users where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}
