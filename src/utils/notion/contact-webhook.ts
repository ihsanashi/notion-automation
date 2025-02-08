import {
  UpdatePageParameters,
  UpdatePageResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { ChatService } from '@services/chat';

import { logger } from '@utils/logger';
import {
  UserContactRequestParam,
  UserContactResponse,
  WebhookPayload,
} from '@utils/types';

import { createNotionClient } from './client';

export class ContactWebhook {
  private static notion = createNotionClient();

  static async updatePage(
    pageId: string,
    properties: Pick<UpdatePageParameters, 'properties'>
  ): Promise<UpdatePageResponse | null> {
    try {
      const res = await this.notion.pages.update({
        page_id: pageId,
        properties: properties as UpdatePageParameters['properties'],
      });

      logger.info(`Updated page with id ${pageId}`);
      return res;
    } catch (error) {
      logger.error(
        `Failed to call Notion's update page endpoint. Error: ${error}`
      );
      return null;
    }
  }

  static formatContactMethods(
    users: UserContactRequestParam[],
    public_url: string
  ): UserContactResponse[] {
    return users.map((obj) => {
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
  }

  static async insertContactMethods(payload: WebhookPayload): Promise<void> {
    const { data } = payload;
    const { id: pageId, public_url, properties } = data;

    const titleProperty = properties['Name'];
    const itemName =
      titleProperty.type === 'title' ? titleProperty.title[0].plain_text : '';

    try {
      const users = await ChatService.getMatchedUsers(payload);

      if (users.length === 0) {
        await this.updatePage(pageId, {
          properties: {
            'Contact method(s)': {
              files: [],
            },
          },
        });
        logger.info(`Contact methods cleared for page with id ${pageId}`);
        return;
      }

      const contactMethods = this.formatContactMethods(
        users,
        public_url as string
      );

      logger.info(
        `Contact methods generated for page with name "${itemName}" and id ${pageId}, data: ${JSON.stringify(contactMethods)}`
      );

      const response = await this.updatePage(pageId, {
        properties: {
          'Contact method(s)': {
            files: contactMethods,
          },
        },
      });

      if (!response?.object) {
        logger.error(
          `Failed to update page with name "${itemName}" and id ${pageId}`
        );
        return;
      }

      logger.info(
        `Updated page with name "${itemName}" and id ${pageId} with contact method(s).`
      );
    } catch (error) {
      logger.error(
        `Failed to update page with name ${itemName} and id ${pageId}. Error: `,
        error
      );
    }
  }
}
