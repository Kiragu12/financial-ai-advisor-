/**
 * Shared text utilities — the one tokeniser in the system, used by both the
 * Naive Bayes categoriser and the advisor's knowledge-base retrieval.
 *
 * normalise() MUST match ml/features.py exactly: the categoriser model was
 * trained on tokens produced by that Python code, so any drift here silently
 * degrades every prediction.
 */

/** Lowercase, replace anything that is not a-z or whitespace with a space, collapse spaces. */
export function normalise(text: string | null | undefined): string {
  return (text ?? '')
    .toLowerCase()
    .replace(/[^a-z\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Whitespace-separated words of the normalised text. */
export function words(text: string | null | undefined): string[] {
  const cleaned = normalise(text);
  return cleaned ? cleaned.split(' ') : [];
}

/** Word n-grams for every n in [minN, maxN], joined with a single space (sklearn's convention). */
export function ngrams(tokens: string[], minN = 1, maxN = 2): string[] {
  const out: string[] = [];
  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      out.push(tokens.slice(i, i + n).join(' '));
    }
  }
  return out;
}

/** Unigrams + bigrams of the text. */
export function tokenise(text: string | null | undefined): string[] {
  return ngrams(words(text), 1, 2);
}

export type SparseVector = Map<string, number>;

/** Raw term counts. */
export function termFrequency(tokens: string[]): SparseVector {
  const tf: SparseVector = new Map();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  return tf;
}

/** Cosine similarity of two sparse vectors; 0 when either is empty. */
export function cosineSimilarity(a: SparseVector, b: SparseVector): number {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [term, weight] of small) {
    const other = large.get(term);
    if (other !== undefined) dot += weight * other;
  }
  if (dot === 0) return 0;
  return dot / (norm(a) * norm(b));
}

function norm(v: SparseVector): number {
  let sum = 0;
  for (const weight of v.values()) sum += weight * weight;
  return Math.sqrt(sum);
}
