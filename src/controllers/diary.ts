import { Request, Response } from 'express';

import { logger } from '@utils/logger';
import { DiaryWebhook } from '@utils/notion/diary-webhook';

export class DiaryController {
  static async createTodaysTask(req: Request, res: Response) {
    try {
      await DiaryWebhook.createTodaysTask();

      logger.info('Webhook processed successfully.');
      res
        .status(200)
        .json({ success: true, message: 'Webhook processed successfully.' });
    } catch (error) {
      logger.error('Error in DiaryController', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
