import dayjs from 'dayjs';
import dotenv from 'dotenv';

import {
  BlockObjectRequest,
  CreatePageParameters,
  CreatePageResponse,
  DatabaseObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { logger } from '@utils/logger';

import { createNotionClient } from './client';

dotenv.config();

export class DiaryWebhook {
  private static notion = createNotionClient();
  private static endavaDiariesDatabaseId =
    process.env.ENDAVA_WORK_DIARIES_DATABASE_ID!;

  /**
   * Query the most recent diary pages from the Notion database,
   * @returns the most recent page
   */
  static async getMostRecentDiary(): Promise<DatabaseObjectResponse | null> {
    try {
      const pages = await this.notion.databases.query({
        database_id: this.endavaDiariesDatabaseId,
        page_size: 5,
        sorts: [
          {
            property: 'Entry date',
            direction: 'descending',
          },
        ],
      });

      if (!pages.results || pages.results.length === 0) {
        logger.error(
          'Failed to query the Work Diaries database or no pages found.'
        );
        return null;
      }

      return pages.results[0] as DatabaseObjectResponse;
    } catch (error) {
      logger.error(
        `Error in calling the Notion database query endpoint. Error: ${error}`
      );
      return null;
    }
  }

  /**
   * Check if there is an existing diary for today
   * @returns boolean
   */
  static diaryExistsForToday(diary: DatabaseObjectResponse) {
    const entryDateProp = diary.properties['Entry date'];

    if (
      !entryDateProp ||
      entryDateProp.type !== 'date' ||
      !entryDateProp.date
    ) {
      logger.error('The Entry date property is not a valid date property.');
      return false;
    }

    const today = dayjs();

    return today.isSame(entryDateProp.date.start, 'day');
  }

  /**
   * Retrieve all blocks for a given page ID
   */
  static async getDiaryBlocks(
    pageId: string
  ): Promise<BlockObjectRequest[] | null> {
    try {
      const blocks = await this.notion.blocks.children.list({
        block_id: pageId,
      });

      if (!blocks.results) {
        logger.error(`Failed to fetch blocks for page ID ${pageId}`);
        return null;
      }

      return blocks.results as BlockObjectRequest[];
    } catch (error) {
      logger.error(
        `Error in calling Notion's retrieve block children endpoint. Error: ${error}`
      );
      return null;
    }
  }

  /**
   * Create a new diary page for today
   */
  static async createTodaysDiary(
    params: Pick<CreatePageParameters, 'properties' | 'children'>
  ): Promise<CreatePageResponse | null> {
    const today = dayjs();

    try {
      const diary = await this.notion.pages.create({
        parent: {
          type: 'database_id',
          database_id: this.endavaDiariesDatabaseId,
        },
        properties: {
          ...params.properties,
          Name: {
            title: [
              {
                text: {
                  content: today.format('dddd, DD MMMM'),
                },
              },
            ],
          },
        },
        children: params.children,
      });

      return diary;
    } catch (error) {
      logger.error(
        `Error in calling Notion's create page endpoint. Error: ${error}`
      );
      return null;
    }
  }

  /**
   * Main function for creating today's diary entry
   */
  static async createTodaysTask(): Promise<void> {
    try {
      // 1. Get the most recent diary page
      const mostRecentDiary = await this.getMostRecentDiary();
      if (!mostRecentDiary) return;

      // 2. Check if an entry for today already exists
      if (this.diaryExistsForToday(mostRecentDiary)) {
        logger.info('An entry for today already exists. Exiting early.');
        return;
      }

      // 3. Get the blocks from the most recent diary
      const pageId = mostRecentDiary.id;
      const blocks = await this.getDiaryBlocks(pageId);
      if (!blocks) return;

      // 4. Prepare properties for new diary entry
      const { properties } = mostRecentDiary;
      const newDiaryProperties = { ...properties };
      delete newDiaryProperties['Name'];

      // 5. Create today's diary page
      const params = {
        properties: newDiaryProperties,
        children: blocks,
      };

      const todaysDiary = await this.createTodaysDiary(params);

      if (!todaysDiary?.object) {
        logger.error(
          `Failed to create today's diary in database with id ${this.endavaDiariesDatabaseId}. Error: ${todaysDiary}`
        );
        return;
      }

      logger.info(
        `Created today's diary in database with id ${this.endavaDiariesDatabaseId} and page id ${todaysDiary.id}`
      );
    } catch (error) {
      logger.error(`Error creating today's diary. Error: ${error}`);
    }
  }
}
