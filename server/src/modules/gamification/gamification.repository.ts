import { query } from '../../db/database.js';
import type { ActivityDayRecord } from './gamification.types.js';

export async function recordActivityDay(
  userId: string,
  activityDate: string,
): Promise<void> {
  await query(
    `insert into user_activity_days (user_id, activity_date)
     values ($1, $2)
     on conflict (user_id, activity_date) do nothing`,
    [userId, activityDate],
  );
}

export async function findActivityDays(userId: string): Promise<ActivityDayRecord[]> {
  const { rows } = await query<ActivityDayRecord>(
    `select activity_date
     from user_activity_days
     where user_id = $1
     order by activity_date desc`,
    [userId],
  );

  return rows;
}
