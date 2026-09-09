export type Status = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'health';

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  category: Category;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  category?: Category;
  dueDate?: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetches all tasks for the current user.
 *
 * @returns Promise resolving to list of tasks
 */
export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/v1/tasks');
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const json = (await res.json()) as ApiResponse<Task[]>;
  return json.data ?? [];
}

/**
 * Creates a new task.
 *
 * @param payload - Task payload to create
 * @returns Promise resolving to created task
 */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch('/api/v1/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create task');
  const json = (await res.json()) as ApiResponse<Task>;
  if (json.error || !json.data) throw new Error(json.error ?? 'Failed to create task');
  return json.data;
}

/**
 * Updates a task.
 *
 * @param id - Task ID
 * @param updates - Fields to update
 * @returns Promise resolving to updated task
 */
export async function updateTask(id: number, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`/api/v1/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update task');
  const json = (await res.json()) as ApiResponse<Task>;
  if (json.error || !json.data) throw new Error(json.error ?? 'Failed to update task');
  return json.data;
}

/**
 * Deletes a task.
 *
 * @param id - Task ID
 * @returns Promise resolving when deleted
 */
export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
}
