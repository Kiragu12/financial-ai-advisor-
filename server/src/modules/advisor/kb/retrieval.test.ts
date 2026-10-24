import { describe, expect, it } from 'vitest';
import entries from './knowledge-base.json' with { type: 'json' };
import { retrieve } from './retrieval.js';

describe('knowledge-base retrieval', () => {
  it.each([
    ['what is an emergency fund', 'emergency-fund'],
    ['what is a sacco', 'sacco'],
    ['is fuliza expensive', 'fuliza'],
    ['what is a money market fund', 'money-market-fund'],
    ['how do I split rent with my roommate', 'split-rent'],
    ['how to save on data bundles', 'airtime-data'],
  ])('retrieves the right entry for "%s"', (query, id) => {
    expect(retrieve(query)?.entry.id).toBe(id);
  });

  it.each(['what is the weather', 'who won the football match', 'best laptop to buy', ''])(
    'returns null for off-topic "%s"',
    (query) => {
      expect(retrieve(query)).toBeNull();
    },
  );

  it('has 40–60 well-formed entries with unique ids', () => {
    expect(entries.length).toBeGreaterThanOrEqual(40);
    expect(entries.length).toBeLessThanOrEqual(60);
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    for (const e of entries) {
      expect(e.answer.length).toBeGreaterThan(0);
      expect(e.keywords.length).toBeGreaterThan(0);
    }
  });
});
