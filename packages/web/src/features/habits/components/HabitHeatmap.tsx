import { FC } from 'react';
import styles from './HabitHeatmap.module.css';
import type { HeatmapEntry } from '../habitsApi';

interface HabitHeatmapProps {
  entries?: HeatmapEntry[];
}

const INTENSITY_COLORS = [
  'var(--surface-container-highest)', // 0: #34343a
  'rgba(78, 222, 163, 0.3)',          // 1: low
  'rgba(78, 222, 163, 0.6)',          // 2: med
  'var(--secondary)',                 // 3: high
  'var(--secondary-fixed)',           // 4: peak
];

/**
 * 52-week activity density matrix heatmap displaying completion streaks.
 *
 * @param props - Activity heatmap entries
 * @returns Habit heatmap JSX element
 */
export const HabitHeatmap: FC<HabitHeatmapProps> = ({ entries = [] }) => {
  const entryMap = new Map<string, number>();
  entries.forEach((e) => entryMap.set(e.date, e.count));

  // Generate 26 weeks (182 days) or up to 52 weeks of cells
  const weeks = 28;
  const daysTotal = weeks * 7;
  const cells: { date: string; level: number }[] = [];

  const today = new Date();
  for (let i = daysTotal - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = entryMap.get(dateStr) ?? 0;
    const level = Math.min(4, count > 0 ? (count >= 3 ? 3 : count >= 2 ? 2 : 1) : 0);
    cells.push({ date: dateStr, level });
  }

  return (
    <div className={styles.heatmapCard}>
      <div className={styles.heatmapHeader}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Matrix Telemetry</h3>
          <span className={styles.rangeBadge}>365 DAYS</span>
        </div>
        <span className={styles.syncText}>UTC-00 SYNCHRONIZED</span>
      </div>

      <div className={styles.gridWrapper}>
        <div className={styles.gridContainer}>
          <div className={styles.dayLabels}>
            <span>M</span>
            <span />
            <span>W</span>
            <span />
            <span>F</span>
            <span />
            <span>S</span>
          </div>

          <div className={styles.matrixGrid}>
            {cells.map((c, i) => (
              <div
                key={i}
                className={styles.cell}
                title={`${c.date}: ${entryMap.get(c.date) ?? 0} completions`}
                style={{ backgroundColor: INTENSITY_COLORS[c.level] }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.legendRow}>
        <span>LESS</span>
        {INTENSITY_COLORS.map((color, idx) => (
          <div key={idx} className={styles.legendBox} style={{ backgroundColor: color }} />
        ))}
        <span>MORE</span>
      </div>
    </div>
  );
};
