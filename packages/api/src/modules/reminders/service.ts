/**
 * @file service.ts
 * Pure business logic for the Reminder Engine module.
 * No database calls — receives data from the repository layer.
 */

import type { Reminder } from './types';

/**
 * Computes the fraction of due reminders that have been acknowledged.
 * Returns exactly 0 when there are no due reminders (never NaN or Infinity).
 *
 * Due = reminders whose triggerAt is in the past (trigger_at <= now).
 * Acknowledged = due reminders with a non-null acknowledgedAt.
 *
 * @param dueReminders - Reminders whose triggerAt <= now
 * @returns A number in [0, 1] representing the acknowledgement rate
 */
export function computeReminderAckRate(dueReminders: Reminder[]): number {
  if (dueReminders.length === 0) return 0;
  const acknowledged = dueReminders.filter((r) => r.acknowledgedAt !== null).length;
  return acknowledged / dueReminders.length;
}

/**
 * Validates that a recurrence value is one of the accepted enum members or null.
 *
 * @param value - The value to validate
 * @returns true if the value is a valid ReminderRecurrence
 */
export function isValidRecurrence(value: unknown): value is Reminder['recurrence'] {
  return value === null || value === 'daily' || value === 'weekly';
}

/**
 * Validates that a reminder category value is one of the accepted enum members.
 *
 * @param value - The string to validate
 * @returns true if the value is a valid ReminderCategory
 */
export function isValidReminderCategory(value: string): value is Reminder['category'] {
  return ['work', 'personal', 'health'].includes(value);
}
