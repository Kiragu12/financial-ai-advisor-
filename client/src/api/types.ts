// Request and response types mirrored from Paul's backend.
// Add a type here only when the matching backend endpoint has been read in source.
// See ./client.ts for the typed fetch wrapper that returns these shapes.

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type HealthResponse = {
  status: 'ok';
  service: 'akiba-api';
  environment: string;
  timestamp: string;
};
