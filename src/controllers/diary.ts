import { Request, Response } from 'express';

import { logger } from '@utils/logger';
import { NotionWebhook } from '@utils/notion/webhook';

export class DiaryController {
  static async createTodaysTask(req: Request, res: Response) {
    logger.info('req headers: ', req.headers);
    try {
      await NotionWebhook.createTodaysTask(req);

      logger.info('Webhook processed successfully.');
      res.status(200).json({ success: true, message: 'Webhook processed successfully.' });
    } catch (error) {
      logger.error('Error in DiaryController', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
