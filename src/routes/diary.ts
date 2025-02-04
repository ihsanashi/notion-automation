import express from 'express';

import { DiaryController } from '@controllers/diary';

const router = express.Router();

router.post('/duplicate', DiaryController.createTodaysTask);

export default router;
