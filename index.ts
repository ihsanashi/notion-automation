import express, { Express, Request, Response } from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
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
    const content = req.body;
    console.log('req: ', JSON.stringify(req));
    console.log('res: ', JSON.stringify(res));
    // const pageId = content.id;
    // const pageUrl = content.url;
    // const itemName = content.properties.Title.title[0].plain_text;

    // const message = `Hey Ihsan, I'm interested in the item ${itemName}.\n\nLink on Notion: ${pageUrl}`;
    // const encodedMessage = encodeURIComponent(message);
    // const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // console.log('whatsappLink: ', whatsappLink);

    // await notion.pages.update({
    //   page_id: pageId,
    // });
  } catch (error) {
    console.error('Error processing webhook: ', error);
    res.status(500).json({ error: 'Failed to process webhook.' });
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});
