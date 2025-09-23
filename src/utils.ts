// Utility functions

export function rand(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateId(): string {
  try {
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // Fallback for environments without crypto.randomUUID
  }
  return 'id-' + Math.random().toString(36).slice(2);
}

export function formatScore(score: number): string {
  return `Score: ${Math.round(score)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}