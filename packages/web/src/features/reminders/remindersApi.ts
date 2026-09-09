export interface Reminder {
  id: number;
  userId: number;
  label: string;
  category: string;
  triggerAt: string;
  recurrence?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface CreateReminderPayload {
  label: string;
  category?: string;
  triggerAt: string;
  recurrence?: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetches all reminders for the current user.
 *
 * @returns Promise resolving to list of reminders
 */
export async function fetchReminders(): Promise<Reminder[]> {
  const res = await fetch('/api/v1/reminders');
  if (!res.ok) throw new Error('Failed to fetch reminders');
  const json = (await res.json()) as ApiResponse<Reminder[]>;
  return json.data ?? [];
}

/**
 * Creates a new reminder.
 *
 * @param payload - Reminder creation data
 * @returns Promise resolving to created reminder
 */
export async function createReminder(payload: CreateReminderPayload): Promise<Reminder> {
  const res = await fetch('/api/v1/reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create reminder');
  const json = (await res.json()) as ApiResponse<Reminder>;
  if (json.error || !json.data) throw new Error(json.error ?? 'Failed to create reminder');
  return json.data;
}

/**
 * Acknowledges a reminder.
 *
 * @param id - Reminder ID
 * @returns Promise resolving to acknowledged reminder
 */
export async function acknowledgeReminder(id: number): Promise<Reminder> {
  const res = await fetch(`/api/v1/reminders/${id}/acknowledge`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to acknowledge reminder');
  const json = (await res.json()) as ApiResponse<Reminder>;
  if (json.error || !json.data) throw new Error(json.error ?? 'Failed to acknowledge reminder');
  return json.data;
}

/**
 * Deletes a reminder.
 *
 * @param id - Reminder ID
 * @returns Promise resolving when deleted
 */
export async function deleteReminder(id: number): Promise<void> {
  const res = await fetch(`/api/v1/reminders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete reminder');
}
