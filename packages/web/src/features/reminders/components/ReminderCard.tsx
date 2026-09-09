import { FC } from 'react';
import styles from './ReminderCard.module.css';
import type { Reminder } from '../remindersApi';

interface ReminderCardProps {
  reminder: Reminder;
  onAcknowledge: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Tactical reminder card with urgency indicator and acknowledge actuator.
 *
 * @param props - Reminder object and action callbacks
 * @returns Reminder card JSX element
 */
export const ReminderCard: FC<ReminderCardProps> = ({
  reminder,
  onAcknowledge,
  onDelete,
}) => {
  const isResolved = !!reminder.acknowledgedAt;
  const isCritical = !isResolved && reminder.category.toLowerCase().includes('work');
  const stripColor = isResolved
    ? 'var(--secondary)'
    : isCritical
    ? 'var(--tertiary)'
    : 'var(--primary)';

  return (
    <div className={`${styles.card} ${isCritical ? styles.criticalGlow : ''}`}>
      <div className={styles.accentStrip} style={{ backgroundColor: stripColor }} />

      <div className={styles.metaRow}>
        <div className={styles.tags}>
          {isCritical && (
            <span className={styles.criticalTag}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                warning
              </span>
              CRITICAL_T0
            </span>
          )}
          <span className={styles.categoryTag}>{reminder.category}</span>
        </div>

        {!isResolved && (
          <span className={styles.dueTimer}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
              hourglass_top
            </span>
            UPCOMING
          </span>
        )}
      </div>

      <div className={styles.bodyRow}>
        <h3 className={`${styles.title} ${isResolved ? styles.resolvedTitle : ''}`}>
          {reminder.label}
        </h3>
        <div className={styles.specRow}>
          <span>
            triggerAt: <strong style={{ color: 'var(--on-surface)' }}>{reminder.triggerAt.replace('T', ' ')}</strong>
          </span>
          {reminder.recurrence && (
            <>
              <span>//</span>
              <span className={styles.recurrenceBadge}>{reminder.recurrence}</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.actionRow}>
        {isResolved ? (
          <div className={styles.resolvedBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              done_all
            </span>
            <span>Resolved {reminder.acknowledgedAt?.slice(0, 10)}</span>
          </div>
        ) : (
          <button
            className={styles.ackBtn}
            onClick={(): void => onAcknowledge(reminder.id)}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              verified
            </span>
            <span>Acknowledge</span>
          </button>
        )}

        <button
          className={styles.deleteBtn}
          onClick={(): void => onDelete(reminder.id)}
          title="Delete reminder"
          aria-label="Delete reminder"
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            delete
          </span>
        </button>
      </div>
    </div>
  );
};
