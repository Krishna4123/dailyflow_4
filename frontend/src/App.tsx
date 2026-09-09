import { FC, useState, useEffect } from 'react';
import './styles/theme.css';
import styles from './App.module.css';
import { Header } from './components/Header/Header';
import { Navigation, ActiveTab } from './components/Navigation/Navigation';
import { TaskBoard } from './features/tasks/components/TaskBoard';
import { ReminderList } from './features/reminders/components/ReminderList';
import { HabitTracker } from './features/habits/components/HabitTracker';
import { ScoreWidget } from './features/score/components/ScoreWidget';
import { useAppContext } from './context/AppContext';
import { fetchTasks } from './features/tasks/tasksApi';
import { fetchReminders } from './features/reminders/remindersApi';
import { fetchHabits } from './features/habits/habitsApi';
import { fetchScore } from './features/score/scoreApi';

/**
 * Root DailyFlow application layout integrating Telemetry Command design and navigation.
 *
 * @returns Root App JSX element
 */
const App: FC = () => {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState<ActiveTab>('score');
  const [taskCount, setTaskCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [scoreVal, setScoreVal] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const updateBadges = async (): Promise<void> => {
      try {
        const [tasks, reminders, habits, score] = await Promise.all([
          fetchTasks().catch(() => []),
          fetchReminders().catch(() => []),
          fetchHabits().catch(() => []),
          fetchScore().catch(() => null),
        ]);
        if (!isMounted) return;
        setTaskCount(tasks.filter((t) => t.status !== 'done').length);
        setReminderCount(reminders.filter((r) => !r.acknowledgedAt).length);
        const maxS = habits.reduce((max, h) => Math.max(max, h.streak ?? 0), 0);
        setStreakCount(maxS);
        if (score) setScoreVal(score.score);
      } catch {
        // preserve badge state
      }
    };

    updateBadges();
    return (): void => {
      isMounted = false;
    };
  }, [state.scoreRevision, activeTab]);

  return (
    <div className={styles.app}>
      <Header activeTab={activeTab} />

      <main className={styles.main}>
        {activeTab === 'score' && <ScoreWidget />}
        {activeTab === 'tasks' && <TaskBoard />}
        {activeTab === 'reminders' && <ReminderList />}
        {activeTab === 'habits' && <HabitTracker />}
      </main>

      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        taskCount={taskCount}
        reminderCount={reminderCount}
        streakCount={streakCount}
        scoreValue={scoreVal}
      />
    </div>
  );
};

export default App;
