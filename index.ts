import express, { Express, Request, Response } from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

import logger from './logger';
import { FileBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

dotenv.config();

const app: Express = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;
const telegramUsername = process.env.TELEGRAM_USERNAME;
const whatsappBaseUrl = 'https://wa.me/';
const telegramBaseUrl = 'https://t.me/';

type ExternalFileBlock = Extract<
  FileBlockObjectResponse['file'],
  { type: 'external' }
>;

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express v5.0 + TypeScript server');
});

app.post('/go-public', async (req: Request, res: Response) => {
  try {
    logger.info(
      'Go public webhook triggered. Payload:\n',
      JSON.stringify(req.body)
    );

    const data = req.body.data;
  } catch (error) {
    logger.error('Error processing webhook: ', error);
  }
});

app.post('/chat-links', async (req: Request, res: Response) => {
  try {
    logger.info(
      'Chat links webhook triggered. Payload:\n',
      JSON.stringify(req.body)
    );

    const data = req.body.data;
    const pageId = data.id;
    const pageUrl = data.url;
    const itemName = data.properties.Name.title[0].plain_text;

    const message = `Hey Ihsan, I'm interested in the item "${itemName}.\n\nLink on Notion: ${pageUrl}"`;
    const encodedMessage = encodeURIComponent(message);

    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    logger.info(`Generated WhatsApp link: ${whatsappLink}`);

    const telegramLink = `https://t.me/${telegramUsername}?text=${encodedMessage}`;
    logger.info(`Generated Telegram link: ${telegramLink}`);

    const linksProperty = data.properties['Files, media & links'];

    const updatedFiles: Array<{
      name: string;
      external: ExternalFileBlock['external'];
    }> = linksProperty.files.filter((file: ExternalFileBlock) => {
      return (
        !file.external.url.startsWith(whatsappBaseUrl) &&
        !file.external.url.startsWith(telegramBaseUrl)
      );
    });

    updatedFiles.push(
      {
        name: 'WhatsApp link',
        external: { url: whatsappLink },
      },
      {
        name: 'Telegram link',
        external: { url: telegramLink },
      }
    );

    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Files, media & links': {
          files: updatedFiles,
        },
      },
    });
  } catch (error) {
    logger.error('Error processing webhook: ', error);
    res.status(500).json({ error: 'Failed to process webhook.' });
  }
});

app.listen(port, () => {
  logger.info(`[server]: Server is running on port ${port}`);
});
