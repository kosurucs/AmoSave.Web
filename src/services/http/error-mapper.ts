export function mapHttpError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const asRecord = error as Record<string, unknown>;
    const message = asRecord.message;
    if (typeof message === 'string') return message;
  }

  return 'Request failed. Please try again.';
}
