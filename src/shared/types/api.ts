export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
  correlationId?: string;
};

export type Dictionary = Record<string, unknown>;
