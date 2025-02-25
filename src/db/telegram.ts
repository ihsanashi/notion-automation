import { and, eq, sql } from 'drizzle-orm';

import * as schema from '@db/schema';

import { logger } from '@utils/logger';

import { db } from '.';

/**
 * Query the database to get Telegram user records with a telegram_chat_id present
 */
export async function getTelegramUsersWithBotChatIds() {
  try {
    const records = await db
      .select({
        id: schema.userPlatformsTable.id,
        nickname: schema.usersTable.nickname,
        metadata: schema.userPlatformsTable.metadata,
      })
      .from(schema.userPlatformsTable)
      .leftJoin(
        schema.platformsTable,
        eq(schema.userPlatformsTable.platform_id, schema.platformsTable.id)
      )
      .leftJoin(
        schema.usersTable,
        eq(schema.userPlatformsTable.user_id, schema.usersTable.id)
      )
      .where(
        and(
          eq(schema.platformsTable.name, 'Telegram'),
          sql`${schema.userPlatformsTable.metadata} ? 'telegram_chat_id'`
        )
      )
      .limit(2);

    logger.info(`Telegram user records: ${JSON.stringify(records)}`);

    return records;
  } catch (error) {
    logger.error(`Error fetching Telegram users, ${error}`);
    throw new Error(`Error fetching Telegram users, ${error}`);
  }
}
