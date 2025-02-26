import 'dotenv/config';
import express, { Express, Request, Response } from 'express';

import chatRoutes from '@routes/chat';
import diaryRoutes from '@routes/diary';

import { logger } from '@utils/logger';

const app: Express = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Express v5.0 + TypeScript server');
});

app.use('/chat', chatRoutes);
app.use('/diary', diaryRoutes);

app.listen(port, () => {
  logger.info(`[server]: Server is running on port ${port}`);
});
