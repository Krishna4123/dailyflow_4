import { FC, useState, useEffect, useCallback } from 'react';
import styles from './HabitTracker.module.css';
import { HabitHeatmap } from './HabitHeatmap';
import { HabitRow } from './HabitRow';
import { NewHabitModal } from './NewHabitModal';
import {
  fetchHabits,
  createHabit,
  logHabit,
  deleteHabit,
  fetchHabitHeatmap,
  Habit,
  HeatmapEntry,
  CreateHabitPayload,
} from '../habitsApi';
import { useAppContext } from '../../../context/AppContext';

/**
 * Habit tracker feature component showing streak banner, matrix heatmap, and daily checklist.
 *
 * @returns HabitTracker JSX element
 */
export const HabitTracker: FC = () => {
  const { invalidateScore } = useAppContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [heatmapEntries, setHeatmapEntries] = useState<HeatmapEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      const data = await fetchHabits();
      setHabits(data);
      if (data.length > 0) {
        const hMap = await fetchHabitHeatmap(data[0].id);
        setHeatmapEntries(hMap);
      }
    } catch {
      // keep existing
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLog = async (id: number): Promise<void> => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: true,
              streak: (h.streak ?? 0) + 1,
            }
          : h
      )
    );
    await logHabit(id);
    invalidateScore();
    loadData();
  };

  const handleDelete = async (id: number): Promise<void> => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    await deleteHabit(id);
    invalidateScore();
  };

  const handleCreate = async (payload: CreateHabitPayload): Promise<void> => {
    const created = await createHabit(payload);
    setHabits((prev) => [created, ...prev]);
    invalidateScore();
    loadData();
  };

  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak ?? 0), 0);
  const loggedTodayCount = habits.filter((h) => !!h.completedToday).length;

  return (
    <div className={styles.container}>
      {/* Section 1: Streak Telemetry Banner */}
      <section className={styles.streakBanner}>
        <div className={styles.bannerTop}>
          <div className={styles.bannerTitle}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              local_fire_department
            </span>
            <span>System Streak Record</span>
          </div>
          <span className={styles.velocityTag}>VELOCITY: 96.4%</span>
        </div>

        <div className={styles.streakNumberRow}>
          <h2 className={styles.streakNum}>
            {maxStreak}
            <span className={styles.streakUnit}>DAYS</span>
          </h2>
          <span className={styles.streakActive}>ACTIVE</span>
        </div>
        <p className={styles.streakSub}>
          Top consistency benchmark recorded across habit stream this cycle.
        </p>

        <div className={styles.progressGrid}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={styles.progressSeg}
              style={{
                backgroundColor:
                  i < (maxStreak % 7 || 7) ? 'var(--secondary)' : 'var(--surface-container-highest)',
              }}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Daily Directive Snapshot */}
      <section className={styles.directiveBanner}>
        <div>
          <span className={styles.directiveTitle}>// DAILY DIRECTIVE</span>
          <h3 className={styles.directiveText}>Precision Over Pace</h3>
        </div>
        <span className={styles.loggedCountTag}>
          LOGGED {loggedTodayCount}/{habits.length}
        </span>
      </section>

      {/* Section 3: 365-Day Activity Density Heatmap */}
      <HabitHeatmap entries={heatmapEntries} />

      {/* Section 4: Habits Checklist */}
      <div className={styles.habitsHeaderRow}>
        <span className={styles.habitsTitle}>// ROUTINE TELEMETRY CHECKLIST</span>
        <button
          className={styles.addHabitBtn}
          onClick={(): void => setIsModalOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            add
          </span>
          <span>Habit</span>
        </button>
      </div>

      <section className={styles.habitList}>
        {habits.map((h) => (
          <HabitRow
            key={h.id}
            habit={h}
            onLog={handleLog}
            onDelete={handleDelete}
          />
        ))}

        {habits.length === 0 && (
          <div className={styles.emptyState}>// No habits initialized</div>
        )}
      </section>

      <NewHabitModal
        isOpen={isModalOpen}
        onClose={(): void => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};
