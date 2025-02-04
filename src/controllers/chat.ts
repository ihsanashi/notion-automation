import { Request, Response } from 'express';

import { logger } from '@utils/logger';
import { NotionWebhook } from '@utils/notion/webhook';
import { WebhookPayload } from '@utils/types';

export class ChatController {
  static async generateChatLinks(req: Request, res: Response) {
    try {
      const payload: WebhookPayload = req.body;
      const { data } = payload;
      const { properties } = data;

      const titleProperty = properties['Name'];
      const title = titleProperty.type === 'title' ? titleProperty.title?.[0].plain_text : null;

      const contactPersonsProperty = properties['Contact person(s)'];
      const contactPersons = contactPersonsProperty.type === 'people' ? contactPersonsProperty.people : [];

      if (!title || contactPersons.length === 0) {
        logger.info('Title or contact person(s) are empty. Exiting...');
        res.status(400).json({ message: 'Title or contact person(s) are empty. Exiting...' });
      }

      await NotionWebhook.insertContactMethods(req.body);

      logger.info('Webhook processed successfully');
      res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    } catch (error) {
      logger.error('Error in ChatController', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
