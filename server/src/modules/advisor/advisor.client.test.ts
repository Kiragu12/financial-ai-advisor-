import { describe, expect, it } from 'vitest';
import { generateReply, type ChatTurn } from './advisor.client.js';
import { classifyIntent } from './router.js';
import { DISCLAIMER } from './templates.js';
import { makeSnapshot, withMonth } from './insights/__fixtures__/snapshot.js';

const ask = (content: string, snapshot = makeSnapshot(), prior: ChatTurn[] = []) =>
  generateReply([...prior, { role: 'user', content }], snapshot);

describe('classifyIntent', () => {
  it.each([
    ['how much did I spend on transport this month', 'data'],
    ['show me my budgets', 'data'],
    ['how can I save more', 'advice'],
    ['how much should I save each month', 'advice'],
    ['am I spending too much on food', 'advice'],
    ['what is an emergency fund', 'general'],
  ])('"%s" → %s', (message, intent) => {
    expect(classifyIntent(message)).toBe(intent);
  });
});

describe('generateReply', () => {
  it('answers a data question from the snapshot numbers', async () => {
    const reply = await ask('how much did I spend on transport this month');
    expect(reply).toBe(
      'You spent KES 3,000 on Transport this month — 25% of your total spending of KES 12,000.',
    );
  });

  it('answers an advice request with the top finding and exactly one action', async () => {
    const reply = await ask('how can I save more', makeSnapshot(withMonth(8000, 12000)));
    expect(reply).toContain('KES 4,000 more than came in');
    expect(reply.match(/Next step:/g)).toHaveLength(1);
    expect(reply.trim().split('\n').at(-1)).toMatch(/^Next step:/);
  });

  it('answers a general question from the knowledge base', async () => {
    const reply = await ask('what is an emergency fund');
    expect(reply).toMatch(/^An emergency fund is money set aside/);
  });

  it('falls back to the top finding when the knowledge base has no answer', async () => {
    const reply = await ask('what is the weather', makeSnapshot(withMonth(8000, 12000)));
    expect(reply).toMatch(/^I don't have a ready answer/);
    expect(reply).toContain('KES 4,000 more than came in');
  });

  it('says plainly what it can do when there is nothing to go on', async () => {
    const reply = await ask('what is the weather', makeSnapshot({ ...withMonth(0, 0), transactionCount: 0 }));
    expect(reply).toContain("haven't logged any transactions");
  });

  it('appends the disclaimer when the topic touches loans, debt or investment', async () => {
    expect(await ask('should I take a mobile loan')).toContain(DISCLAIMER);
    expect(await ask('what is an emergency fund')).not.toContain(DISCLAIMER);
  });

  it('varies the opening when the same question is asked again', async () => {
    const snapshot = makeSnapshot(withMonth(8000, 12000));
    const first = await ask('how can I save more', snapshot);
    const second = await ask('how can I save more', snapshot, [
      { role: 'user', content: 'how can I save more' },
      { role: 'assistant', content: first },
    ]);
    expect(second).not.toBe(first);
  });
});
