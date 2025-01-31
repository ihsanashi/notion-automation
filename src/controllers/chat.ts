import dotenv from 'dotenv';
import { Request, Response } from 'express';

import { ChatService } from '@services/chat';

import { logger } from '@utils/logger';
import { createNotionClient } from '@utils/notion/client';
import { FileType, PeopleType, TitleType, WebhookPayload } from '@utils/types';

export class ChatController {
  static async generateChatLinks(req: Request, res: Response) {
    try {
      const result = await ChatService.getMatchedPeople(req.body);
      res.status(200).json({ result, success: true });
    } catch (error) {
      logger.error('Error in ChatController', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
