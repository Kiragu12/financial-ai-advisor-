import type { Finding, Severity } from './insights/insights.types.js';

/**
 * Reply templates — how findings and knowledge-base answers become the
 * advisor's words. Tone follows ADVISOR_PERSONA: warm, concise, never preachy,
 * real numbers only. Each reply leads with the single most relevant thing and
 * ends with exactly one concrete action.
 *
 * `variant` (the conversation turn number) rotates the opening phrase so asking
 * the same question twice doesn't return byte-identical text.
 */

const OPENERS: Record<Severity, string[]> = {
  critical: [
    "Here's what needs your attention first:",
    'The most important thing right now:',
    'One thing stands out above the rest:',
  ],
  warning: [
    "Here's what I'm seeing:",
    'A pattern worth looking at:',
    'Something to keep an eye on:',
  ],
  info: ['A quick note:', 'Worth knowing:', "Here's a heads-up:"],
  positive: ['Good news first:', 'Something is going well:', 'Nice work!'],
};

const FOLLOW_UPS = ['Also worth a look:', 'On top of that:', 'Separately:'];
const BRIGHT_SIDES = ['On the bright side:', 'Worth celebrating:', 'And a win:'];

// Used only when no finding carries its own suggestion (e.g. everything is fine).
const DEFAULT_ACTION =
  "Move this month's surplus into a savings goal now, before it gets absorbed into everyday spending.";

export const DISCLAIMER =
  "Note: I'm not a licensed financial advisor — for decisions about loans, debt or investments, please speak to a qualified professional.";

export const CAPABILITIES =
  "I can tell you what you've spent (\"how much did I spend on transport this month?\"), give advice based on your own numbers (\"how can I save more?\"), and explain money basics (\"what is an emergency fund?\").";

export function pick<T>(pool: T[], variant: number): T {
  return pool[Math.abs(variant) % pool.length]!;
}

/** Lead finding, up to one more concern, one positive note, then exactly one action. */
export function renderFindings(findings: Finding[], variant: number): string {
  const [lead, ...rest] = findings;
  if (!lead) return CAPABILITIES;

  const parts = [`${pick(OPENERS[lead.severity], variant)} ${lead.detail}`];

  const concern = rest.find((f) => f.severity !== 'positive');
  if (concern) parts.push(`${pick(FOLLOW_UPS, variant)} ${concern.detail}`);

  const positive = lead.severity === 'positive' ? null : rest.find((f) => f.severity === 'positive');
  if (positive) parts.push(`${pick(BRIGHT_SIDES, variant)} ${positive.detail}`);

  const action = [lead, ...rest].find((f) => f.suggestion)?.suggestion ?? DEFAULT_ACTION;
  parts.push(`Next step: ${action}`);

  return parts.join('\n\n');
}

/** A knowledge-base answer, tied back to the user's own numbers when there's a relevant finding. */
export function renderKnowledge(answer: string, personal: Finding | undefined): string {
  if (!personal?.suggestion) return answer;
  return `${answer}\n\nFor you specifically: ${personal.detail}\n\nNext step: ${personal.suggestion}`;
}

export function renderUnknown(lead: Finding | undefined, variant: number): string {
  const intro = "I don't have a ready answer for that one.";
  if (!lead) return `${intro} ${CAPABILITIES}`;
  return `${intro} Here's what stands out in your own numbers instead.\n\n${renderFindings([lead], variant)}`;
}
