import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import styles from './ReminderList.module.css';
import { ReminderCard } from './ReminderCard';
import { NewReminderModal } from './NewReminderModal';
import {
  fetchReminders,
  createReminder,
  acknowledgeReminder,
  deleteReminder,
  Reminder,
  CreateReminderPayload,
} from '../remindersApi';
import { useAppContext } from '../../../context/AppContext';

type ReminderTab = 'upcoming' | 'recurring' | 'resolved';

/**
 * Reminder engine view listing alerts by urgency with 1-click acknowledgement and filter tabs.
 *
 * @returns ReminderList JSX element
 */
export const ReminderList: FC = () => {
  const { invalidateScore } = useAppContext();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<ReminderTab>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadReminders = useCallback(async (): Promise<void> => {
    try {
      const data = await fetchReminders();
      setReminders(data);
    } catch {
      // keep existing
    }
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const handleAcknowledge = async (id: number): Promise<void> => {
    const updated = await acknowledgeReminder(id);
    setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    invalidateScore();
  };

  const handleDelete = async (id: number): Promise<void> => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    await deleteReminder(id);
    invalidateScore();
  };

  const handleCreate = async (payload: CreateReminderPayload): Promise<void> => {
    const created = await createReminder(payload);
    setReminders((prev) => [created, ...prev]);
    invalidateScore();
  };

  const resolvedCount = reminders.filter((r) => !!r.acknowledgedAt).length;
  const totalCount = reminders.length;
  const ackRate = totalCount === 0 ? 100 : Math.round((resolvedCount / totalCount) * 100);

  const filteredReminders = useMemo(() => {
    return reminders.filter((r) => {
      if (activeTab === 'resolved') return !!r.acknowledgedAt;
      if (activeTab === 'recurring') return !!r.recurrence;
      return !r.acknowledgedAt;
    });
  }, [reminders, activeTab]);

  return (
    <div className={styles.container}>
      <section className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <div className={styles.statusTag}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              radar
            </span>
            <span>SYS.STATUS // ACK_DAEMON</span>
          </div>
          <span className={styles.cycleInfo}>CYCLE 24H</span>
        </div>

        <div className={styles.rateRow}>
          <div>
            <h2 className={styles.rateHeadline}>ACK Rate: {ackRate}%</h2>
            <p className={styles.rateSub}>
              {resolvedCount} resolved / {totalCount} scheduled alerts
            </p>
          </div>
          <div className={styles.rateFraction}>
            {resolvedCount}
            <span style={{ opacity: 0.4 }}>/</span>
            {totalCount}
          </div>
        </div>

        <div className={styles.segmentedBar}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={styles.barSegment}
              style={{
                backgroundColor:
                  i < Math.round((ackRate / 100) * 10)
                    ? 'var(--secondary)'
                    : 'var(--surface-container-high)',
              }}
            />
          ))}
        </div>
      </section>

      <div className={styles.controlsRow}>
        <div className={styles.tabsGroup}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'upcoming' ? styles.activeTabBtn : ''}`}
            onClick={(): void => setActiveTab('upcoming')}
            type="button"
          >
            Upcoming [{reminders.filter((r) => !r.acknowledgedAt).length}]
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'recurring' ? styles.activeTabBtn : ''}`}
            onClick={(): void => setActiveTab('recurring')}
            type="button"
          >
            Recurring [{reminders.filter((r) => !!r.recurrence).length}]
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'resolved' ? styles.activeTabBtn : ''}`}
            onClick={(): void => setActiveTab('resolved')}
            type="button"
          >
            Resolved [{resolvedCount}]
          </button>
        </div>

        <button
          className={styles.addBtn}
          onClick={(): void => setIsModalOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            add
          </span>
          <span>Alert</span>
        </button>
      </div>

      <section className={styles.stream}>
        {filteredReminders.map((reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            onAcknowledge={handleAcknowledge}
            onDelete={handleDelete}
          />
        ))}

        {filteredReminders.length === 0 && (
          <div className={styles.emptyStream}>// No alerts registered in stream</div>
        )}
      </section>

      <NewReminderModal
        isOpen={isModalOpen}
        onClose={(): void => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};
