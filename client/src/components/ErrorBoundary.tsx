import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert } from './ui/alert';
import { Button } from './ui/button';

/**
 * Catches render errors below it and shows a friendly fallback instead of a
 * blank white screen. Wrapped at the App root so a bug in any one page can't
 * tank the whole shell — the user can reload without losing the shell chrome.
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the failure during development; in production a real telemetry
    // sink (Sentry/Datadog) would replace this.
    if (import.meta.env.DEV) {
      console.error('Render error caught by ErrorBoundary', error, info);
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <main className="grid min-h-screen place-items-center bg-bg px-6">
        <div className="w-full max-w-md space-y-4">
          <Alert variant="error" title="Something went wrong">
            {error.message || 'An unexpected error stopped this page from rendering.'}
          </Alert>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reload Akiba
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
