import { Brain, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  useConversation,
  useConversations,
  useCreateConversation,
  useSendMessage,
} from '../api/hooks/use-advisor';
import { EmptyState } from '../components/finance/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Spinner } from '../components/ui/spinner';
import { cn } from '../lib/cn';

export function Advisor() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversations = useConversations();
  const conversation = useConversation(selectedId);
  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

  // Auto-select the most recent conversation once the list loads.
  useEffect(() => {
    const first = conversations.data?.[0];
    if (selectedId === null && first) {
      setSelectedId(first.id);
    }
  }, [selectedId, conversations.data]);

  // Keep the latest message in view.
  const messageCount = conversation.data?.messages.length ?? 0;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messageCount, sendMessage.isPending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (content === '' || sendMessage.isPending) return;
    setError(null);
    setDraft('');
    try {
      let id = selectedId;
      if (!id && conversations.data?.[0]) {
        id = conversations.data[0].id;
        setSelectedId(id);
      }
      if (!id) {
        const { conversation: created } = await createConversation.mutateAsync({});
        id = created.id;
        setSelectedId(id);
      }
      await sendMessage.mutateAsync({ conversationId: id, content });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message.');
      setDraft(content); // restore so the user doesn't lose what they typed
    }
  }

  const messages = conversation.data?.messages ?? [];
  const showThread = selectedId !== null && messages.length > 0;

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

      <Card padded={false} className="flex h-[62vh] min-h-[440px] flex-col">
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="ic tint-violet h-9 w-9">
            <Brain size={16} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Akiba advisor</p>
            <p className="text-xs text-ink-3">Grounded in your real wallets, transactions and goals.</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {conversation.isLoading && selectedId ? (
            <div className="grid place-items-center py-10">
              <Spinner size={22} label="Loading conversation" />
            </div>
          ) : showThread ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] whitespace-pre-wrap rounded-card-sm px-4 py-2.5 text-sm leading-6',
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'border border-line bg-surface text-ink',
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Start a conversation"
              description="Ask things like “Where am I overspending?” or “How am I tracking towards my laptop goal?”"
            />
          )}

          {sendMessage.isPending ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-card-sm border border-line bg-surface px-4 py-2.5 text-sm text-ink-3">
                <Spinner size={14} label="Akiba is thinking" /> Akiba is thinking…
              </div>
            </div>
          ) : null}

          {error ? (
            <Alert variant="error" title="Message failed">
              {error}
            </Alert>
          ) : null}
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
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask Akiba something…"
            rows={2}
            className="min-h-[44px] flex-1 resize-none rounded-card-sm border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-3 focus:shadow-ring"
          />
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Send size={14} />}
            loading={sendMessage.isPending || createConversation.isPending}
            disabled={draft.trim() === '' || conversations.isLoading}
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
