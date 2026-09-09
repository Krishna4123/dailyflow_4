import { FC } from 'react';
import styles from './Navigation.module.css';

export type ActiveTab = 'score' | 'tasks' | 'reminders' | 'habits';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  taskCount?: number;
  reminderCount?: number;
  streakCount?: number;
  scoreValue?: number;
}

/**
 * Bottom / tab navigation with icons, active indicators, and real-time count badges.
 *
 * @param props - Component props
 * @returns Navigation JSX element
 */
export const Navigation: FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  taskCount = 0,
  reminderCount = 0,
  streakCount = 0,
  scoreValue = 0,
}) => {
  return (
    <nav className={styles.navContainer} aria-label="Main Navigation">
      <button
        className={`${styles.navItem} ${activeTab === 'score' ? styles.activeItem : ''}`}
        onClick={(): void => onChangeTab('score')}
        type="button"
      >
        <div className={styles.iconWrapper}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            monitoring
          </span>
          <span className={styles.badge}>{scoreValue > 0 ? Math.round(scoreValue) : '--'}</span>
        </div>
        <span className={styles.label}>Score</span>
      </button>

      <button
        className={`${styles.navItem} ${activeTab === 'tasks' ? styles.activeItem : ''}`}
        onClick={(): void => onChangeTab('tasks')}
        type="button"
      >
        <div className={styles.iconWrapper}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            view_kanban
          </span>
          <span className={styles.badge}>{taskCount}</span>
        </div>
        <span className={styles.label}>Tasks</span>
      </button>

      <button
        className={`${styles.navItem} ${activeTab === 'reminders' ? styles.activeItem : ''}`}
        onClick={(): void => onChangeTab('reminders')}
        type="button"
      >
        <div className={styles.iconWrapper}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            alarm
          </span>
          <span className={styles.badge}>{reminderCount}</span>
        </div>
        <span className={styles.label}>Alerts</span>
      </button>

      <button
        className={`${styles.navItem} ${activeTab === 'habits' ? styles.activeItem : ''}`}
        onClick={(): void => onChangeTab('habits')}
        type="button"
      >
        <div className={styles.iconWrapper}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            local_fire_department
          </span>
          <span className={styles.badge}>{streakCount}d</span>
        </div>
        <span className={styles.label}>Habits</span>
      </button>
    </nav>
  );
};
