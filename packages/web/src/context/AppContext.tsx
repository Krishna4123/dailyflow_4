/**
 * @file AppContext.tsx
 * Shared React Context + useReducer state for DailyFlow.
 *
 * All cross-cutting state (score refresh triggers, loading flags) lives here.
 * Feature modules import useAppContext() to read state or dispatch actions.
 * No Redux. No Zustand. Pure React Context + useReducer.
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';

// ── State shape ───────────────────────────────────────────────────────────────

/**
 * Application-wide state managed by the root reducer.
 */
export interface AppState {
  /**
   * Monotonically increasing counter that signals the ScoreWidget to re-fetch.
   * Increment this after any task, reminder, or habit mutation.
   */
  scoreRevision: number;
  /** Set to true while any API call is in-flight (used by global loading indicator). */
  isLoading: boolean;
  /** Non-null string when a global error banner should be shown. */
  globalError: string | null;
}

const initialState: AppState = {
  scoreRevision: 0,
  isLoading: false,
  globalError: null,
};

// ── Actions ───────────────────────────────────────────────────────────────────

/** Increment the score revision so the ScoreWidget knows to re-fetch. */
interface InvalidateScoreAction {
  type: 'INVALIDATE_SCORE';
}

/** Set the global loading flag. */
interface SetLoadingAction {
  type: 'SET_LOADING';
  payload: boolean;
}

/** Set or clear the global error message. */
interface SetGlobalErrorAction {
  type: 'SET_GLOBAL_ERROR';
  payload: string | null;
}

/** Union of all dispatchable action types. */
export type AppAction =
  | InvalidateScoreAction
  | SetLoadingAction
  | SetGlobalErrorAction;

// ── Reducer ───────────────────────────────────────────────────────────────────

/**
 * Root application reducer.
 *
 * @param state - Current application state
 * @param action - The dispatched action
 * @returns New application state
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INVALIDATE_SCORE':
      return { ...state, scoreRevision: state.scoreRevision + 1 };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_GLOBAL_ERROR':
      return { ...state, globalError: action.payload };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  /** Convenience helper — increments scoreRevision. Call after any data mutation. */
  invalidateScore: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * Wraps the application tree with shared state.
 * Place this at the root of the React tree (in main.tsx or App.tsx).
 *
 * @param props - Must include a `children` ReactNode
 * @returns Provider-wrapped subtree
 */
export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const invalidateScore = useCallback((): void => {
    dispatch({ type: 'INVALIDATE_SCORE' });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, invalidateScore }}>
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns the current AppContext value.
 * Must be called inside a component that is a descendant of AppProvider.
 *
 * @returns AppContextValue containing state, dispatch, and invalidateScore
 * @throws Error if used outside of AppProvider
 */
export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside <AppProvider>');
  }
  return ctx;
}
