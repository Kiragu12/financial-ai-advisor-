import { pool, query, type Queryable } from '../../db/database.js';
import type { CategoryRecord, CategoryType } from './categories.types.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.schemas.js';

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

export async function insertCustom(
  userId: string,
  data: CreateCategoryInput,
): Promise<CategoryRecord> {
  const { rows } = await query<CategoryRecord>(
    `insert into categories (user_id, name, type, color, icon, is_default)
     values ($1, $2, $3, $4, $5, false)
     returning *`,
    [userId, data.name, data.type, data.color ?? null, data.icon ?? null],
  );
  return rows[0]!;
}

export async function findCustomById(
  userId: string,
  categoryId: string,
): Promise<CategoryRecord | null> {
  const { rows } = await query<CategoryRecord>(
    `select * from categories
     where id = $1 and user_id = $2 and is_default = false`,
    [categoryId, userId],
  );
  return rows[0] ?? null;
}

export async function updateCustom(
  userId: string,
  categoryId: string,
  fields: UpdateCategoryInput,
): Promise<CategoryRecord | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (fields.name !== undefined) {
    sets.push(`name = $${i++}`);
    values.push(fields.name);
  }
  if (fields.color !== undefined) {
    sets.push(`color = $${i++}`);
    values.push(fields.color);
  }
  if (fields.icon !== undefined) {
    sets.push(`icon = $${i++}`);
    values.push(fields.icon);
  }

  sets.push(`updated_at = now()`);
  values.push(categoryId, userId);

  const { rows } = await query<CategoryRecord>(
    `update categories set ${sets.join(', ')}
     where id = $${i++} and user_id = $${i} and is_default = false
     returning *`,
    values,
  );
  return rows[0] ?? null;
}

export async function countTransactionsUsingCategory(
  userId: string,
  categoryId: string,
): Promise<number> {
  const { rows } = await query<{ count: string }>(
    `select count(*)::text as count
     from transactions
     where user_id = $1 and category_id = $2 and deleted_at is null`,
    [userId, categoryId],
  );
  return Number(rows[0]?.count ?? 0);
}

export async function deleteCustom(
  userId: string,
  categoryId: string,
): Promise<CategoryRecord | null> {
  const { rows } = await query<CategoryRecord>(
    `delete from categories
     where id = $1 and user_id = $2 and is_default = false
     returning *`,
    [categoryId, userId],
  );
  return rows[0] ?? null;
}
