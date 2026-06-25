export interface ActivityDayRecord {
  activity_date: Date;
}

export interface GamificationSummary {
  currentStreak: number;
  longestStreak: number;
  activeDaysThisMonth: number;
  lastActiveDate: string | null;
}
