/**
 * @file App.tsx
 * Root application component for DailyFlow.
 * Renders the navigation header, module tabs, and the ExportButton.
 * Wrapped by AppProvider in main.tsx.
 *
 * @returns The main DailyFlow application layout
 */

import { useState } from 'react';
import { TaskBoard }     from './features/tasks/components/TaskBoard';
import { ReminderList }  from './features/reminders/components/ReminderList';
import { HabitTracker }  from './features/habits/components/HabitTracker';
import { ScoreWidget }   from './features/score/components/ScoreWidget';
import { ExportButton }  from './features/export/components/ExportButton';
import styles from './App.module.css';

type ActiveTab = 'tasks' | 'reminders' | 'habits' | 'score';

const TAB_LABELS: Record<ActiveTab, string> = {
  tasks:     '📝 Tasks',
  reminders: '⏰ Reminders',
  habits:    '🔥 Habits',
  score:     '📊 Score',
};

export default function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>◈</span>
          <h1 className={styles.title}>DailyFlow</h1>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          {(Object.keys(TAB_LABELS) as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              className={`${styles.navBtn} ${activeTab === tab ? styles.active : ''}`}
              onClick={(): void => setActiveTab(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <ExportButton />
        </div>
      </header>

      <main className={styles.main}>
        {activeTab === 'tasks'     && <TaskBoard />}
        {activeTab === 'reminders' && <ReminderList />}
        {activeTab === 'habits'    && <HabitTracker />}
        {activeTab === 'score'     && <ScoreWidget />}
      </main>
    </div>
  );
}
