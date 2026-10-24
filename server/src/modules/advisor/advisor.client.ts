import { answerDataQuestion } from './data-answers.js';
import { runInsights } from './insights/insights.service.js';
import type { FinancialSnapshot } from './insights/insights.types.js';
import { retrieve } from './kb/retrieval.js';
import { ABOUT_ADVISOR, classifyIntent, touchesRiskyTopic } from './router.js';
import {
  CAPABILITIES,
  DISCLAIMER,
  renderFindings,
  renderKnowledge,
  renderUnknown,
} from './templates.js';

/**
 * Advisor reply generation — the single entry point the advisor service calls
 * to turn a conversation into a reply.
 *
 * Self-hosted by design: no external LLM, no API key, no outbound calls. Every
 * reply is produced in-process from our own components, so each sentence
 * traces back to a rule and a number:
 *
 *   router     (router.ts)          which branch answers the message
 *   data       (data-answers.ts)    figures read straight from the snapshot
 *   advice     (insights/)          ranked findings from the rule engine
 *   general    (kb/)                TF-IDF retrieval over a curated knowledge base
 *   wording    (templates.ts)       findings → sentences, ending in one action
 *
 * This replaced the earlier third-party LLM integration and removes the
 * provider-dependency risk noted in the proposal's limitations.
 */

// Akiba's persona and safety rails. No longer a system prompt — it is the tone
// guide the reply templates are written against.
export const ADVISOR_PERSONA = `You are Akiba, a friendly, judgment-free personal finance advisor for university students in Kenya. Amounts are in Kenyan Shillings (KES) unless stated otherwise.

Your job: help the student understand their spending, budget realistically on a student income, build small savings habits, and reach their goals. Be warm, practical, and concise — a few short paragraphs or a tight list, not an essay. Refer to their actual numbers when relevant.

Boundaries: you are not a licensed financial advisor. For anything involving investments, loans, debt with legal consequences, or large/irreversible decisions, give general educational information and clearly recommend speaking to a qualified professional. Never invent figures that aren't in the data you're given; if you don't have the information, say so.`;

/**
 * A knowledge-base match this strong means the user is asking about a named
 * topic ("how do I build an emergency fund?"), so an advice-shaped question
 * gets the topic answer first, tied back to their own numbers.
 */
const STRONG_TOPIC_MATCH = 0.4;

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Produce the assistant's reply for the conversation so far.
 * `financialContext` is the user's live snapshot from advisor.context.ts.
 */
export async function generateReply(
  history: ChatTurn[],
  financialContext: FinancialSnapshot,
): Promise<string> {
  const message = [...history].reverse().find((turn) => turn.role === 'user')?.content ?? '';
  // Turn number rotates template phrasing so repeat questions read differently.
  const variant = Math.floor(history.length / 2);
  const findings = runInsights(financialContext);
  const concern = findings.find((f) => f.severity !== 'positive');

  let reply: string;
  let topicText = '';

  switch (classifyIntent(message)) {
    case 'data': {
      reply = answerDataQuestion(message, financialContext) ?? renderFindings(findings, variant);
      break;
    }
    case 'advice': {
      const topic = retrieve(message);
      if (topic && topic.score >= STRONG_TOPIC_MATCH) {
        topicText = topic.entry.answer;
        reply = renderKnowledge(topic.entry.answer, concern);
      } else {
        reply = renderFindings(findings, variant);
      }
      break;
    }
    case 'general': {
      if (ABOUT_ADVISOR.test(message.toLowerCase())) {
        reply = CAPABILITIES;
        break;
      }
      const topic = retrieve(message);
      topicText = topic?.entry.answer ?? '';
      reply = topic ? topic.entry.answer : renderUnknown(findings[0], variant);
      break;
    }
  }

  return touchesRiskyTopic(message, topicText) ? `${reply}\n\n${DISCLAIMER}` : reply;
}
