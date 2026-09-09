import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AppProvider } from './context/AppContext';

// Mock global fetch for unit tests
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: null, error: null }),
  })
);

describe('App Smoke Test', () => {
  it('renders DailyFlow brand header and navigation elements', () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    expect(screen.getByText('DailyFlow')).toBeDefined();
    expect(screen.getByText('Score')).toBeDefined();
    expect(screen.getByText('Tasks')).toBeDefined();
    expect(screen.getByText('Alerts')).toBeDefined();
    expect(screen.getByText('Habits')).toBeDefined();
  });
});
