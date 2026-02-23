import React from 'react';
import { getApiBaseUrl, getApiKey, getDefaultApiBaseUrl, getStoredApiBaseUrl, setStoredApiKey } from '@/services/http/axios-client';

type ConnectionResult = 'idle' | 'checking' | 'connected' | 'failed';

type FailureDetails = {
  checkedUrl: string;
  type: 'network' | 'http' | 'payload' | 'input';
  statusCode?: number;
  statusText?: string;
  responseBody?: string;
  message: string;
  checkedAt: string;
};

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function toPrettyBody(raw: string): string {
  if (!raw) {
    return '';
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}

function buildLocalCandidates(): string[] {
  const defaultUrl = normalizeBaseUrl(getDefaultApiBaseUrl());
  const currentUrl = normalizeBaseUrl(getApiBaseUrl());
  const storedUrl = normalizeBaseUrl(getStoredApiBaseUrl() ?? '');
  const localhost5208 = 'http://localhost:5208/api/v1';
  const localhost5000 = 'http://localhost:5000/api/v1';

  return Array.from(new Set([currentUrl, storedUrl, defaultUrl, localhost5208, localhost5000].filter(Boolean)));
}

export function ConnectionCheckPage() {
  const [candidates] = React.useState<string[]>(() => buildLocalCandidates());
  const [baseUrl, setBaseUrl] = React.useState<string>(() => normalizeBaseUrl(getApiBaseUrl()));
  const [apiKey, setApiKey] = React.useState<string>(() => getApiKey());
  const [result, setResult] = React.useState<ConnectionResult>('idle');
  const [statusMessage, setStatusMessage] = React.useState<string>('No connection check performed yet.');
  const [connectedUrl, setConnectedUrl] = React.useState<string>('');
  const [healthResponse, setHealthResponse] = React.useState<string>('');
  const [failureDetails, setFailureDetails] = React.useState<FailureDetails | null>(null);

  const handleCandidateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setBaseUrl(normalizeBaseUrl(event.target.value));
  };

  const handleConnectionCheck = async () => {
    const normalized = normalizeBaseUrl(baseUrl);
    const normalizedApiKey = apiKey.trim();
    const checkedAt = new Date().toISOString();

    setBaseUrl(normalized);
    setStoredApiKey(normalizedApiKey || null);
    setConnectedUrl('');
    setHealthResponse('');
    setFailureDetails(null);

    if (!normalized) {
      setResult('failed');
      setStatusMessage('Not Connected');
      setFailureDetails({
        checkedUrl: normalized,
        type: 'input',
        message: 'Base URL is required.',
        checkedAt,
      });
      return;
    }

    setResult('checking');
    setStatusMessage('Checking connection...');

    let healthUrl = '';
    try {
      healthUrl = new URL('Health', ensureTrailingSlash(normalized)).toString();
    } catch {
      setResult('failed');
      setStatusMessage('Not Connected');
      setFailureDetails({
        checkedUrl: normalized,
        type: 'input',
        message: 'Invalid base URL format.',
        checkedAt,
      });
      return;
    }

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: normalizedApiKey ? { 'x-api-key': normalizedApiKey } : undefined,
      });
      const rawBody = await response.text();
      const prettyBody = toPrettyBody(rawBody);

      if (!response.ok) {
        setResult('failed');
        setStatusMessage('Not Connected');
        setFailureDetails({
          checkedUrl: healthUrl,
          type: 'http',
          statusCode: response.status,
          statusText: response.statusText,
          responseBody: prettyBody,
          message: `Health API returned ${response.status}.`,
          checkedAt,
        });
        return;
      }

      let parsed: { success?: boolean; data?: unknown } | null = null;
      try {
        parsed = rawBody ? (JSON.parse(rawBody) as { success?: boolean; data?: unknown }) : null;
      } catch {
        parsed = null;
      }

      if (!parsed || parsed.success === false || !parsed.data) {
        setResult('failed');
        setStatusMessage('Not Connected');
        setFailureDetails({
          checkedUrl: healthUrl,
          type: 'payload',
          responseBody: prettyBody,
          message: 'Health API response payload is invalid or missing data.',
          checkedAt,
        });
        return;
      }

      setResult('connected');
      setStatusMessage('Connected');
      setConnectedUrl(normalized);
      setHealthResponse(prettyBody);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reach server.';
      setResult('failed');
      setStatusMessage('Not Connected');
      setFailureDetails({
        checkedUrl: healthUrl || normalized,
        type: 'network',
        message,
        checkedAt,
      });
    }
  };

  const statusToneClass = result === 'failed' ? 'error-text' : 'helper';

  return (
    <section className="page-card">
      <h2 className="section-title">Connection Check</h2>
      <p className="helper">Select an API base URL and validate connectivity using the Health endpoint.</p>

      <div className="form-grid" style={{ marginTop: '16px' }}>
        <label className="helper" htmlFor="connectionBaseUrlList">
          Available localhost URLs
        </label>
        <select id="connectionBaseUrlList" className="select" value={baseUrl} onChange={handleCandidateChange}>
          {candidates.map((candidate) => (
            <option key={candidate} value={candidate}>
              {candidate}
            </option>
          ))}
        </select>

        <label className="helper" htmlFor="healthApiKey">
          API Key
        </label>
        <input
          id="healthApiKey"
          className="input"
          type="text"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="Enter API key"
        />

        <button className="btn btn-primary" type="button" onClick={handleConnectionCheck} disabled={result === 'checking'}>
          {result === 'checking' ? 'Checking Connection...' : 'Check Connection'}
        </button>

        <p className={statusToneClass}>Connection Status: {statusMessage}</p>

        {connectedUrl ? (
          <>
            <h3 className="section-title">Connection Details</h3>
            <p className="helper">This URL is connected: {connectedUrl}</p>
          </>
        ) : null}

        {healthResponse ? (
          <>
            <h3 className="section-title">Health API Response</h3>
            <pre className="json-view" style={{ margin: 0 }}>
              <code>{healthResponse}</code>
            </pre>
          </>
        ) : null}

        {failureDetails ? (
          <>
            <h3 className="section-title">Failure Details</h3>
            <div className="helper">
              <div>Checked URL: {failureDetails.checkedUrl || '(empty)'}</div>
              <div>Failure Type: {failureDetails.type}</div>
              {typeof failureDetails.statusCode === 'number' ? <div>Status Code: {failureDetails.statusCode}</div> : null}
              {failureDetails.statusText ? <div>Status Text: {failureDetails.statusText}</div> : null}
              <div>Message: {failureDetails.message}</div>
              <div>Checked At: {failureDetails.checkedAt}</div>
            </div>
            {failureDetails.responseBody ? (
              <pre className="json-view" style={{ margin: 0 }}>
                <code>{failureDetails.responseBody}</code>
              </pre>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
