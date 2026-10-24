import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../client';
import { queryKeys } from '../query-keys';
import type { CategorySuggestion } from '../types';

/**
 * Expense category suggestion from the server's in-process model, fetched as
 * the user types. Inputs are debounced so we ask once the user pauses, and only
 * once there is enough to go on (3+ characters and an amount).
 *
 * Suggestions are best-effort: no retries, and any failure simply yields
 * `undefined` so the form behaves exactly as it would without the model.
 */

const DEBOUNCE_MS = 400;
const MIN_DESCRIPTION_LENGTH = 3;

export function useCategorySuggestion(
  description: string,
  amount: number,
  enabled = true,
): CategorySuggestion | undefined {
  const debouncedDescription = useDebouncedValue(description.trim(), DEBOUNCE_MS);
  const debouncedAmount = useDebouncedValue(amount, DEBOUNCE_MS);

  const ready =
    enabled &&
    debouncedDescription.length >= MIN_DESCRIPTION_LENGTH &&
    Number.isFinite(debouncedAmount) &&
    debouncedAmount > 0;

  const { data } = useQuery({
    queryKey: queryKeys.categoriser.suggest(debouncedDescription, debouncedAmount),
    queryFn: () =>
      api.post<CategorySuggestion>('/api/categoriser/suggest', {
        description: debouncedDescription,
        amount: debouncedAmount,
      }),
    enabled: ready,
    retry: false,
    staleTime: Infinity,
    // Keep the last suggestion on screen while the next one loads, so an
    // auto-selected category doesn't flicker on every keystroke.
    placeholderData: keepPreviousData,
  });

  return ready ? data : undefined;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
