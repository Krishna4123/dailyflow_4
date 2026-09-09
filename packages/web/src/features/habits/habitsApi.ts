export interface Habit {
  id: number;
  userId: number;
  name: string;
  category: string;
  frequency: string;
  createdAt: string;
  streak?: number;
  completedToday?: boolean;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface CreateHabitPayload {
  name: string;
  category?: string;
  frequency?: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetches all habits with current streak and today's status.
 *
 * @returns Promise resolving to list of habits
 */
export async function fetchHabits(): Promise<Habit[]> {
  const res = await fetch('/api/v1/habits');
  if (!res.ok) throw new Error('Failed to fetch habits');
  const json = (await res.json()) as ApiResponse<Habit[]>;
  return json.data ?? [];
}

/**
 * Creates a new habit.
 *
 * @param payload - Habit creation payload
 * @returns Promise resolving to created habit
 */
export async function createHabit(payload: CreateHabitPayload): Promise<Habit> {
  const res = await fetch('/api/v1/habits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create habit');
  const json = (await res.json()) as ApiResponse<Habit>;
  if (json.error || !json.data) throw new Error(json.error ?? 'Failed to create habit');
  return json.data;
}

/**
 * Logs completion for a habit today.
 *
 * @param id - Habit ID
 * @param completedOn - Optional ISO date string YYYY-MM-DD
 * @returns Promise resolving to log response
 */
export async function logHabit(id: number, completedOn?: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/v1/habits/${id}/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completedOn }),
  });
  if (!res.ok) throw new Error('Failed to log habit');
  const json = (await res.json()) as ApiResponse<{ success: boolean }>;
  return json.data ?? { success: true };
}

/**
 * Fetches 365-day heatmap data for a habit.
 *
 * @param id - Habit ID
 * @returns Promise resolving to array of date-count entries
 */
export async function fetchHabitHeatmap(id: number): Promise<HeatmapEntry[]> {
  const res = await fetch(`/api/v1/habits/${id}/heatmap`);
  if (!res.ok) throw new Error('Failed to fetch habit heatmap');
  const json = (await res.json()) as ApiResponse<HeatmapEntry[]>;
  return json.data ?? [];
}

/**
 * Deletes a habit.
 *
 * @param id - Habit ID
 * @returns Promise resolving when deleted
 */
export async function deleteHabit(id: number): Promise<void> {
  const res = await fetch(`/api/v1/habits/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete habit');
}
