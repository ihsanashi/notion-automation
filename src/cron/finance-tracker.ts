import { CronJob } from 'cron';
import dayjs from 'dayjs';
import 'dotenv/config';
import { Bot } from 'grammy';

import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import { getTelegramUsersWithBotChatIds } from '@db/telegram';

import { logger } from '@utils/logger';

import { createNotionClient } from '../utils/notion/client';

const CRON_SCHEDULE = '0 0 18 * * *'; // 6PM everyday
const CRON_TIMEZONE = 'UTC+8';
const WANTED_PROPERTIES = ['Name', 'Amount', 'Date', 'Note'];

export class FinanceTrackerCronjob {
  private static notion = createNotionClient();
  private static TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  private static EXPENSE_DATABASE_ID = process.env.EXPENSE_DATABASE_ID!;

  /**
   * Retrieve database structure from Notion
   */
  static async retrieveDatabaseProperties() {
    try {
      const res = await this.notion.databases.retrieve({
        database_id: this.EXPENSE_DATABASE_ID,
      });

      logger.info(`Database structure retrieved`);

      return res;
    } catch (error) {
      logger.error(`Error getting properties for Expenses database, ${error}`);
      throw new Error(
        `Error getting properties for Expenses database, ${error}`
      );
    }
  }

  /**
   * Filter the desired properties IDs from the database properties
   */
  static async filterProperties() {
    const db = await this.retrieveDatabaseProperties();

    const propertyIds = Object.entries(db.properties)
      .filter(([key]) => WANTED_PROPERTIES.includes(key))
      .map(([, prop]) => prop.id);

    return propertyIds;
  }

  /**
   * Query Notion for today's expenses
   */
  static async fetchTodaysExpenses() {
    const properties = await this.filterProperties();

    const date = dayjs();
    const formattedDay = date.format('YYYY-MM-DD');

    try {
      const res = await this.notion.databases.query({
        database_id: this.EXPENSE_DATABASE_ID,
        filter_properties: properties,
        filter: {
          or: [
            {
              property: 'Date',
              date: {
                equals: formattedDay,
              },
            },
          ],
        },
        page_size: 5,
        sorts: [
          {
            property: 'Date',
            direction: 'descending',
          },
        ],
      });

      return res;
    } catch (error) {
      logger.error(`Error fetching daily expenses data, ${error}`);
      throw new Error(`Error fetching daily expenses data, ${error}`);
    }
  }

  /**
   * Prepare a bot message based on today's expenses
   */
  static async prepareBotMessage(): Promise<string> {
    try {
      const res = await this.fetchTodaysExpenses();
      const results = res.results as DatabaseObjectResponse[];

      if (!results || results.length === 0) {
        return 'No expenses today? Add new ones if there are any.';
      }

      const count = results.length;

      return count === 1
        ? '1 expense added for today.'
        : `${count} expenses added for today.`;
    } catch (error) {
      logger.error(`Error preparing bot message, ${error}`);
      throw new Error(`Error preparing bot message, ${error}`);
    }
  }

  /**
   * Send a Telegram bot message
   */
  static async sendTelegramBotMessage() {
    try {
      const users = await getTelegramUsersWithBotChatIds();

      if (!users || users.length === 0) {
        logger.info('No Telegram users found; skipping sending messages.');
        return;
      }

      const body = await this.prepareBotMessage();

      const bot = new Bot(this.TELEGRAM_BOT_TOKEN);

      for (const user of users) {
        const metadata = user.metadata as Record<string, string | number>;
        const chatId = metadata['telegram_chat_id'];

        try {
          const res = await bot.api.sendMessage(chatId, body);

          if (res.message_id) {
            logger.info(`Message sent successfully to ${user.nickname}`);
          }
        } catch (error) {
          logger.error(`Failed to send message to chat_id ${chatId}: ${error}`);
          throw new Error(
            `Failed to send message to chat_id ${chatId}: ${error}`
          );
        }
      }
    } catch (error) {
      logger.error(`Error sending message with Telegram bot, ${error}`);
      throw new Error(`Error sending message with Telegram bot, ${error}`);
    }
  }

  /**
   * Schedule a cron job to send the Telegram bot message
   */
  static scheduleCronjob() {
    CronJob.from({
      cronTime: CRON_SCHEDULE,
      onTick: async () => {
        await this.sendTelegramBotMessage();
      },
      onComplete: null,
      start: true,
      timeZone: CRON_TIMEZONE,
    });
  }

  /**
   * Main function to initialize the cron job
   */
  static async main() {
    this.scheduleCronjob();
  }
}
