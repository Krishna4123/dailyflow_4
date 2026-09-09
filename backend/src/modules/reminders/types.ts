/**
 * @file types.ts
 * TypeScript interfaces for the Reminder Engine module.
 */

/** Area of life the reminder belongs to. */
export type ReminderCategory = 'work' | 'personal' | 'health';

/** Optional recurrence pattern; null means one-off. */
export type ReminderRecurrence = 'daily' | 'weekly' | null;

/**
 * A single reminder record as stored in (and returned from) the database.
 */
export interface Reminder {
  /** Auto-incremented primary key */
  id: number;
  /** FK → users.id */
  userId: number;
  /** Short description of what the reminder is for */
  label: string;
  /** Area of life */
  category: ReminderCategory;
  /** ISO 8601 datetime at which the reminder fires */
  triggerAt: string;
  /** Optional repeat schedule; null for one-off reminders */
  recurrence: ReminderRecurrence;
  /** ISO 8601 timestamp set when the user acknowledges the reminder; null until then */
  acknowledgedAt: string | null;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 last-updated timestamp */
  updatedAt: string;
}

/**
 * Fields accepted when creating a new reminder.
 */
export interface CreateReminderInput {
  userId: number;
  label: string;
  category?: ReminderCategory;
  triggerAt: string;
  recurrence?: ReminderRecurrence;
}

/**
 * Fields accepted when updating an existing reminder.
 * All fields are optional — only provided fields are changed.
 */
export interface UpdateReminderInput {
  label?: string;
  category?: ReminderCategory;
  triggerAt?: string;
  recurrence?: ReminderRecurrence;
}
