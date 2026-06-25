import * as gamificationRepo from './gamification.repository.js';
import type { GamificationSummary } from './gamification.types.js';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
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

  // Set lookup lets us ask "was this exact day active?" while counting backward.
  const daySet = new Set(days);
  const today = todayIso();
  const yesterday = addDays(today, -1);
  const lastActiveDate = days[0] ?? null;

  let currentStreak = 0;
  let cursor: string;

  if (daySet.has(today)) {
    cursor = today;
  } else if (daySet.has(yesterday)) {
    // Keep the streak alive during the current day until the user gets a chance to log.
    cursor = yesterday;
  } else {
    cursor = '';
  }

  while (cursor && daySet.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  let longestStreak = 0;
  let running = 0;
  let previous: string | null = null;

  // Longest streak is easiest oldest-to-newest: gaps reset the running count.
  for (const day of [...days].reverse()) {
    if (previous === null || day === addDays(previous, 1)) {
      running += 1;
    } else {
      running = 1;
    }

    longestStreak = Math.max(longestStreak, running);
    previous = day;
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
