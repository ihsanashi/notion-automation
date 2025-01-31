import { logger } from '@utils/logger';
import { WebhookPayload } from '@utils/types';

import { createNotionClient } from './client';

export class NotionWebhook {
  static async insertContactMethods(payload: WebhookPayload, userLinks: any) {
    const { data } = payload;
    const { id: pageId, public_url, properties } = data;

    try {
      const notion = createNotionClient();

      const response = await notion.pages.update({
        page_id: pageId,
        properties: {
          'Contact method(s)': {
            files: userLinks,
          },
        },
      });

      if (!response.id) {
        logger.error(`Failed to update page with name of // name here and id ${pageId}.`);
        return;
      }

      logger.info(`Updated page with /name/ and id ${pageId} with contact method(s).`);
    } catch (error) {
      logger.error(`Failed to update page ${pageId}: `, error);
    }
  }
}
