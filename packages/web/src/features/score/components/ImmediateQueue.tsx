import { FC } from 'react';
import styles from './ImmediateQueue.module.css';
import type { Task } from '../../tasks/tasksApi';
import type { Reminder } from '../../reminders/remindersApi';
import type { Habit } from '../../habits/habitsApi';

interface ImmediateQueueProps {
  highTask?: Task;
  nextReminder?: Reminder;
  pendingHabit?: Habit;
  onCompleteTask: (id: number) => void;
  onAckReminder: (id: number) => void;
  onLogHabit: (id: number) => void;
}

/**
 * Renders the high-priority immediate queue items with single-click operational actuators.
 *
 * @param props - Pending items and action handlers
 * @returns Immediate queue JSX element
 */
export const ImmediateQueue: FC<ImmediateQueueProps> = ({
  highTask,
  nextReminder,
  pendingHabit,
  onCompleteTask,
  onAckReminder,
  onLogHabit,
}) => {
  const pendingCount = (highTask ? 1 : 0) + (nextReminder ? 1 : 0) + (pendingHabit ? 1 : 0);

  return (
    <section className={styles.queueSection}>
      <div className={styles.queueHeader}>
        <span className={styles.queueTitle}>// IMMEDIATE QUEUE</span>
        <span className={styles.queueBadge}>{pendingCount} PENDING</span>
      </div>

      {/* Task Queue Item */}
      {highTask && (
        <div className={styles.queueItem}>
          <div className={styles.itemLeft}>
            <div
              className={styles.iconSquare}
              style={{ backgroundColor: 'rgba(255, 180, 171, 0.2)', color: 'var(--error)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                priority_high
              </span>
            </div>
            <div className={styles.itemContent}>
              <div className={styles.tagRow}>
                <span
                  className={styles.typeTag}
                  style={{ backgroundColor: 'rgba(255, 180, 171, 0.15)', color: 'var(--error)' }}
                >
                  P0 TASK
                </span>
                <span className={styles.itemTitle}>{highTask.title}</span>
              </div>
              <span className={styles.itemSubtitle}>
                {highTask.category.toUpperCase()} • {highTask.dueDate ? `Due ${highTask.dueDate}` : 'Active'}
              </span>
            </div>
          </div>
          <button
            className={styles.actionBtn}
            style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}
            onClick={(): void => onCompleteTask(highTask.id)}
            type="button"
          >
            Done
          </button>
        </div>
      )}

      {/* Reminder Queue Item */}
      {nextReminder && (
        <div className={styles.queueItem}>
          <div className={styles.itemLeft}>
            <div
              className={styles.iconSquare}
              style={{ backgroundColor: 'rgba(255, 185, 95, 0.2)', color: 'var(--tertiary)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                schedule
              </span>
            </div>
            <div className={styles.itemContent}>
              <div className={styles.tagRow}>
                <span
                  className={styles.typeTag}
                  style={{ backgroundColor: 'rgba(255, 185, 95, 0.15)', color: 'var(--tertiary)' }}
                >
                  ALERT
                </span>
                <span className={styles.itemTitle}>{nextReminder.label}</span>
              </div>
              <span className={styles.itemSubtitle}>
                Trigger: {nextReminder.triggerAt.replace('T', ' ')}
              </span>
            </div>
          </div>
          <button
            className={styles.actionBtn}
            style={{ backgroundColor: 'var(--tertiary)', color: 'var(--on-tertiary)' }}
            onClick={(): void => onAckReminder(nextReminder.id)}
            type="button"
          >
            Ack
          </button>
        </div>
      )}

      {/* Habit Queue Item */}
      {pendingHabit && (
        <div className={styles.queueItem}>
          <div className={styles.itemLeft}>
            <div
              className={styles.iconSquare}
              style={{ backgroundColor: 'rgba(78, 222, 163, 0.2)', color: 'var(--secondary)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                local_fire_department
              </span>
            </div>
            <div className={styles.itemContent}>
              <div className={styles.tagRow}>
                <span
                  className={styles.typeTag}
                  style={{ backgroundColor: 'rgba(78, 222, 163, 0.15)', color: 'var(--secondary)' }}
                >
                  HABIT
                </span>
                <span className={styles.itemTitle}>{pendingHabit.name}</span>
              </div>
              <span className={styles.itemSubtitle}>
                Current streak: {pendingHabit.streak ?? 0} days
              </span>
            </div>
          </div>
          <button
            className={styles.actionBtn}
            style={{ backgroundColor: 'var(--secondary)', color: 'var(--on-secondary)' }}
            onClick={(): void => onLogHabit(pendingHabit.id)}
            type="button"
          >
            Log +1
          </button>
        </div>
      )}
    </section>
  );
};
