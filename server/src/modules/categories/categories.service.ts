import * as categoryRepo from './categories.repository.js';
import { toCategory, type Category, type CategoryType } from './categories.types.js';

/** List every category available to the user, optionally filtered by type. */
export async function listCategories(
  userId: string,
  type?: CategoryType,
): Promise<Category[]> {
  const records = await categoryRepo.findForUser(userId, type);
  return records.map(toCategory);
}
