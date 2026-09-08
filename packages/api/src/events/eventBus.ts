/**
 * @file eventBus.ts
 * Lightweight in-process event bus for DailyFlow.
 *
 * Modules publish domain events after mutations so that cross-cutting
 * concerns (e.g. Productivity Score invalidation) can react without
 * tight coupling between routers.
 *
 * Built on Node's built-in EventEmitter — no external dependencies.
 */

import { EventEmitter } from 'events';

// ── Event name constants ───────────────────────────────────────────────────────

/** Published after a task is created, updated, or deleted. */
export const TASK_CHANGED = 'task:changed' as const;

/** Published after a reminder is created, updated, acknowledged, or deleted. */
export const REMINDER_CHANGED = 'reminder:changed' as const;

/** Published after a habit is created, logged, or deleted. */
export const HABIT_CHANGED = 'habit:changed' as const;

/** Union of all publishable event names. */
export type DailyFlowEvent =
  | typeof TASK_CHANGED
  | typeof REMINDER_CHANGED
  | typeof HABIT_CHANGED;

// ── Singleton emitter ─────────────────────────────────────────────────────────

/**
 * Singleton EventEmitter instance shared across all DailyFlow modules.
 * Import this directly — do not construct new instances.
 *
 * @example
 * // Publishing
 * import { eventBus, TASK_CHANGED } from '../events/eventBus';
 * eventBus.emit(TASK_CHANGED);
 *
 * // Subscribing
 * eventBus.on(TASK_CHANGED, () => { ... });
 */
export const eventBus = new EventEmitter();

// Prevent Node's default "possible memory leak" warning for modules
// that add multiple listeners to the same event.
eventBus.setMaxListeners(20);

// ── Typed helpers ─────────────────────────────────────────────────────────────

/**
 * Publishes a DailyFlow domain event on the shared bus.
 *
 * @param event - The event name to emit (use the exported constants)
 * @returns void
 */
export function publish(event: DailyFlowEvent): void {
  eventBus.emit(event);
}

/**
 * Subscribes a listener to a DailyFlow domain event.
 * Returns an unsubscribe function for easy cleanup.
 *
 * @param event - The event name to subscribe to
 * @param listener - Callback invoked when the event fires
 * @returns A function that removes the listener when called
 */
export function subscribe(event: DailyFlowEvent, listener: () => void): () => void {
  eventBus.on(event, listener);
  return (): void => {
    eventBus.off(event, listener);
  };
}
