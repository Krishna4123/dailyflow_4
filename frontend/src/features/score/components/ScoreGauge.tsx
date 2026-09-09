import { FC } from 'react';
import styles from './ScoreGauge.module.css';

interface ScoreGaugeProps {
  score: number;
  taskRate: number;
  reminderRate: number;
  habitRate: number;
}

/**
 * Animated SVG circular gauge and algorithm breakdown kernel.
 *
 * @param props - Score and rate metrics
 * @returns Score gauge JSX element
 */
export const ScoreGauge: FC<ScoreGaugeProps> = ({
  score,
  taskRate,
  reminderRate,
  habitRate,
}) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference * (1 - clampedScore / 100);

  const tPct = Math.round(taskRate * 100);
  const rPct = Math.round(reminderRate * 100);
  const hPct = Math.round(habitRate * 100);

  return (
    <section className={styles.gaugeCard}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>// COMPOSITE FLOW SCORE</span>
        <span className={styles.cardTag}>STATUS: {score >= 70 ? 'OPTIMAL' : 'CALIBRATING'}</span>
      </div>

      <div className={styles.gaugeBody}>
        <div className={styles.circleWrapper}>
          <svg className={styles.svgCircle} viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#34343a"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--primary-container)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </svg>
          <div className={styles.circleCenter}>
            <span className={styles.scoreNumber}>{Math.round(score)}</span>
            <span className={styles.scoreUnit}>/ 100 PTS</span>
          </div>
        </div>

        <div className={styles.gaugeDetails}>
          <div>
            <div className={styles.zoneBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                bolt
              </span>
              <span>{score >= 70 ? 'Optimal Flow Zone' : 'Nominal Baseline'}</span>
            </div>
            <p className={styles.zoneDesc}>
              {score >= 70
                ? 'Execution velocity is running efficiently across all streams.'
                : 'Complete queued tasks, reminders, and habits to escalate score.'}
            </p>
          </div>

          <div className={styles.kernelBox}>
            <span className={styles.kernelLabel}>// ALGORITHM KERNEL</span>
            <p className={styles.kernelFormula}>
              Score = (0.4 × T<sub>{tPct}%</sub> + 0.3 × R<sub>{rPct}%</sub> + 0.3 × H<sub>{hPct}%</sub>) × 100
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
