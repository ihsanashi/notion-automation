import { generateChatLinks } from '@controllers/chat';
import express from 'express';

const router = express.Router();

router.post('/links', generateChatLinks);

export default router;
