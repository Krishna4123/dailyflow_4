import { FC, useState, FormEvent } from 'react';
import styles from './NewHabitModal.module.css';
import type { CreateHabitPayload } from '../habitsApi';

interface NewHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateHabitPayload) => Promise<void>;
}

/**
 * Modal form for registering a new recurring habit routine.
 *
 * @param props - Visibility and submission handlers
 * @returns New habit modal JSX element
 */
export const NewHabitModal: FC<NewHabitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('health');
  const [frequency, setFrequency] = useState('daily');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        category,
        frequency,
      });
      setName('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e): void => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>// INITIALIZE HABIT ROUTINE</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Habit Name *</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e): void => setName(e.target.value)}
              placeholder="e.g. Deep Work Sprint 90m"
              required
              autoFocus
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.select}
                value={category}
                onChange={(e): void => setCategory(e.target.value)}
              >
                <option value="health">#Health</option>
                <option value="work">#Work</option>
                <option value="personal">#Personal</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Cadence</label>
              <select
                className={styles.select}
                value={frequency}
                onChange={(e): void => setFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <button className={styles.submitBtn} disabled={submitting} type="submit">
            {submitting ? 'Initializing...' : 'Commit Habit Routine'}
          </button>
        </form>
      </div>
    </div>
  );
};
