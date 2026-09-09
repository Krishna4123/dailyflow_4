import { FC, useState, FormEvent } from 'react';
import styles from './NewReminderModal.module.css';
import type { CreateReminderPayload } from '../remindersApi';

interface NewReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReminderPayload) => Promise<void>;
}

/**
 * Modal form for registering a new timed alert reminder in the system daemon.
 *
 * @param props - Visibility and submission handlers
 * @returns New reminder modal JSX element
 */
export const NewReminderModal: FC<NewReminderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('work');
  const [triggerAt, setTriggerAt] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!label.trim() || !triggerAt) return;
    setSubmitting(true);
    try {
      await onSubmit({
        label: label.trim(),
        category,
        triggerAt,
        recurrence: recurrence || undefined,
      });
      setLabel('');
      setTriggerAt('');
      setRecurrence('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e): void => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>// REGISTER ALERT DAEMON</h3>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Reminder Label *</label>
            <input
              className={styles.input}
              value={label}
              onChange={(e): void => setLabel(e.target.value)}
              placeholder="e.g. Cluster Ingestion Check"
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
                <option value="work">#Work</option>
                <option value="personal">#Personal</option>
                <option value="health">#Health</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Recurrence Rule</label>
              <select
                className={styles.select}
                value={recurrence}
                onChange={(e): void => setRecurrence(e.target.value)}
              >
                <option value="">None (One-shot)</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Trigger Date &amp; Time *</label>
            <input
              className={styles.input}
              type="datetime-local"
              value={triggerAt}
              onChange={(e): void => setTriggerAt(e.target.value)}
              required
            />
          </div>

          <button className={styles.submitBtn} disabled={submitting} type="submit">
            {submitting ? 'Registering...' : 'Arm Reminder Trigger'}
          </button>
        </form>
      </div>
    </div>
  );
};
