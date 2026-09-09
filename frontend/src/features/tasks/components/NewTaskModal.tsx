import { FC, useState, FormEvent } from 'react';
import styles from './NewTaskModal.module.css';
import type { CreateTaskPayload, Priority, Category } from '../tasksApi';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
}

/**
 * Modal form dialog for inserting a new task into the telemetry pipeline.
 *
 * @param props - Visibility and submission handlers
 * @returns New task modal JSX element
 */
export const NewTaskModal: FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('work');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate: dueDate || undefined,
      });
      setTitle('');
      setDescription('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e): void => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>// INSERT PIPELINE TASK</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Task Title *</label>
            <input
              className={styles.input}
              value={title}
              onChange={(e): void => setTitle(e.target.value)}
              placeholder="e.g. Audit Cryptographic Hashes"
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description (Optional)</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e): void => setDescription(e.target.value)}
              placeholder="Technical context and acceptance parameters..."
              rows={2}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Priority Level</label>
              <select
                className={styles.select}
                value={priority}
                onChange={(e): void => setPriority(e.target.value as Priority)}
              >
                <option value="high">High (P0)</option>
                <option value="medium">Medium (P1)</option>
                <option value="low">Low (P2)</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.select}
                value={category}
                onChange={(e): void => setCategory(e.target.value as Category)}
              >
                <option value="work">#Work</option>
                <option value="personal">#Personal</option>
                <option value="health">#Health</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Due Date</label>
            <input
              className={styles.input}
              type="date"
              value={dueDate}
              onChange={(e): void => setDueDate(e.target.value)}
            />
          </div>

          <button className={styles.submitBtn} disabled={submitting} type="submit">
            {submitting ? 'Dispatching...' : 'Deploy to Pipeline'}
          </button>
        </form>
      </div>
    </div>
  );
};
