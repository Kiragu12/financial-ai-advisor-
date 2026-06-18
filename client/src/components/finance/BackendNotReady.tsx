import { type ReactNode } from 'react';
import { Alert } from '../ui/alert';

interface BackendNotReadyProps {
  endpoint: string;
  children?: ReactNode;
  title?: string;
}

export function BackendNotReady({
  endpoint,
  title = 'Backend not ready',
  children,
}: BackendNotReadyProps) {
  return (
    <Alert variant="info" title={title}>
      This screen will fill in once Paul ships <code className="font-mono">{endpoint}</code>.{' '}
      {children}
    </Alert>
  );
}
