/**
 * Category shapes.
 *
 * A category is either a system default (user_id is null, shared by everyone)
 * or a user's own custom category. `isCustom` in the public shape tells the
 * client which is which without exposing the owning user id.
 */

export type CategoryType = 'income' | 'expense';

export interface CategoryRecord {
  id: string;
  user_id: string | null;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  isCustom: boolean;
}

export function toCategory(record: CategoryRecord): Category {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    color: record.color,
    icon: record.icon,
    isDefault: record.is_default,
    isCustom: record.user_id !== null,
  };
}
