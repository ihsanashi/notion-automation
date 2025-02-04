import { ChatService } from '@services/chat';

import { logger } from '@utils/logger';
import { WebhookPayload } from '@utils/types';

import { createNotionClient } from './client';

export class NotionWebhook {
  static async insertContactMethods(payload: WebhookPayload) {
    const { data } = payload;
    const { id: pageId, public_url, properties } = data;

    const titleProperty = properties['Name'];
    const itemName = titleProperty.type === 'title' ? titleProperty.title[0].plain_text : '';

    const notion = createNotionClient();

    try {
      const users = await ChatService.getMatchedUsers(payload);

      if (users.length === 0) {
        logger.info('No matching users found. Skipping Notion update.');
        return;
      }

      const contactMethods = users.map((obj) => {
        const greeting = `Hey ${obj.nickname}`;
        const body = `${itemName ? `I'm interested in the item "${itemName}"` : "I'm interested in an item."}`;
        const notionLink = `Link on Notion: ${public_url}`;
        const message = `${greeting}, ${body}.\n\n${notionLink}`;
        const encodedMessage = encodeURIComponent(message);

        return {
          name: `Chat on ${obj.platform_name}`,
          external: { url: `${obj.base_url}/${obj.identifier}?text=${encodedMessage}` },
        };
      });

      logger.info(`Contact methods generated for page id ${pageId}, data: ${contactMethods}`);

      const response = await notion.pages.update({
        page_id: pageId,
        properties: {
          'Contact method(s)': {
            files: contactMethods,
          },
        },
      });

      if (!response.id) {
        logger.error(`Failed to update page with name ${itemName} and id ${pageId}.`);
        return;
      }

      logger.info(`Updated page with ${itemName} and id ${pageId} with contact method(s).`);
    } catch (error) {
      logger.error(`Failed to update page ${pageId}: `, error);
    }
  }
}
