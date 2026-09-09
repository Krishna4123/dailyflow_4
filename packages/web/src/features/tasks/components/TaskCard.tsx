import { FC } from 'react';
import styles from './TaskCard.module.css';
import type { Task, Status } from '../tasksApi';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: number, nextStatus: Status) => void;
  onDelete: (id: number) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'var(--error)',
  medium: 'var(--tertiary)',
  low: 'var(--outline)',
};

/**
 * Single kanban task card with status indicator strip, priority badge, and quick movement.
 *
 * @param props - Task and callback handlers
 * @returns Task card JSX element
 */
export const TaskCard: FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onDelete,
}) => {
  const isDone = task.status === 'done';
  const stripColor = PRIORITY_COLORS[task.priority] ?? 'var(--outline)';

  const handleToggleComplete = (): void => {
    onStatusChange(task.id, isDone ? 'todo' : 'done');
  };

  return (
    <div className={styles.card}>
      <div className={styles.statusStrip} style={{ backgroundColor: stripColor }} />

      <div className={styles.topRow}>
        <div className={styles.badgeRow}>
          <span
            className={styles.priorityBadge}
            style={{
              backgroundColor: `${stripColor}26`,
              color: stripColor,
            }}
          >
            {task.priority}
          </span>
          <span className={styles.categoryBadge}>{task.category}</span>
        </div>
        <button
          className={styles.deleteBtn}
          onClick={(): void => onDelete(task.id)}
          title="Delete task"
          aria-label="Delete task"
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            close
          </span>
        </button>
      </div>

      <div className={styles.bodyRow}>
        <button
          className={styles.taskCheckbox}
          onClick={handleToggleComplete}
          aria-label={isDone ? 'Mark uncompleted' : 'Mark completed'}
          type="button"
        >
          {isDone && (
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              check
            </span>
          )}
        </button>
        <div className={styles.content}>
          <h4 className={`${styles.title} ${isDone ? styles.doneTitle : ''}`}>
            {task.title}
          </h4>
          {task.description && <p className={styles.desc}>{task.description}</p>}
        </div>
      </div>

      <div className={styles.bottomRow}>
        {task.dueDate ? (
          <div className={styles.dueDateTag}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
              event
            </span>
            <span>{task.dueDate}</span>
          </div>
        ) : (
          <div />
        )}

        <div className={styles.actionBtns}>
          {task.status !== 'todo' && (
            <button
              className={styles.moveBtn}
              onClick={(): void =>
                onStatusChange(task.id, task.status === 'done' ? 'in_progress' : 'todo')
              }
              type="button"
            >
              ← Back
            </button>
          )}
          {task.status !== 'done' && (
            <button
              className={styles.moveBtn}
              onClick={(): void =>
                onStatusChange(task.id, task.status === 'todo' ? 'in_progress' : 'done')
              }
              type="button"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
