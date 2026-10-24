/**
 * Categoriser shapes.
 *
 * The model predicts a category NAME (one of the nine seeded expense
 * defaults); the service resolves that name to the user's category id.
 */

export interface ModelArtefact {
  version: string;
  trained_at: string;
  alpha: number;
  classes: string[];
  class_log_prior: number[];
  vocabulary: Record<string, number>;
  feature_log_prob: number[][];
  ngram_range: [number, number];
  /** [lowerInclusive, upperExclusive | null, token] */
  amount_buckets: [number, number | null, string][];
}

export interface ScoredCategory {
  category: string;
  confidence: number; // 0–1
}

export interface Prediction extends ScoredCategory {
  /** Top 3 candidates, best first (includes the winner). */
  alternatives: ScoredCategory[];
  /** How many description terms the model recognised. 0 = unknown merchant. */
  matchedTerms: number;
}

export interface SuggestedCategory extends ScoredCategory {
  categoryId: string | null;
}

export interface Suggestion {
  categoryId: string | null;
  categoryName: string;
  confidence: number;
  autoAssign: boolean;
  alternatives: SuggestedCategory[];
}
