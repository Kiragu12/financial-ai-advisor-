import * as categoryRepo from '../categories/categories.repository.js';
import { AUTO_ASSIGN_THRESHOLD, predict } from './categoriser.model.js';
import type { Suggestion } from './categoriser.types.js';
import type { SuggestInput } from './categoriser.schemas.js';

/**
 * Category suggestion: run the in-process model, then resolve the predicted
 * NAMES to this user's category ids (their own category first, then the system
 * default — see categoryRepo.findUsableExpenseByNames). A name the user has no
 * category for resolves to null and the client simply leaves the field unset.
 */

export async function suggest(userId: string, input: SuggestInput): Promise<Suggestion> {
  const prediction = predict(input.description, input.amount);

  const records = await categoryRepo.findUsableExpenseByNames(
    userId,
    prediction.alternatives.map((alt) => alt.category),
  );
  const idByName = new Map(records.map((r) => [r.name.toLowerCase(), r.id]));
  const idFor = (name: string) => idByName.get(name.toLowerCase()) ?? null;

  const categoryId = idFor(prediction.category);
  return {
    categoryId,
    categoryName: prediction.category,
    confidence: round(prediction.confidence),
    autoAssign: categoryId !== null && prediction.confidence >= AUTO_ASSIGN_THRESHOLD,
    alternatives: prediction.alternatives.map((alt) => ({
      categoryId: idFor(alt.category),
      category: alt.category,
      confidence: round(alt.confidence),
    })),
  };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
