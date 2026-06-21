import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import type { CategoriesResponse, Category, CategoryType } from '../types';

/**
 * Categories are mostly static (system defaults + the user's own), so they cache
 * for a good while. Optional type filter mirrors the backend's ?type= param.
 */
export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ['categories', type ?? 'all'] as const,
    queryFn: async (): Promise<Category[]> => {
      const query = type ? `?type=${type}` : '';
      const { categories } = await api.get<CategoriesResponse>(`/api/categories${query}`);
      return categories;
    },
    staleTime: 5 * 60_000,
  });
}
