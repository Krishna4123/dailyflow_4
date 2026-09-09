import { FC } from 'react';
import styles from './TelemetryVectors.module.css';

interface TelemetryVectorsProps {
  taskRate: number;
  reminderRate: number;
  habitRate: number;
}

/**
 * Renders the 3 modular breakdown cards with segmented progress bars.
 *
 * @param props - Sub-rate metric properties
 * @returns Telemetry vectors JSX element
 */
export const TelemetryVectors: FC<TelemetryVectorsProps> = ({
  taskRate,
  reminderRate,
  habitRate,
}) => {
  const renderSegments = (rate: number, color: string): JSX.Element[] => {
    const totalSegments = 5;
    const filledCount = Math.round(rate * totalSegments);
    return Array.from({ length: totalSegments }).map((_, i) => (
      <div
        key={i}
        className={styles.segment}
        style={{
          backgroundColor: i < filledCount ? color : `${color}33`,
        }}
      />
    ));
  };

  return (
    <section className={styles.vectorsContainer}>
      <div className={styles.vectorsHeader}>
        <span className={styles.vectorsTitle}>// VECTORS &amp; TELEMETRY</span>
        <span className={styles.vectorsCount}>3 STREAM NODES</span>
      </div>

      {/* 1. Task Completion Rate */}
      <div className={styles.vectorCard}>
        <div className={styles.cardTop}>
          <div className={styles.iconAndLabel}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: 'rgba(128, 131, 255, 0.2)', color: 'var(--primary)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                task_alt
              </span>
            </div>
            <div className={styles.labelHeading}>
              <span className={styles.labelCaps}>Task Completion Rate</span>
              <h3 className={styles.headlineSm}>Weight 40%</h3>
            </div>
          </div>
          <div className={styles.statsRight}>
            <span className={styles.telemetryValue} style={{ color: 'var(--primary-fixed)' }}>
              {Math.round(taskRate * 100)}%
            </span>
            <span className={styles.deltaTag} style={{ color: 'var(--secondary)' }}>
              Nominal
            </span>
          </div>
        </div>
        <div className={styles.segmentedBar}>
          {renderSegments(taskRate, 'var(--primary-container)')}
        </div>
      </div>

      {/* 2. Reminder Acknowledgment Rate */}
      <div className={styles.vectorCard}>
        <div className={styles.cardTop}>
          <div className={styles.iconAndLabel}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: 'rgba(202, 129, 0, 0.25)', color: 'var(--tertiary)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                alarm_on
              </span>
            </div>
            <div className={styles.labelHeading}>
              <span className={styles.labelCaps}>Reminder Ack Rate</span>
              <h3 className={styles.headlineSm}>Weight 30%</h3>
            </div>
          </div>
          <div className={styles.statsRight}>
            <span className={styles.telemetryValue} style={{ color: 'var(--tertiary)' }}>
              {Math.round(reminderRate * 100)}%
            </span>
            <span className={styles.deltaTag} style={{ color: 'var(--on-surface-variant)' }}>
              Monitored
            </span>
          </div>
        </div>
        <div className={styles.segmentedBar}>
          {renderSegments(reminderRate, 'var(--tertiary)')}
        </div>
      </div>

      {/* 3. Habit Consistency */}
      <div className={styles.vectorCard}>
        <div className={styles.cardTop}>
          <div className={styles.iconAndLabel}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: 'rgba(78, 222, 163, 0.2)', color: 'var(--secondary)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                local_fire_department
              </span>
            </div>
            <div className={styles.labelHeading}>
              <span className={styles.labelCaps}>Habit Consistency</span>
              <h3 className={styles.headlineSm}>Weight 30%</h3>
            </div>
          </div>
          <div className={styles.statsRight}>
            <span className={styles.telemetryValue} style={{ color: 'var(--secondary)' }}>
              {Math.round(habitRate * 100)}%
            </span>
            <span className={styles.deltaTag} style={{ color: 'var(--secondary)' }}>
              Active Streak
            </span>
          </div>
        </div>
        <div className={styles.segmentedBar}>
          {renderSegments(habitRate, 'var(--secondary)')}
        </div>
      </div>
    </section>
  );
};
