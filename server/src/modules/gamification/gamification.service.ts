import * as gamificationRepo from './gamification.repository.js';
import type { GamificationSummary } from './gamification.types.js';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function toIsoDate(value: Date | string): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const cursor = new Date(`${date}T00:00:00.000Z`);
  cursor.setUTCDate(cursor.getUTCDate() + days);

  return cursor.toISOString().slice(0, 10);
}

function startOfMonth(): string {
  return `${todayIso().slice(0, 7)}-01`;
}

export async function recordActivity(userId: string, date = todayIso()): Promise<void> {
  await gamificationRepo.recordActivityDay(userId, date);
}

export async function getSummary(userId: string): Promise<GamificationSummary> {
  const rows = await gamificationRepo.findActivityDays(userId);
  const days = rows.map((row) => toIsoDate(row.activity_date));
  const daySet = new Set(days);

  const today = todayIso();
  const yesterday = addDays(today, -1);
  const lastActiveDate = days[0] ?? null;

  let currentStreak = 0;
  let cursor = daySet.has(today) ? today : daySet.has(yesterday) ? yesterday : '';

  while (cursor && daySet.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  let longestStreak = 0;
  let runningStreak = 0;
  let previousDay: string | null = null;

  for (const day of [...days].sort()) {
    if (previousDay === null || day === addDays(previousDay, 1)) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(longestStreak, runningStreak);
    previousDay = day;
  }

  const monthStart = startOfMonth();
  const activeDaysThisMonth = days.filter((day) => day >= monthStart && day <= today).length;

  return {
    currentStreak,
    longestStreak,
    activeDaysThisMonth,
    lastActiveDate,
  };
}
