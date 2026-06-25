import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../query-keys';
import type { CategoriesResponse, Category, CategoryResponse, CategoryType } from '../types';

/**
 * Categories are mostly static (system defaults + the user's own), so they cache
 * for a good while. Optional type filter mirrors the backend's ?type= param.
 */
export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: queryKeys.categories.list(type),
    queryFn: async (): Promise<Category[]> => {
      const query = type ? `?type=${type}` : '';
      const { categories } = await api.get<CategoriesResponse>(`/api/categories${query}`);
      return categories;
    },
    staleTime: 5 * 60_000,
  });
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryInput) =>
      api.post<CategoryResponse>('/api/categories', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export interface UpdateCategoryInput {
  categoryId: string;
  name?: string;
  color?: string;
  icon?: string;
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, ...body }: UpdateCategoryInput) =>
      api.patch<CategoryResponse>(`/api/categories/${categoryId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) =>
      api.delete<CategoryResponse>(`/api/categories/${categoryId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
    },
  });
}
