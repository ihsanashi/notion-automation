import express from 'express';

import { ChatController } from '@controllers/chat';

const router = express.Router();

router.post('/links', ChatController.generateChatLinks);

export default router;
