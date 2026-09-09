export interface ProductivityScore {
  score: number;
  taskCompletionRate: number;
  reminderAckRate: number;
  habitConsistencyRate: number;
  breakdown: {
    taskRate: number;
    reminderRate: number;
    habitRate: number;
  };
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetches the current user's productivity score and sub-rate breakdown.
 *
 * @returns Promise resolving to ProductivityScore data
 */
export async function fetchScore(): Promise<ProductivityScore> {
  const res = await fetch('/api/v1/score');
  if (!res.ok) {
    throw new Error(`Failed to fetch score: ${res.statusText}`);
  }
  const json = (await res.json()) as ApiResponse<ProductivityScore>;
  if (json.error || !json.data) {
    throw new Error(json.error ?? 'Unknown error fetching score');
  }
  return json.data;
}
