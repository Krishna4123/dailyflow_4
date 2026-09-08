/**
 * @file ExportButton.tsx
 * Data Export feature component — stub.
 * Full implementation is TASK-15 in the spec.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

/**
 * Triggers a browser download of the full DailyFlow data export.
 * Navigates to GET /api/v1/export, which responds with
 * Content-Disposition: attachment so the browser saves the file.
 *
 * @returns An accessible export button
 */
export function ExportButton(): JSX.Element {
  /**
   * Opens the export URL in the current tab, triggering the browser's
   * file-save dialog via the Content-Disposition: attachment header.
   *
   * @returns void
   */
  function handleExport(): void {
    window.location.href = `${API_BASE}/api/v1/export`;
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      aria-label="Export all data to JSON"
    >
      ⬇ Export Data
    </button>
  );
}
