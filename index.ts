import express, { Express, Request, Response } from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

import logger from './logger';

dotenv.config();

const app: Express = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express v5.0 + TypeScript server');
});

app.post('/webhook', async (req: Request, res: Response) => {
  try {
    logger.info('Received webhook: ', JSON.stringify(req.body));

    const data = req.body.data;
    const pageId = data.id;
    const pageUrl = data.url;
    const itemName = data.properties.Name.title[0].plain_text;

    const message = `Hey Ihsan, I'm interested in the item ${itemName}.\n\nLink on Notion: ${pageUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    logger.info(`Generated WhatsApp link: ${whatsappLink}`);

    // await notion.pages.update({
    //   page_id: pageId,
    // });
  } catch (error) {
    logger.error('Error processing webhook: ', error);
    res.status(500).json({ error: 'Failed to process webhook.' });
  }
});

app.listen(port, () => {
  logger.info(`[server]: Server is running on port ${port}`);
});
