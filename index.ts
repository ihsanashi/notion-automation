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

app.post('/chat-links', async (req: Request, res: Response) => {
  try {
    logger.info(
      'Chat links webhook triggered. Payload:\n',
      JSON.stringify(req.body)
    );

    const data = req.body.data;
    const pageId = data.id;
    const publicUrl = data.public_url;
    const itemName = data.properties.Name.title[0].plain_text;

    const message = `Hey Ihsan, I'm interested in the item "${itemName}".\n\nLink on Notion: ${publicUrl}`;
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
        name: 'Chat on WhatsApp',
        external: { url: whatsappLink },
      },
      {
        name: 'Chat on Telegram',
        external: { url: telegramLink },
      }
    );

    const updatePageResponse = await notion.pages.update({
      page_id: pageId,
      properties: {
        'Files, media & links': {
          files: updatedFiles,
        },
      },
    });

    if (!updatePageResponse.id) {
      logger.error(
        `Failed to update the page with a name of ${itemName} and id ${pageId}.`
      );
      res.status(500).json({ error: 'Failed to update the page in Notion.' });
    }

    logger.info(
      `Updated page with name of ${itemName} and id ${pageId} with the WhatsApp and Telegram links.`
    );

    // add comment in page
    const commentResponse = await notion.comments.create({
      parent: { page_id: pageId },
      rich_text: [
        {
          type: 'text',
          text: {
            content: `WhatsApp link successfully added: ${whatsappLink}`,
          },
        },
        {
          type: 'text',
          text: {
            content: `Telegram link successfully added: ${telegramLink}`,
          },
        },
      ],
    });

    if (!commentResponse.id) {
      logger.error(
        `Failed to add comment(s) to the page of name ${itemName} and id ${pageId}`
      );
      res.status(500).json({ error: `Failed to add comment(s) in Notion.` });
    }

    logger.info(
      `Comment(s) added to the page with name of ${itemName} and id ${pageId}.`
    );
    res
      .status(200)
      .send(
        `Webhook processed, page updated, and comment(s) added. Page name ${itemName} and id ${pageId}.`
      );
  } catch (error) {
    logger.error('Error processing webhook: ', error);
    res.status(500).json({ error: 'Failed to process webhook.' });
  }
});

app.listen(port, () => {
  logger.info(`[server]: Server is running on port ${port}`);
});
