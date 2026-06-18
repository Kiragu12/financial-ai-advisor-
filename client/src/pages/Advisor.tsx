import { Brain, Info, Send, Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { EmptyState } from '../components/finance/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function Advisor() {
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.trim() === '') return;
    setSubmitted(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI"
        title="Advisor"
        description="Friendly, judgement-free nudges. Ask about your budget, your goals or last month's spending."
      />

      <Alert variant="info" title="Educational, not regulated financial advice">
        Akiba's advisor offers general guidance to help you reflect on your spending and saving.
        It is not a licensed financial adviser and does not replace one.
      </Alert>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card padded={false} className="flex h-[60vh] min-h-[420px] flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="ic tint-violet h-9 w-9">
                <Brain size={16} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Akiba advisor</p>
                <p className="text-xs text-ink-3">Powered by Paul's backend, not the browser.</p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-5">
            {submitted ? (
              <Alert variant="warn" title="Backend not ready">
                The advisor endpoint goes live once Paul ships{' '}
                <code className="font-mono">POST /api/advisor/messages</code>. Your draft is kept
                in the input below.
              </Alert>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="Start a conversation"
                description="Ask things like &ldquo;Where am I overspending?&rdquo; or &ldquo;How am I tracking towards my laptop goal?&rdquo;"
              />
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-line bg-surface p-3"
          >
            <label htmlFor="advisor-draft" className="sr-only">
              Ask the advisor
            </label>
            <textarea
              id="advisor-draft"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (submitted) setSubmitted(false);
              }}
              placeholder="Ask Akiba something…"
              rows={2}
              className="min-h-[44px] flex-1 resize-none rounded-card-sm border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-3 focus:shadow-ring"
            />
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Send size={14} />}
              disabled={draft.trim() === ''}
            >
              Send
            </Button>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <span className="ic tint-amber h-8 w-8">
                <Sparkles size={14} aria-hidden="true" />
              </span>
              <h2 className="text-sm font-semibold text-ink">Proactive insights</h2>
            </div>
            <EmptyState
              icon={Info}
              title="No insights yet"
              description="As soon as the advisor endpoint exists, Akiba will surface a handful of weekly nudges based on your recent spending and goals."
            />
          </Card>
        </aside>
      </section>
    </div>
  );
}
