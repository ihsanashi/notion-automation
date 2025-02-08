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
        await notion.pages.update({
          page_id: pageId,
          properties: {
            'Contact method(s)': {
              files: [],
            },
          },
        });
        logger.info(`Contact methods for page with name "${itemName}" and id ${pageId} are cleared.`);
        return;
      }

      const contactMethods = users.map((obj) => {
        const name = obj.nickname || obj.name;
        const message = `Hey ${name}, I am interested in this item.\n\nLink on Notion: ${public_url}`;
        const encodedMessage = encodeURIComponent(message);

        const linkTitle = `${name}@${obj.platform_name}`;
        const chatUrl = `${obj.base_url}/${obj.identifier}?text=${encodedMessage}`;

        return {
          name: linkTitle,
          external: { url: chatUrl },
        };
      });

      logger.info(
        `Contact methods generated for page with name "${itemName}" and id ${pageId}, data: ${JSON.stringify(contactMethods)}`
      );

      const response = await notion.pages.update({
        page_id: pageId,
        properties: {
          'Contact method(s)': {
            files: contactMethods,
          },
        },
      });

      if (!response.id) {
        logger.error(`Failed to update page with name "${itemName}" and id ${pageId}.`);
        return;
      }

      logger.info(`Updated page with name "${itemName}" and id ${pageId} with contact method(s).`);
    } catch (error) {
      logger.error(`Failed to update page with name ${itemName} and id ${pageId}. Error: `, error);
    }
  }
}
