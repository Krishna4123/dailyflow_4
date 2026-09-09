import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import styles from './TaskBoard.module.css';
import { KanbanColumn } from './KanbanColumn';
import { NewTaskModal } from './NewTaskModal';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  Task,
  Status,
  Priority,
  Category,
  CreateTaskPayload,
} from '../tasksApi';
import { useAppContext } from '../../../context/AppContext';

/**
 * Tactical Kanban Task Board component with filters, velocity track, and CRUD integration.
 *
 * @returns TaskBoard JSX element
 */
export const TaskBoard: FC = () => {
  const { invalidateScore } = useAppContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTasks = useCallback(async (): Promise<void> => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      // keep existing
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (id: number, nextStatus: Status): Promise<void> => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
    await updateTask(id, { status: nextStatus });
    invalidateScore();
  };

  const handleDelete = async (id: number): Promise<void> => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteTask(id);
    invalidateScore();
  };

  const handleCreate = async (payload: CreateTaskPayload): Promise<void> => {
    const created = await createTask(payload);
    setTasks((prev) => [created, ...prev]);
    invalidateScore();
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return task.title.toLowerCase().includes(q) || (task.description?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [tasks, priorityFilter, categoryFilter, search]);

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const ratePct = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  return (
    <div className={styles.boardContainer}>
      <section className={styles.filterStream}>
        <div className={styles.searchRow}>
          <div className={styles.searchInputWrapper}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--on-surface-variant)' }}>
              terminal
            </span>
            <input
              className={styles.searchInput}
              placeholder="grep --filter task..."
              value={search}
              onChange={(e): void => setSearch(e.target.value)}
            />
          </div>
          <button className={styles.addTaskBtn} onClick={(): void => setIsModalOpen(true)} type="button">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            <span>Task</span>
          </button>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Priority:</span>
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              className={`${styles.chip} ${priorityFilter === p ? styles.activeChip : ''}`}
              onClick={(): void => setPriorityFilter(p)}
              type="button"
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Category:</span>
          {(['all', 'work', 'personal', 'health'] as const).map((c) => (
            <button
              key={c}
              className={`${styles.chip} ${categoryFilter === c ? styles.activeChip : ''}`}
              onClick={(): void => setCategoryFilter(c)}
              type="button"
            >
              #{c.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.velocityBanner}>
        <div className={styles.velocityLeft}>
          <div className={styles.velocityIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>speed</span>
          </div>
          <div>
            <span className={styles.velocityTitle}>Sprint Velocity</span>
            <div className={styles.velocityMetric}>
              {ratePct}% <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>COMPLETION RATE</span>
            </div>
          </div>
        </div>

        <div className={styles.velocitySegments}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={styles.velocitySegment}
              style={{
                backgroundColor: i < Math.round((ratePct / 100) * 8) ? 'var(--secondary)' : 'var(--surface-container-highest)',
              }}
            />
          ))}
        </div>
      </section>

      <div className={styles.columnsGrid}>
        <KanbanColumn
          status="todo"
          label="QUEUED PIPELINE"
          tasks={filteredTasks.filter((t) => t.status === 'todo')}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
        <KanbanColumn
          status="in_progress"
          label="IN FLIGHT"
          tasks={filteredTasks.filter((t) => t.status === 'in_progress')}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
        <KanbanColumn
          status="done"
          label="EXECUTED"
          tasks={filteredTasks.filter((t) => t.status === 'done')}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={(): void => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};
