import { Quote as QuoteIcon } from 'lucide-react';
import { quoteOfTheDay } from '../../lib/quotes';
import { Card } from '../ui/card';

/**
 * A daily money/saving quote. The quote is chosen by the calendar day, so it
 * stays the same all day and rotates to a new one tomorrow.
 */
export function MoneyQuote() {
  const quote = quoteOfTheDay();
  return (
    <Card className="flex items-start gap-4">
      <span className="ic tint-violet h-10 w-10 shrink-0">
        <QuoteIcon size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm italic leading-6 text-ink">&ldquo;{quote.text}&rdquo;</p>
        <p className="mt-1 text-xs font-medium text-ink-3">— {quote.author}</p>
      </div>
    </Card>
  );
}
