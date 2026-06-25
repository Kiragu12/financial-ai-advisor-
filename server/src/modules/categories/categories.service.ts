import * as categoryRepo from './categories.repository.js';
import { toCategory, type Category, type CategoryType } from './categories.types.js';
import { AppError } from '../../shared/app-error.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.schemas.js';

/** List every category available to the user, optionally filtered by type. */
export async function listCategories(
  userId: string,
  type?: CategoryType,
): Promise<Category[]> {
  const records = await categoryRepo.findForUser(userId, type);
  return records.map(toCategory);
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
}

export async function createCategory(
  userId: string,
  input: CreateCategoryInput,
): Promise<Category> {
  try {
    const record = await categoryRepo.insertCustom(userId, input);
    return toCategory(record);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw AppError.conflict(`You already have a ${input.type} category named "${input.name}".`);
    }
    throw error;
  }
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const existing = await categoryRepo.findUsableById(userId, categoryId);
  if (!existing) {
    throw AppError.notFound('Category not found.');
  }
  if (existing.user_id === null || existing.is_default) {
    throw AppError.forbidden('Default categories cannot be edited.');
  }

  try {
    const updated = await categoryRepo.updateCustom(userId, categoryId, input);
    return toCategory(updated!);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw AppError.conflict('You already have a category with that name and type.');
    }
    throw error;
  }
}

export async function deleteCategory(userId: string, categoryId: string): Promise<Category> {
  const existing = await categoryRepo.findUsableById(userId, categoryId);
  if (!existing) {
    throw AppError.notFound('Category not found.');
  }
  if (existing.user_id === null || existing.is_default) {
    throw AppError.forbidden('Default categories cannot be deleted.');
  }

  const usageCount = await categoryRepo.countTransactionsUsingCategory(userId, categoryId);
  if (usageCount > 0) {
    throw AppError.conflict(
      'This category is used by transactions. Rename it instead, or move those transactions first.',
    );
  }

  const deleted = await categoryRepo.deleteCustom(userId, categoryId);
  return toCategory(deleted!);
}
