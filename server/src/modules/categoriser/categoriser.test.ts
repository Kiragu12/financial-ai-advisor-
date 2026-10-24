import { describe, expect, it } from 'vitest';
import parity from './__fixtures__/parity.json' with { type: 'json' };
import {
  AUTO_ASSIGN_THRESHOLD,
  NO_EVIDENCE_CONFIDENCE_CAP,
  amountBucket,
  predict,
} from './categoriser.model.js';
import { cosineSimilarity, normalise, termFrequency, tokenise } from './text.js';

describe('text utilities', () => {
  it('normalises exactly like ml/features.py', () => {
    expect(normalise('  Pay Bill to 888880 - KPLC  PREPAID!! ')).toBe('pay bill to kplc prepaid');
    expect(normalise('Airtime & Data')).toBe('airtime data');
    expect(normalise(null)).toBe('');
  });

  it('emits unigrams then bigrams', () => {
    expect(tokenise('Java House CBD')).toEqual(['java', 'house', 'cbd', 'java house', 'house cbd']);
  });

  it('computes cosine similarity over sparse vectors', () => {
    const a = termFrequency(['a', 'b']);
    expect(cosineSimilarity(a, termFrequency(['a', 'b']))).toBeCloseTo(1);
    expect(cosineSimilarity(a, termFrequency(['c']))).toBe(0);
    expect(cosineSimilarity(a, new Map())).toBe(0);
  });
});

describe('amountBucket', () => {
  it('matches the training buckets', () => {
    expect(amountBucket(99)).toBe('amt_xs');
    expect(amountBucket(100)).toBe('amt_s');
    expect(amountBucket(1999)).toBe('amt_m');
    expect(amountBucket(9999)).toBe('amt_l');
    expect(amountBucket(45000)).toBe('amt_xl');
  });
});

describe('predict', () => {
  it('classifies a clear Food description', () => {
    const p = predict('Merchant Payment to 5123456 - NAIVAS WESTLANDS', 850);
    expect(p.category).toBe('Food');
    expect(p.confidence).toBeGreaterThanOrEqual(AUTO_ASSIGN_THRESHOLD);
  });

  it('classifies a clear Transport description', () => {
    const p = predict('uber trip', 450);
    expect(p.category).toBe('Transport');
    expect(p.confidence).toBeGreaterThanOrEqual(AUTO_ASSIGN_THRESHOLD);
  });

  it('does not throw on an empty description', () => {
    const p = predict('', 50);
    expect(p.alternatives).toHaveLength(3);
    expect(p.confidence).toBeLessThan(AUTO_ASSIGN_THRESHOLD);
  });

  it('gives an unknown merchant LOW confidence, even with a telling amount', () => {
    for (const amount of [300, 30000]) {
      const p = predict('xqzvbn enterprises', amount);
      expect(p.matchedTerms).toBe(0);
      expect(p.confidence).toBeLessThanOrEqual(NO_EVIDENCE_CONFIDENCE_CAP);
    }
  });

  it('returns three ranked alternatives, best first', () => {
    const { alternatives, category } = predict('java house', 600);
    expect(alternatives[0]!.category).toBe(category);
    expect(alternatives[0]!.confidence).toBeGreaterThanOrEqual(alternatives[1]!.confidence);
    expect(alternatives[1]!.confidence).toBeGreaterThanOrEqual(alternatives[2]!.confidence);
  });
});

describe('parity with scikit-learn', () => {
  // Fixture written by ml/export.py: sklearn's predict_proba on sample rows.
  // If this fails, ml/features.py and text.ts have drifted apart.
  it.each(parity)('$description ($amount)', ({ description, amount, probabilities }) => {
    const p = predict(description, amount);
    for (const alt of p.alternatives) {
      const expected = probabilities[alt.category as keyof typeof probabilities];
      expect(alt.confidence).toBeCloseTo(expected, 2);
    }
  });
});
