/**
 * @file ExportButton.tsx
 * Data Export feature component.
 * Calls POST /api/v1/export, which writes a JSON snapshot to ./exports/
 * via the MCP filesystem tool, then shows the file path in a success banner.
 */

import { useState } from 'react';
import styles from './ExportButton.module.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

/** Shape of the data field returned by POST /api/v1/export. */
interface ExportFileResult {
  filePath: string;
  exportedAt: string;
}

/** Standard API envelope. */
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

type ExportState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Renders an "Export Data" button and, after a successful export, a banner
 * showing the path of the written file.
 *
 * @returns An accessible export button with inline status feedback
 */
export function ExportButton(): JSX.Element {
  const [state, setState] = useState<ExportState>('idle');
  const [filePath, setFilePath] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  /**
   * Calls POST /api/v1/export and updates local state based on the result.
   *
   * @returns Promise<void>
   */
  async function handleExport(): Promise<void> {
    setState('loading');
    setFilePath('');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const body: ApiResponse<ExportFileResult> = await res.json() as ApiResponse<ExportFileResult>;

      if (!res.ok || body.error || !body.data) {
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      setFilePath(body.data.filePath);
      setState('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setErrorMsg(msg);
      setState('error');
    }
  }

  /**
   * Dismisses the success or error banner and resets to idle state.
   *
   * @returns void
   */
  function handleDismiss(): void {
    setState('idle');
    setFilePath('');
    setErrorMsg('');
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.btn}
        onClick={handleExport}
        disabled={state === 'loading'}
        aria-label="Export all data to JSON"
        aria-busy={state === 'loading'}
      >
        {state === 'loading' ? '⏳ Exporting…' : '⬇ Export Data'}
      </button>

      {state === 'success' && (
        <div
          role="status"
          aria-live="polite"
          className={styles.bannerSuccess}
        >
          <span>✅ Exported to <code>{filePath}</code></span>
          <button
            type="button"
            className={styles.dismiss}
            onClick={handleDismiss}
            aria-label="Dismiss export success message"
          >
            ✕
          </button>
        </div>
      )}

      {state === 'error' && (
        <div
          role="alert"
          aria-live="assertive"
          className={styles.bannerError}
        >
          <span>❌ {errorMsg}</span>
          <button
            type="button"
            className={styles.dismiss}
            onClick={handleDismiss}
            aria-label="Dismiss export error message"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
