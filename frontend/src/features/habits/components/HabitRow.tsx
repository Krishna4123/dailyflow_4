import { FC } from 'react';
import styles from './HabitRow.module.css';
import type { Habit } from '../habitsApi';

interface HabitRowProps {
  habit: Habit;
  onLog: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Habit item row with streak counter and daily log checkbox.
 *
 * @param props - Habit data and callbacks
 * @returns Habit row JSX element
 */
export const HabitRow: FC<HabitRowProps> = ({ habit, onLog, onDelete }) => {
  const isDone = !!habit.completedToday;

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <button
          className={`${styles.checkbox} ${isDone ? styles.checkedBox : ''}`}
          onClick={(): void => onLog(habit.id)}
          aria-label={isDone ? 'Habit completed today' : 'Mark habit completed'}
          type="button"
        >
          {isDone && (
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
              check
            </span>
          )}
        </button>

        <div className={styles.info}>
          <div className={styles.tagRow}>
            <span className={styles.categoryTag}>{habit.category}</span>
            <span className={`${styles.name} ${isDone ? styles.completedName : ''}`}>
              {habit.name}
            </span>
          </div>
          <span className={styles.subMeta}>
            Frequency: {habit.frequency} • {isDone ? 'Logged today' : 'Pending verification'}
          </span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.streakBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
            whatshot
          </span>
          <span>{habit.streak ?? 0}D STREAK</span>
        </div>

        <button
          className={styles.deleteBtn}
          onClick={(): void => onDelete(habit.id)}
          title="Delete habit"
          aria-label="Delete habit"
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            close
          </span>
        </button>
      </div>
    </div>
  );
};
