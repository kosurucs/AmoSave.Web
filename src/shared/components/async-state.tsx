import { ReactNode } from 'react';

type Props = {
  isLoading: boolean;
  error: string | null;
  isEmpty?: boolean;
  emptyText?: string;
  children: ReactNode;
};

export function AsyncState({
  isLoading,
  error,
  isEmpty = false,
  emptyText = 'No data found.',
  children,
}: Props) {
  if (isLoading) return <div className="page-card">Loading...</div>;
  if (error) return <div className="page-card error-text">{error}</div>;
  if (isEmpty) return <div className="page-card helper">{emptyText}</div>;
  return <>{children}</>;
}
