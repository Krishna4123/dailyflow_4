import { FC, useEffect, useState, useCallback } from 'react';
import styles from './ScoreWidget.module.css';
import { fetchScore, ProductivityScore } from '../scoreApi';
import { fetchTasks, updateTask, Task } from '../../tasks/tasksApi';
import { fetchReminders, acknowledgeReminder, Reminder } from '../../reminders/remindersApi';
import { fetchHabits, logHabit, Habit } from '../../habits/habitsApi';
import { useAppContext } from '../../../context/AppContext';
import { ScoreGauge } from './ScoreGauge';
import { TelemetryVectors } from './TelemetryVectors';
import { ImmediateQueue } from './ImmediateQueue';

/**
 * Composite Flow Score dashboard presenting real-time telemetry, gauge, vectors, and queue.
 *
 * @returns ScoreWidget JSX element
 */
export const ScoreWidget: FC = () => {
  const { state, invalidateScore } = useAppContext();
  const [scoreData, setScoreData] = useState<ProductivityScore | null>(null);
  const [highTask, setHighTask] = useState<Task | undefined>(undefined);
  const [nextReminder, setNextReminder] = useState<Reminder | undefined>(undefined);
  const [pendingHabit, setPendingHabit] = useState<Habit | undefined>(undefined);

  const loadAll = useCallback(async (): Promise<void> => {
    try {
      const [scoreRes, tasksRes, remindersRes, habitsRes] = await Promise.all([
        fetchScore().catch(() => null),
        fetchTasks().catch(() => []),
        fetchReminders().catch(() => []),
        fetchHabits().catch(() => []),
      ]);
      if (scoreRes) setScoreData(scoreRes);
      setHighTask(tasksRes.find((t) => t.status !== 'done' && t.priority === 'high'));
      setNextReminder(remindersRes.find((r) => !r.acknowledgedAt));
      setPendingHabit(habitsRes.find((h) => !h.completedToday));
    } catch {
      // Keep existing data on network glitch
    }
  }, []);

  useEffect(() => {
    loadAll();
    const timer = setInterval(loadAll, 30000);
    return (): void => clearInterval(timer);
  }, [loadAll, state.scoreRevision]);

  const handleCompleteTask = async (id: number): Promise<void> => {
    await updateTask(id, { status: 'done' });
    invalidateScore();
    loadAll();
  };

  const handleAckReminder = async (id: number): Promise<void> => {
    await acknowledgeReminder(id);
    invalidateScore();
    loadAll();
  };

  const handleLogHabit = async (id: number): Promise<void> => {
    await logHabit(id);
    invalidateScore();
    loadAll();
  };

  const score = scoreData?.score ?? 0;
  const taskRate = scoreData?.breakdown.taskRate ?? 0;
  const reminderRate = scoreData?.breakdown.reminderRate ?? 0;
  const habitRate = scoreData?.breakdown.habitRate ?? 0;

  return (
    <div className={styles.dashboard}>
      <section className={styles.welcomeLedger}>
        <div className={styles.beaconRow}>
          <span className={styles.systemLabel}>// SYSTEM OVERVIEW • TELEMETRY</span>
          <span className={styles.syncTag}>SQLite WAL Sync • Connected</span>
        </div>
        <h1 className={styles.welcomeHeading}>Operational Telemetry</h1>
        <p className={styles.timestampSub}>Realtime Productive Flow Engine</p>
      </section>

      <ScoreGauge
        score={score}
        taskRate={taskRate}
        reminderRate={reminderRate}
        habitRate={habitRate}
      />

      <TelemetryVectors
        taskRate={taskRate}
        reminderRate={reminderRate}
        habitRate={habitRate}
      />

      <ImmediateQueue
        highTask={highTask}
        nextReminder={nextReminder}
        pendingHabit={pendingHabit}
        onCompleteTask={handleCompleteTask}
        onAckReminder={handleAckReminder}
        onLogHabit={handleLogHabit}
      />

      <section className={styles.exportCard}>
        <div className={styles.exportLeft}>
          <div className={styles.exportIcon}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              data_object
            </span>
          </div>
          <div className={styles.exportText}>
            <span className={styles.exportTitle}>Snapshot Payload</span>
            <span className={styles.exportMeta}>Full User State • /api/v1/export</span>
          </div>
        </div>
        <button
          className={styles.exportActionBtn}
          onClick={(): void => { window.location.href = '/api/v1/export'; }}
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            download
          </span>
          <span>JSON</span>
        </button>
      </section>
    </div>
  );
};
