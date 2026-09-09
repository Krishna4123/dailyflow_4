import { FC } from 'react';
import styles from './KanbanColumn.module.css';
import { TaskCard } from './TaskCard';
import type { Task, Status } from '../tasksApi';

interface KanbanColumnProps {
  status: Status;
  label: string;
  tasks: Task[];
  onStatusChange: (id: number, nextStatus: Status) => void;
  onDelete: (id: number) => void;
}

const COLUMN_COLORS: Record<Status, string> = {
  todo: 'var(--primary)',
  in_progress: 'var(--tertiary)',
  done: 'var(--secondary)',
};

/**
 * Kanban pipeline column containing task cards.
 *
 * @param props - Column status, label, and task list
 * @returns Kanban column JSX element
 */
export const KanbanColumn: FC<KanbanColumnProps> = ({
  status,
  label,
  tasks,
  onStatusChange,
  onDelete,
}) => {
  const accentColor = COLUMN_COLORS[status];

  return (
    <div className={styles.column}>
      <div className={styles.colHeader}>
        <div className={styles.colTitleRow}>
          <span className={styles.indicatorSquare} style={{ backgroundColor: accentColor }} />
          <h3 className={styles.colTitle}>{label}</h3>
        </div>
        <span className={styles.colCount}>[{tasks.length}]</span>
      </div>

      <div className={styles.cardList}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <div className={styles.emptyState}>// No Tasks in pipeline</div>
        )}
      </div>
    </div>
  );
};
