import { pool, query, type Queryable } from '../../db/database.js';
import type { CategoryRecord, CategoryType } from './categories.types.js';

/**
 * Category data access. "Usable by a user" always means: system defaults
 * (user_id is null) OR that user's own categories. That rule is encoded in
 * every query so a user can never reference someone else's custom category.
 */

export async function findForUser(
  userId: string,
  type?: CategoryType,
): Promise<CategoryRecord[]> {
  const values: unknown[] = [userId];
  let typeFilter = '';
  if (type) {
    values.push(type);
    typeFilter = `and type = $2`;
  }

  const { rows } = await query<CategoryRecord>(
    `select * from categories
     where (user_id is null or user_id = $1) ${typeFilter}
     order by type asc, is_default desc, name asc`,
    values,
  );
  return rows;
}

/**
 * Look up a single category the user is allowed to use. Accepts a Queryable so
 * transaction creation can validate the category inside its own DB transaction.
 */
export async function findUsableById(
  userId: string,
  categoryId: string,
  db: Queryable = pool,
): Promise<CategoryRecord | null> {
  const { rows } = await db.query<CategoryRecord>(
    `select * from categories
     where id = $1 and (user_id is null or user_id = $2)`,
    [categoryId, userId],
  );
  return rows[0] ?? null;
}
