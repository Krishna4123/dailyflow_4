/**
 * @file ScoreWidget.tsx
 * Productivity Score feature component — stub.
 * Full implementation is TASK-13 in the spec.
 */

/**
 * Displays the overall Productivity Score (0–100) and a breakdown of the
 * three contributing rates. Polls GET /api/v1/score every 30 seconds and
 * re-fetches after any task, reminder, or habit mutation via AppContext.
 *
 * @returns The score widget UI
 */
export function ScoreWidget(): JSX.Element {
  return (
    <div>
      <h2>📊 Productivity Score</h2>
      <p>Coming soon — implement in TASK-13.</p>
    </div>
  );
}
