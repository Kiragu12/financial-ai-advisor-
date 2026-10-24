import entries from './knowledge-base.json' with { type: 'json' };
import {
  cosineSimilarity,
  ngrams,
  termFrequency,
  words,
  type SparseVector,
} from '../../categoriser/text.js';

/**
 * Knowledge-base retrieval: TF-IDF vectors + cosine similarity, built once at
 * module load from knowledge-base.json. Uses the categoriser's tokeniser (one
 * tokeniser, two consumers).
 *
 * Below MIN_SIMILARITY we return null so the advisor says it doesn't know,
 * rather than answering an unrelated question.
 */

export interface KnowledgeEntry {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
}

export interface Retrieval {
  entry: KnowledgeEntry;
  score: number; // cosine similarity, 0–1
}

export const MIN_SIMILARITY = 0.25;

// Function words carry no topic; removing them keeps "what is the weather"
// from matching "what is an emergency fund" on grammar alone.
const STOPWORDS = new Set(
  (
    'a an and are am as at be been but by can could do does did for from get got had has have ' +
    'how i if in into is it its just me more most much my no not of on or our please should ' +
    'so some than that the their them then there these they this to too up us very was we ' +
    'what when where which who why will with would you your yours tell explain about'
  ).split(' '),
);

function terms(text: string): string[] {
  return ngrams(
    words(text).filter((w) => !STOPWORDS.has(w)),
    1,
    2,
  );
}

const knowledgeBase = entries as KnowledgeEntry[];

// Question and keywords describe what an entry is ABOUT, so they count double;
// the answer adds supporting vocabulary. Keywords are tokenised one by one so
// no bigram spans two unrelated keywords.
const entryTerms = knowledgeBase.map((e) => {
  const about = [...terms(e.question), ...e.keywords.flatMap(terms)];
  return [...about, ...about, ...terms(e.answer)];
});

const documentFrequency = new Map<string, number>();
for (const tokens of entryTerms) {
  for (const term of new Set(tokens)) {
    documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  }
}

// Smoothed IDF (as in scikit-learn). Terms never seen in the knowledge base get
// the maximum weight: an off-topic word should pull similarity DOWN, not be ignored.
const N = knowledgeBase.length;
function idf(term: string): number {
  return Math.log((1 + N) / (1 + (documentFrequency.get(term) ?? 0))) + 1;
}

function tfidf(tokens: string[]): SparseVector {
  const vector = termFrequency(tokens);
  for (const [term, count] of vector) vector.set(term, count * idf(term));
  return vector;
}

const entryVectors = entryTerms.map(tfidf);

/** Best-matching entry with its similarity, regardless of threshold. */
export function bestMatch(query: string): Retrieval | null {
  const queryVector = tfidf(terms(query));
  if (queryVector.size === 0) return null;

  let best: Retrieval | null = null;
  entryVectors.forEach((vector, i) => {
    const score = cosineSimilarity(queryVector, vector);
    if (!best || score > best.score) best = { entry: knowledgeBase[i]!, score };
  });
  return best;
}

/** Best match above MIN_SIMILARITY, or null when nothing is relevant enough. */
export function retrieve(query: string): Retrieval | null {
  const match = bestMatch(query);
  return match && match.score >= MIN_SIMILARITY ? match : null;
}
