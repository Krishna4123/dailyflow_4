import { FC } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  activeTab: 'score' | 'tasks' | 'reminders' | 'habits';
}

const TAB_TITLES: Record<string, string> = {
  score: 'Overview',
  tasks: 'Tasks',
  reminders: 'Alerts',
  habits: 'Habits',
};

/**
 * Top navigation header with brand logo, telemetry status, export trigger, and profile avatar.
 *
 * @param props - Component props containing the active tab identifier
 * @returns Header JSX element
 */
export const Header: FC<HeaderProps> = ({ activeTab }) => {
  const handleExport = (): void => {
    window.location.href = '/api/v1/export';
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <img src="/logo.png" alt="DailyFlow Logo" className={styles.logo} />
        <div className={styles.titleArea}>
          <div className={styles.titleRow}>
            <span className={styles.title}>DailyFlow</span>
            <span className={styles.activeTag}>// {TAB_TITLES[activeTab]}</span>
          </div>
          <div className={styles.statusRow}>
            <span className={styles.beaconDot} />
            <span className={styles.beaconLabel}>WAL Sync active</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.exportBtn}
          onClick={handleExport}
          title="Export JSON payload"
          aria-label="Export JSON"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            file_download
          </span>
          <span>JSON</span>
        </button>
        <img
          src="/profile.png"
          alt="User Profile"
          className={styles.profileImg}
        />
      </div>
    </header>
  );
};
