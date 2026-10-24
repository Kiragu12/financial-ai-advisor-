import artefact from './model.json' with { type: 'json' };
import { ngrams, words } from './text.js';
import type { ModelArtefact, Prediction, ScoredCategory } from './categoriser.types.js';

/**
 * Multinomial Naive Bayes inference — pure TypeScript, no I/O, no dependency.
 *
 * model.json is produced offline by ml/export.py from a scikit-learn
 * CountVectorizer + MultinomialNB pipeline and loaded once at module scope.
 * Scoring is the textbook NB decision rule:
 *
 *   score(c) = log P(c) + Σ count(t) · log P(t | c)    over terms t in the vocabulary
 *
 * then a softmax turns scores into probabilities.
 */

const model = artefact as unknown as ModelArtefact;

/**
 * When no description term is recognised, the only evidence is the amount
 * bucket — useful for ordering the alternatives (KES 30,000 is more likely Rent
 * than Airtime) but it cannot identify a merchant. Confidence is capped well
 * below the auto-assign threshold so an unknown merchant never produces a
 * confident wrong answer.
 */
export const NO_EVIDENCE_CONFIDENCE_CAP = 0.3;

/** At or above this confidence the form preselects the category. */
export const AUTO_ASSIGN_THRESHOLD = 0.6;

/** Same buckets as ml/features.py — the amount becomes one extra token. */
export function amountBucket(amount: number): string {
  const value = Math.abs(amount || 0);
  for (const [, upper, token] of model.amount_buckets) {
    if (upper === null || value < upper) return token;
  }
  return model.amount_buckets[model.amount_buckets.length - 1]![2];
}

export function predict(description: string | null | undefined, amount: number): Prediction {
  const descriptionWords = words(description);
  const [minN, maxN] = model.ngram_range;
  const terms = ngrams([...descriptionWords, amountBucket(amount)], minN, maxN);

  const scores = [...model.class_log_prior];
  let matchedTerms = 0;
  for (const term of terms) {
    const index = model.vocabulary[term];
    if (index === undefined) continue;
    if (!term.startsWith('amt_')) matchedTerms++;
    for (let c = 0; c < scores.length; c++) {
      scores[c]! += model.feature_log_prob[c]![index]!;
    }
  }

  const probabilities = softmax(scores);
  const cap = matchedTerms === 0 ? NO_EVIDENCE_CONFIDENCE_CAP : 1;
  const ranked: ScoredCategory[] = model.classes
    .map((category, i) => ({ category, confidence: Math.min(cap, probabilities[i]!) }))
    .sort((a, b) => b.confidence - a.confidence);

  return { ...ranked[0]!, alternatives: ranked.slice(0, 3), matchedTerms };
}

function softmax(scores: number[]): number[] {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const total = exps.reduce((sum, e) => sum + e, 0);
  return exps.map((e) => e / total);
}

export const modelInfo = {
  version: model.version,
  trainedAt: model.trained_at,
  classes: model.classes,
};
